import OpenAI from 'openai';
import { retry } from './utils/retry';

// Custom error class for OpenAI-related errors
export class OpenAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
});

export interface OpenAIError {
  message: string;
  type: string;
  code?: string;
}

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

export async function createMessage(threadId: string, content: string) {
  try {
    return await retry(() =>
      openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: content,
      })
    );
  } catch (error: any) {
    throw new OpenAIError(
      'Failed to create message',
      error.status,
      error.code
    );
  }
}

export async function runAssistant(threadId: string) {
  try {
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      throw new OpenAIError('Assistant ID is not configured', 500);
    }

    return await retry(() =>
      openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      })
    );
  } catch (error: any) {
    throw new OpenAIError(
      'Failed to run assistant',
      error.status,
      error.code
    );
  }
}

export async function getRunStatus(threadId: string, runId: string) {
  try {
    return await retry(() =>
      openai.beta.threads.runs.retrieve(threadId, runId)
    );
  } catch (error: any) {
    throw new OpenAIError(
      'Failed to get run status',
      error.status,
      error.code
    );
  }
}

export async function getMessages(threadId: string) {
  try {
    return await retry(() =>
      openai.beta.threads.messages.list(threadId)
    ).then(response => response.data);
  } catch (error: any) {
    throw new OpenAIError(
      'Failed to get messages',
      error.status,
      error.code
    );
  }
}

export async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 30) {
  try {
    let attempts = 0;
    let run = await getRunStatus(threadId, runId);
    
    while (run.status === "queued" || run.status === "in_progress") {
      if (attempts >= maxAttempts) {
        throw new OpenAIError('Run timed out', 408);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await getRunStatus(threadId, runId);
      attempts++;
    }

    if (run.status === "completed") {
      return await getMessages(threadId);
    } else if (run.status === "failed") {
      throw new OpenAIError(`Run failed: ${run.last_error?.message || 'Unknown error'}`, 500);
    } else if (run.status === "cancelled") {
      throw new OpenAIError('Run was cancelled', 500);
    } else {
      throw new OpenAIError(`Unexpected run status: ${run.status}`, 500);
    }
  } catch (error: any) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    throw new OpenAIError(
      'Failed to wait for run completion',
      error.status,
      error.code
    );
  }
} 