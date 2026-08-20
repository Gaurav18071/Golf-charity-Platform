"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const ok = await markNotificationAsRead(notificationId, user.id);
    if (!ok) {
      return { success: false, error: "Failed to mark notification as read" };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error marking as read",
    };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const ok = await markAllNotificationsAsRead(user.id);
    if (!ok) {
      return { success: false, error: "Failed to mark all as read" };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error marking all as read",
    };
  }
}
