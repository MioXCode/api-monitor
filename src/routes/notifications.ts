import { Hono } from "hono";
import { NotificationService } from "../services/notification_service";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../config/database";

const notifications = new Hono();
const notificationService = new NotificationService();

notifications.use("*", authMiddleware);

notifications.get("/", async (c) => {
  const user = c.get("user" as any);
  const notifications = await notificationService.findAll(user.userId);
  return c.json({ success: true, data: notifications });
});

notifications.patch("/:id/read", async (c) => {
  const user = c.get("user" as any);
  const id = c.req.param("id");
  const notification = await notificationService.markAsRead(id, user.userId);
  return c.json({ success: true, data: notification });
});

notifications.delete("/clear-all", async (c) => {
  const user = c.get("user" as any);
  await prisma.notification.deleteMany({
    where: { userId: user.userId, read: true },
  });
  return c.json({ success: true, message: "All read notifications cleared" });
});

export { notifications };
