import { z } from 'zod';

// Zod schemas for validation
export const HelloWorldResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
  version: z.string(),
});