"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { MessageLoading } from "./MessageLoading"
import { useChatSession } from "@/contexts/ChatSessionContext"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

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
        content: "Welcome to Customer Support\nI'm here to help you with any questions about our services. What are you having issues with?",
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

  const handleDeviceSelection = useCallback(async (device: string) => {
    setIsLoading(true)
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (currentSession) {
      let responseMessage: string
      if (device === "Play App") {
        responseMessage = "I'm sorry you're having issues with the Xumo Play app. How can I assist you?"
      } else {
        responseMessage = "I apologize, but I can only assist with Xumo Play app issues. For assistance with Xumo Stream Box or Xumo TV, please visit xumo.com/support."
      }
      
      const deviceResponse: Message = {
        id: generateUniqueId(),
        content: responseMessage,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }
      
      // Simply append the new message to existing messages
      setMessages(prev => [...prev, deviceResponse])
      if (currentSession.messages) {
        currentSession.messages = [...currentSession.messages, deviceResponse]
      }
    }
    
    setIsLoading(false)
  }, [currentSession, generateUniqueId])

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
        // For Xumo Play issues, use the assistant's response
        const messageContent = cleanMessageContent(data.message);
        
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

    } catch (error: unknown) {
      console.error("Error sending message:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, startNewSession, messages, generateUniqueId, cleanMessageContent])

  // Initialize chat on first load
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      if (!currentSession) {
        startNewSession()
      }
    }
  }, [isInitialized, currentSession, startNewSession])

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
            {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
              <div className="flex flex-wrap gap-3 px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeviceSelection("Stream Box")}
                  className="rounded-full border-2 border-blue-500 bg-gradient-to-r from-gray-50 to-white px-6 py-2 text-gray-800 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:from-blue-500/10 hover:to-white"
                >
                  Stream Box
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeviceSelection("TVs")}
                  className="rounded-full border-2 border-blue-500 bg-gradient-to-r from-gray-50 to-white px-6 py-2 text-gray-800 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:from-blue-500/10 hover:to-white"
                >
                  TVs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeviceSelection("Play App")}
                  className="rounded-full border-2 border-blue-500 bg-gradient-to-r from-gray-50 to-white px-6 py-2 text-gray-800 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:from-blue-500/10 hover:to-white"
                >
                  Play App
                </Button>
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