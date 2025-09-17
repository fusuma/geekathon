import { HelloWorldResponse } from '@repo/shared';

// API base URL - in development, this will be our local SAM API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function fetchHello(): Promise<HelloWorldResponse> {
  const response = await fetch(`${API_BASE_URL}/hello`);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
}