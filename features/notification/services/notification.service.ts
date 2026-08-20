import { prisma } from "@/lib/prisma";
import { CreateNotificationInput, NotificationDTO } from "../types/notification.types";
import { sendNotificationEmail } from "@/features/email/services/email.service";

// Safe delegate to prevent Windows DLL lock IDE warnings
const db = prisma as any;

/**
 * Creates an in-app notification and dispatches a background notification email.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationDTO | null> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.userId
      );

    if (!isUuid) {
      console.warn("Invalid UUID passed to createNotification:", input.userId);
      return null;
    }

    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl || null,
        metadata: input.metadata || {},
      },
      include: {
        user: {
          select: { email: true, fullName: true },
        },
      },
    });

    // Safely trigger transactional email in the background
    if (notification.user?.email) {
      sendNotificationEmail({
        to: notification.user.email,
        recipientName: notification.user.fullName,
        subject: input.title,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl || undefined,
      }).catch((err) =>
        console.warn("Background email notification error:", err)
      );
    }

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
    };
  } catch (error) {
    console.error("createNotification error:", error);
    return null;
  }
}

/**
 * Retrieves a user's notifications ordered by newest first.
 */
export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<NotificationDTO[]> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      );
    if (!isUuid) return [];

    const items = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return items.map((n: any) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      actionUrl: n.actionUrl,
      createdAt: n.createdAt,
    }));
  } catch (error) {
    console.error("getUserNotifications error:", error);
    return [];
  }
}

/**
 * Gets count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      );
    if (!isUuid) return 0;

    return await db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    return 0;
  }
}

/**
 * Marks a single notification as read with ownership verification.
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        notificationId
      );
    if (!isUuid) return false;

    await db.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return true;
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return false;
  }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      );
    if (!isUuid) return false;

    await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return true;
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error);
    return false;
  }
}
