"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 border-t border-gray-100 bg-white px-6 py-4"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className={cn(
          "flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition-colors",
          "focus:border-[#05B2B6] focus:ring-1 focus:ring-[#05B2B6]",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-[#05B2B6] text-white transition-colors",
          "hover:bg-[#049599] focus:outline-none focus:ring-2 focus:ring-[#05B2B6] focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
} 