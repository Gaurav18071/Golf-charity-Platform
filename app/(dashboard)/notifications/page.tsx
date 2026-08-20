import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserNotifications } from "@/features/notification/services/notification.service";
import { NotificationList } from "@/features/notification/components/NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const notifications = await getUserNotifications(user.id, 50);

  return <NotificationList initialNotifications={notifications} />;
}
