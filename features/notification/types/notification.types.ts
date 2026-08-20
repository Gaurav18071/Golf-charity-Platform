export type NotificationType =
  | "ORGANIZATION_SUBMITTED"
  | "ORGANIZATION_APPROVED"
  | "ORGANIZATION_REJECTED"
  | "ORGANIZATION_CHANGES_REQUESTED"
  | "CAMPAIGN_SUBMITTED"
  | "CAMPAIGN_APPROVED"
  | "CAMPAIGN_REJECTED"
  | "CAMPAIGN_CANCELLED"
  | "DONATION_CREATED"
  | "DONATION_SUCCESSFUL"
  | "DONATION_FAILED"
  | "PAYMENT_SUCCESSFUL"
  | "PAYMENT_FAILED"
  | "SYSTEM_ANNOUNCEMENT";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, any>;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date;
}
