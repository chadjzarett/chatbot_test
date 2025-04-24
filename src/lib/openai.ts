import OpenAI from 'openai';
import { retry } from './utils/retry';

// Custom error class for OpenAI-related errors
export interface OpenAIError {
  message: string;
  type: string;
  code?: string;
  status?: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
});

export interface OpenAIResponse {
  message: string;
  threadId: string;
  timestamp: string;
}

export async function createThread(): Promise<string> {
  try {
    const response = await fetch("/api/thread", {
      method: "POST",
    });
    
    if (!response.ok) {
      const error: OpenAIError = await response.json();
      throw new Error(error.message);
    }
    
    const data: { threadId: string } = await response.json();
    return data.threadId;
  } catch (error: unknown) {
    console.error("Error creating thread:", error);
    throw error instanceof Error ? error : new Error("Failed to create thread");
  }
}

export async function sendMessage(message: string, threadId: string): Promise<OpenAIResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, threadId }),
    });
    
    if (!response.ok) {
      const error: OpenAIError = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    throw error instanceof Error ? error : new Error("Failed to send message");
  }
}

export async function createMessage(threadId: string, content: string): Promise<void> {
  try {
    await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId, content }),
    });
  } catch (error: unknown) {
    console.error("Error creating message:", error);
    throw error instanceof Error ? error : new Error("Failed to create message");
  }
}

export async function runAssistant(threadId: string): Promise<void> {
  try {
    await fetch("/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId }),
    });
  } catch (error: unknown) {
    console.error("Error running assistant:", error);
    throw error instanceof Error ? error : new Error("Failed to run assistant");
  }
}

export async function getRunStatus(threadId: string, runId: string): Promise<{ status: string }> {
  try {
    const response = await fetch(`/api/run/${threadId}/${runId}`);
    return await response.json();
  } catch (error: unknown) {
    console.error("Error getting run status:", error);
    throw error instanceof Error ? error : new Error("Failed to get run status");
  }
}

export async function getMessages(threadId: string): Promise<{ messages: Array<{ content: string }> }> {
  try {
    const response = await fetch(`/api/messages/${threadId}`);
    return await response.json();
  } catch (error: unknown) {
    console.error("Error getting messages:", error);
    throw error instanceof Error ? error : new Error("Failed to get messages");
  }
}

export async function waitForRunCompletion(
  threadId: string,
  runId: string,
  maxAttempts = 30
): Promise<{ messages: Array<{ content: string }> }> {
  try {
    let attempts = 0;
    let run = await getRunStatus(threadId, runId);
    
    while (run.status === "queued" || run.status === "in_progress") {
      if (attempts >= maxAttempts) {
        throw new Error("Run timed out");
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await getRunStatus(threadId, runId);
      attempts++;
    }

    if (run.status === "completed") {
      return await getMessages(threadId);
    } else if (run.status === "failed") {
      throw new Error(`Run failed: ${run.status}`);
    } else if (run.status === "cancelled") {
      throw new Error("Run was cancelled");
    } else {
      throw new Error(`Unexpected run status: ${run.status}`);
    }
  } catch (error: unknown) {
    console.error("Error waiting for run completion:", error);
    throw error instanceof Error ? error : new Error("Failed to wait for run completion");
  }
} 