interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's a client error (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait before retrying, with exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
} 