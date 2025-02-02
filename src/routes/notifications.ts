import { Hono } from "hono";
import { NotificationService } from "../services/notification_service";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../config/database";
import { successResponse, errorResponse } from "../utils";

const notifications = new Hono();
const notificationService = new NotificationService();

notifications.use("*", authMiddleware);

notifications.get("/", async (c) => {
  try {
    const user = c.get("user" as any);
    const notifications = await notificationService.findAll(user.userId);
    return successResponse(
      c,
      notifications,
      "Notifications retrieved successfully"
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message);
    }
    return errorResponse(c, "An error occurred");
  }
});

notifications.patch("/:id/read", async (c) => {
  try {
    const user = c.get("user" as any);
    const id = c.req.param("id");
    const notification = await notificationService.markAsRead(id, user.userId);
    return successResponse(c, notification, "Notification marked as read");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

notifications.delete("/clear-all", async (c) => {
  try {
    const user = c.get("user" as any);
    await prisma.notification.deleteMany({
      where: { userId: user.userId, read: true },
    });
    return successResponse(c, null, "All read notifications cleared");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message);
    }
    return errorResponse(c, "An error occurred");
  }
});

export { notifications };
