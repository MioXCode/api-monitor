import { z } from "zod";

export const monitorCheckSchema = z.object({
  endpointId: z.string().uuid("Invalid UUID format"),
  timestamp: z.string().datetime("Invalid datetime format").optional(),
  status: z.enum(["UP", "DOWN", "DEGRADED"], {
    errorMap: () => ({ message: "Status must be UP, DOWN or DEGRADED" }),
  }),
  responseTime: z.number().min(0, "Response time must be positive").optional(),
  errorMessage: z.string().optional(),
  headers: z.record(z.string()).optional(),
});
