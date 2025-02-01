import { z } from "zod";

export const endpointSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  url: z.string().url("Please enter a valid URL").trim(),
  checkInterval: z
    .number()
    .min(60000, "Check interval must be at least 1 minute (60000ms)")
    .max(86400000, "Check interval cannot exceed 24 hours (86400000ms)")
    .optional()
    .default(300000),
  timeout: z
    .number()
    .min(1000, "Timeout must be at least 1 second (1000ms)")
    .max(30000, "Timeout cannot exceed 30 seconds (30000ms)")
    .optional()
    .default(5000),
});
