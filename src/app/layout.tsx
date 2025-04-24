import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatSessionProvider } from "@/contexts/ChatSessionContext";
import { SupportTicketProvider } from "@/contexts/SupportTicketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xumo Play Chatbot",
  description: "A customer service chatbot for Xumo Play",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChatSessionProvider>
          <SupportTicketProvider>
            {children}
          </SupportTicketProvider>
        </ChatSessionProvider>
      </body>
    </html>
  );
}
