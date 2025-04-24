"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { MessageLoading } from "./MessageLoading"
import { useChatSession } from "@/contexts/ChatSessionContext"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { TicketForm } from "./TicketForm"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

export function ChatWindow() {
  const { currentSession, startNewSession: originalStartNewSession, clearCurrentSession: originalClearCurrentSession } = useChatSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [isXumoPlayIssue, setIsXumoPlayIssue] = useState(false)
  const [troubleshootingAttempted, setTroubleshootingAttempted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageCounter = useRef(0)

  const generateUniqueId = useCallback(() => {
    messageCounter.current += 1
    return `${Date.now()}-${messageCounter.current}`
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const addWelcomeMessage = useCallback(async () => {
    setIsLoading(true)
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (currentSession) {
      const welcomeMessage: Message = {
        id: generateUniqueId(),
        content: "Welcome to Xumo Play Support\nI'm here to help you with any questions about Xumo Play. How can I assist you today?",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }
      currentSession.messages = [welcomeMessage]
      setMessages([welcomeMessage])
    }
    
    setIsLoading(false)
  }, [currentSession, generateUniqueId])

  const startNewSession = useCallback(async () => {
    originalStartNewSession()
    await addWelcomeMessage()
  }, [originalStartNewSession, addWelcomeMessage])

  const clearCurrentSession = useCallback(async () => {
    originalClearCurrentSession()
    await addWelcomeMessage()
  }, [originalClearCurrentSession, addWelcomeMessage])

  const cleanMessageContent = useCallback((content: string) => {
    // Remove source markers like 【6:0†Xumo Play KB.docx】
    content = content.replace(/【\d+:\d+†[^】]+】/g, '')
    // Remove any markdown code blocks
    content = content.replace(/```[\s\S]*?```/g, '')
    // Remove any remaining markdown formatting
    content = content.replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    content = content.replace(/\*([^*]+)\*/g, '$1') // italic
    content = content.replace(/`([^`]+)`/g, '$1') // inline code
    return content.trim()
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSession) {
      startNewSession()
      return
    }

    const userMessage: Message = {
      id: generateUniqueId(),
      content,
      role: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    // Update messages with user message
    const updatedMessages = [...messages, userMessage]
    currentSession.messages = updatedMessages
    setMessages(updatedMessages)
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          threadId: currentSession?.threadId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data = await response.json();
      if (currentSession) {
        currentSession.threadId = data.threadId;
      }

      // Check if this is a non-Xumo Play issue
      const isNonXumoPlayIssue = (data.message.toLowerCase().includes("peacock") || 
                                data.message.toLowerCase().includes("max") ||
                                data.message.toLowerCase().includes("fox news") ||
                                data.message.toLowerCase().includes("subscription") ||
                                data.message.toLowerCase().includes("account login")) &&
                                !data.message.toLowerCase().includes("xumo play");

      let assistantMessage: Message;
      
      if (isNonXumoPlayIssue) {
        // For non-Xumo Play issues, use our standard support message
        assistantMessage = {
          id: generateUniqueId(),
          content: "I'm specifically trained to help with the Xumo Play app only. For questions about other streaming services or subscription issues, please visit xumo.com/support for dedicated assistance.",
          role: "assistant",
          timestamp: new Date().toLocaleTimeString(),
        };
      } else {
        // For Xumo Play issues, use the assistant's response and add troubleshooting steps if needed
        let messageContent = cleanMessageContent(data.message);
        
        // If the issue mentions streaming or playback problems
        if (data.message.toLowerCase().includes("not working") || 
            data.message.toLowerCase().includes("won't play") ||
            data.message.toLowerCase().includes("loading") ||
            data.message.toLowerCase().includes("buffering") ||
            data.message.toLowerCase().includes("error")) {
          
          messageContent += "\n\nHere are some troubleshooting steps you can try:\n" +
            "1. Check your internet connection\n" +
            "2. Close and reopen the Xumo Play app\n" +
            "3. Restart your device (Xumo Stream Box or TV)\n" +
            "4. Clear the app cache if available on your device\n" +
            "5. Make sure your device's software is up to date\n\n" +
            "If these steps don't resolve the issue, I can help create a support ticket for further assistance.";
        }
        
        assistantMessage = {
          id: generateUniqueId(),
          content: messageContent,
          role: "assistant",
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
        };
      }

      if (currentSession) {
        // Update messages with both user and assistant messages
        const newMessages = [...updatedMessages, assistantMessage]
        currentSession.messages = newMessages
        setMessages(newMessages)
        currentSession.updatedAt = new Date().toISOString()
      }

      // Check if the response indicates a need for a support ticket
      if (data.message.toLowerCase().includes("ticket") || 
          data.message.toLowerCase().includes("support") ||
          data.message.toLowerCase().includes("escalate")) {
        // Check if this is a Xumo Play issue and if troubleshooting has been attempted
        if (isXumoPlayIssue && troubleshootingAttempted) {
          setShowTicketForm(true)
        }
      }

      // Update state based on the conversation
      if (data.message.toLowerCase().includes("xumo play")) {
        setIsXumoPlayIssue(true)
      }
      if (data.message.toLowerCase().includes("troubleshoot") || 
          data.message.toLowerCase().includes("restart") ||
          data.message.toLowerCase().includes("check")) {
        setTroubleshootingAttempted(true)
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, startNewSession, messages, generateUniqueId, isXumoPlayIssue, troubleshootingAttempted, cleanMessageContent])

  const handleTicketCreated = useCallback((ticketId: string) => {
    setShowTicketForm(false)
    if (currentSession) {
      const ticketMessage: Message = {
        id: generateUniqueId(),
        content: `Thank you for providing the information. Your support ticket has been created with ID: ${ticketId}. A support representative will contact you within 24-48 hours to help resolve your issue.`,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }
      const newMessages = [...messages, ticketMessage]
      currentSession.messages = newMessages
      setMessages(newMessages)
    }
  }, [currentSession, messages, generateUniqueId])

  // Initialize chat on first load
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      if (!currentSession) {
        startNewSession()
      } else if (currentSession.messages.length === 0) {
        addWelcomeMessage()
      }
    }
  }, [isInitialized, currentSession, startNewSession, addWelcomeMessage])

  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages)
    } else {
      setMessages([])
    }
  }, [currentSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  return (
    <div className="flex h-[600px] w-full max-w-3xl flex-col rounded-xl border border-gray-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewSession}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentSession}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            disabled={!currentSession}
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        {(!currentSession && !isLoading) ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Starting chat...</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-start px-6 py-4">
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2">
                  <MessageLoading />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="px-6 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            {showTicketForm && (
              <div className="px-6 py-4">
                <TicketForm
                  onTicketCreated={handleTicketCreated}
                  onCancel={() => setShowTicketForm(false)}
                  isXumoPlayIssue={isXumoPlayIssue}
                  troubleshootingAttempted={troubleshootingAttempted}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
} 