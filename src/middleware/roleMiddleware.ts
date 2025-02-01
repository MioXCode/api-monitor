import { Context, Next } from "hono";
import { UserRole } from "@prisma/client";

export const roleMiddleware = (roles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found in context",
        },
        401
      );
    }

    if (!user.role) {
      return c.json(
        {
          success: false,
          message: "User role not defined",
        },
        403
      );
    }

    if (!roles.includes(user.role)) {
      return c.json(
        {
          success: false,
          message: `Access denied. Required roles: ${roles.join(", ")}`,
          requiredRoles: roles,
          userRole: user.role,
        },
        403
      );
    }

    await next();
  };
};
