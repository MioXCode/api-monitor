import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { config } from "../config";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        message: "Authorization header must start with Bearer",
      },
      401
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json(
      {
        success: false,
        message: "No token provided",
      },
      401
    );
  }

  try {
    const payload = await verify(token, config.jwtSecret);

    c.set("user", payload);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Invalid or expired token",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      401
    );
  }
};
