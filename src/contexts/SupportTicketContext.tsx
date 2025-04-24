"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SupportTicket {
  id: string
  email: string
  issue: string
  status: "pending" | "in_progress" | "resolved"
  createdAt: string
  updatedAt: string
}

interface SupportTicketContextType {
  tickets: SupportTicket[]
  createTicket: (email: string, issue: string) => SupportTicket
  getTicket: (ticketId: string) => SupportTicket | undefined
}

const SupportTicketContext = createContext<SupportTicketContextType | undefined>(undefined)

export function SupportTicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  const createTicket = (email: string, issue: string): SupportTicket => {
    const ticket: SupportTicket = {
      id: Math.floor(100000 + Math.random() * 900000).toString(), // Generate 6-digit ticket number
      email,
      issue,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTickets((prev) => [...prev, ticket])
    return ticket
  }

  const getTicket = (ticketId: string) => {
    return tickets.find((ticket) => ticket.id === ticketId)
  }

  return (
    <SupportTicketContext.Provider
      value={{
        tickets,
        createTicket,
        getTicket,
      }}
    >
      {children}
    </SupportTicketContext.Provider>
  )
}

export function useSupportTicket() {
  const context = useContext(SupportTicketContext)
  if (context === undefined) {
    throw new Error("useSupportTicket must be used within a SupportTicketProvider")
  }
  return context
} 