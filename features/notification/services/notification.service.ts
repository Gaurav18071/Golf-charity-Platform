import { prisma } from "@/lib/prisma";
import { CreateNotificationInput, NotificationDTO } from "../types/notification.types";
import { sendNotificationEmail } from "@/features/email/services/email.service";

// Use prisma directly — safe to call from server-side only
const db = prisma;

/**
 * Creates an in-app notification and dispatches a background notification email.
 * 
 * TODO: Notification model needs to be added to Prisma schema before this can work
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationDTO | null> {
  console.warn("Notification feature not yet implemented - Notification model missing from schema");
  return null;
}

/**
 * Retrieves a user's notifications ordered by newest first.
 * 
 * TODO: Notification model needs to be added to Prisma schema before this can work
 */
export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<NotificationDTO[]> {
  return [];
}

/**
 * Gets count of unread notifications for a user.
 * 
 * TODO: Notification model needs to be added to Prisma schema before this can work
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  return 0;
}

/**
 * Marks a single notification as read with ownership verification.
 * 
 * TODO: Notification model needs to be added to Prisma schema before this can work
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  return false;
}

/**
 * Marks all notifications as read for a user.
 * 
 * TODO: Notification model needs to be added to Prisma schema before this can work
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  return false;
}
