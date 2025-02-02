import { Hono } from "hono";
import { AuthService } from "../services/auth_service";
import { validateRequest } from "../middleware/validateRequest";
import { registerSchema, loginSchema } from "../schemas/auth_schema";
import { successResponse, errorResponse } from "../utils";

const auth = new Hono();
const authService = new AuthService();

auth.post("/register", validateRequest(registerSchema), async (c) => {
  try {
    const data = await c.req.json();
    const user = await authService.register(data);
    return successResponse(c, user, "Registration successful");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

auth.post("/login", validateRequest(loginSchema), async (c) => {
  try {
    const data = await c.req.json();
    const result = await authService.login(data);
    return successResponse(c, result, "Login successful");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 401);
    }
    return errorResponse(c, "An error occurred", 401);
  }
});

auth.post("/verify-email", async (c) => {
  try {
    const data = await c.req.json();
    const result = await authService.verifyEmail(data.token);
    return successResponse(c, result, "Email verified successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

auth.post("/resend-verification-email", async (c) => {
  try {
    const data = await c.req.json();
    const result = await authService.resendVerificationEmail(data.email);
    return successResponse(c, result, "Verification email sent");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

export { auth };
