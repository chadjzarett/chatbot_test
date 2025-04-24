"use client"

import { cn } from "@/lib/utils"

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 px-4 py-3">
      <div className="flex max-w-[80px] flex-col gap-2 rounded-2xl px-4 py-3 bg-gray-100 border border-gray-200">
        <div className="flex items-center gap-1">
          <span className="animate-bounce delay-0 h-2 w-2 rounded-full bg-gray-400" />
          <span className="animate-bounce delay-150 h-2 w-2 rounded-full bg-gray-400" />
          <span className="animate-bounce delay-300 h-2 w-2 rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  )
} 