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
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
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

      if (!notifications.length) {
        return [];
      }

      return notifications;
    } catch (error: any) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
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
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }
}
