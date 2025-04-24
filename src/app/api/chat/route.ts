import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json();
    const response = await sendMessage(message, threadId);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
} 