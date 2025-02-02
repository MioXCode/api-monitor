import { prisma } from "../config/database";
import { NotificationType, Notification } from "@prisma/client";

interface CreateNotificationData {
  userId: string;
  endpointId: string;
  type: NotificationType;
  message: string;
}

export class NotificationService {
  async create(data: CreateNotificationData): Promise<Notification> {
    try {
      return await prisma.notification.create({
        data,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create notification"
      );
    }
  }

  async findAll(userId: string): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          endpoint: {
            select: {
              name: true,
              url: true,
            },
          },
        },
      });

      return notifications;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch notifications"
      );
    }
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      return await prisma.notification.update({
        where: { id, userId },
        data: { read: true },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read"
      );
    }
  }
}
