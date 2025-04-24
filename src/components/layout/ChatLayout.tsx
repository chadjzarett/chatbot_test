"use client"

import { ChatWindow } from "../chat/ChatWindow"
import Image from "next/image"

export function ChatLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="XUMO" 
              width={32}
              height={32}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">
              How can I help you today?
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Ask me anything about Xumo Play, and I&apos;ll do my best to assist you.
            </p>
          </div>

          <ChatWindow />
        </div>
      </main>
    </div>
  )
} 