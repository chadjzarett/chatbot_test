import { NextResponse } from "next/server";
import {
  createThread,
  createMessage,
  runAssistant,
  waitForRunCompletion,
  OpenAIError,
} from "@/lib/openai";

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const { message, threadId } = body;

    // Create a new thread if one doesn't exist
    const thread = threadId ? { id: threadId } : await createThread();

    // Add the user's message to the thread
    await createMessage(thread.id, message);

    // Run the assistant
    const run = await runAssistant(thread.id);

    // Wait for the assistant's response
    const messages = await waitForRunCompletion(thread.id, run.id);

    // Get the latest assistant message
    const latestMessage = messages[0];
    const messageContent = latestMessage.content[0];

    // Check if the content is text
    if ('text' in messageContent) {
      return NextResponse.json({
        message: messageContent.text.value,
        threadId: thread.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new OpenAIError('Unexpected message content type', 500);
    }
  } catch (error) {
    console.error("Error in chat API:", error);

    if (error instanceof OpenAIError) {
      // Handle specific OpenAI errors
      const status = error.status || 500;
      let userMessage: string;

      switch (status) {
        case 401:
          userMessage = "Authentication error. Please check the API configuration.";
          break;
        case 404:
          userMessage = "The requested resource was not found.";
          break;
        case 408:
          userMessage = "The request timed out. Please try again.";
          break;
        case 429:
          userMessage = "Too many requests. Please try again in a moment.";
          break;
        case 500:
          userMessage = "An error occurred with the AI service. Please try again later.";
          break;
        default:
          userMessage = "An unexpected error occurred. Please try again.";
      }

      return NextResponse.json(
        { error: userMessage },
        { status }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
} 