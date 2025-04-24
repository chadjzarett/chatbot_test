"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

interface ChatSession {
  id: string
  messages: Message[]
  threadId: string | null
  createdAt: string
  updatedAt: string
}

interface ChatSessionContextType {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  startNewSession: () => void
  clearCurrentSession: () => void
  deleteSession: (sessionId: string) => void
  loadSession: (sessionId: string) => void
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined)

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions")
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }, [])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions))
  }, [sessions])

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [],
      threadId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentSession(newSession)
    setSessions((prev) => [...prev, newSession])
  }

  const clearCurrentSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [],
        threadId: null,
        updatedAt: new Date().toISOString(),
      }
      setCurrentSession(updatedSession)
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSession.id ? updatedSession : session
        )
      )
    }
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    if (currentSession?.id === sessionId) {
      setCurrentSession(null)
    }
  }

  const loadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
    }
  }

  return (
    <ChatSessionContext.Provider
      value={{
        currentSession,
        sessions,
        startNewSession,
        clearCurrentSession,
        deleteSession,
        loadSession,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  )
}

export function useChatSession() {
  const context = useContext(ChatSessionContext)
  if (context === undefined) {
    throw new Error("useChatSession must be used within a ChatSessionProvider")
  }
  return context
} 