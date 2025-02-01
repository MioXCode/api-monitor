import { Context, Next } from "hono";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();

      const validatedData = await schema.parseAsync(body);
      c.set("validatedBody", validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          },
          400
        );
      }

      if (error instanceof SyntaxError) {
        return c.json(
          {
            success: false,
            message: "Invalid JSON format",
            error: error.message,
          },
          400
        );
      }
      throw error;
    }
  };
};
