"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface ChatMessageProps {
  content: string
  role: "user" | "assistant"
  timestamp?: string
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-4 px-6 py-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-full bg-white p-1">
            <img
              src="/logo.png"
              alt="Xumo Assistant"
              className="h-8 w-8 object-contain"
            />
          </div>
          <span className="text-xs font-medium text-gray-500">Xumo Assistant</span>
        </div>
      )}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3",
          role === "user"
            ? "bg-black text-white"
            : "bg-gray-50 text-gray-900"
        )}
      >
        <div className="prose-sm">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-sm leading-relaxed break-words mb-2 last:mb-0">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2 space-y-1 last:mb-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2 space-y-1 last:mb-0">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className={cn(
                  "font-semibold",
                  role === "user" ? "text-white" : "text-gray-900"
                )}>
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "underline underline-offset-2 hover:opacity-80 transition-opacity",
                    role === "user" ? "text-white" : "text-blue-600"
                  )}
                >
                  {children}
                </a>
              ),
            }}
          >
            {/* Convert plain URLs to markdown links */}
            {content.replace(
              /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.com\/[^\s]*)/g,
              url => {
                // Add https if it's missing
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                return `[${url}](${fullUrl})`;
              }
            )}
          </ReactMarkdown>
        </div>
        {timestamp && (
          <span
            className={cn(
              "text-xs",
              role === "user" ? "text-gray-300" : "text-gray-500"
            )}
          >
            {timestamp}
          </span>
        )}
      </div>
      {role === "user" && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-black text-white">
          <span className="text-sm font-medium">You</span>
        </div>
      )}
    </div>
  )
} 