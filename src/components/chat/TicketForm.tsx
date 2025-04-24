"use client"

import { useState } from "react"
import { useSupportTicket } from "@/contexts/SupportTicketContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TicketFormProps {
  onTicketCreated: (ticketId: string) => void
  onCancel: () => void
  isXumoPlayIssue: boolean
  troubleshootingAttempted: boolean
}

export function TicketForm({ onTicketCreated, onCancel, isXumoPlayIssue, troubleshootingAttempted }: TicketFormProps) {
  const { createTicket } = useSupportTicket()
  const [email, setEmail] = useState("")
  const [issue, setIssue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const ticket = createTicket(email, issue)
      onTicketCreated(ticket.id)
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isXumoPlayIssue || !troubleshootingAttempted) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="issue">Describe Your Issue</Label>
        <Textarea
          id="issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Please describe your issue in detail"
          required
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
        </Button>
      </div>
    </form>
  )
} 