import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, HandCoins, Target, Users, Info } from "lucide-react";

export const dynamic = "force-dynamic";

// Notifications are not stored in DB yet — placeholder with realistic mock structure
interface Notification {
  id: string;
  type: "donation" | "campaign" | "system" | "user";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "donation",
    title: "Donation received",
    description: "₹5,000 was donated to Summer Charity Cup 2026.",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "campaign",
    title: "Campaign approved",
    description: "Your campaign 'Junior Golf Championship' has been approved.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "user",
    title: "New subscriber",
    description: "A new donor joined your campaign.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Profile verification update",
    description: "Your organizer profile is under review.",
    time: "3 days ago",
    read: true,
  },
];

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  donation: <HandCoins className="h-5 w-5" />,
  campaign: <Target className="h-5 w-5" />,
  user:     <Users className="h-5 w-5" />,
  system:   <Info className="h-5 w-5" />,
};

const TYPE_COLORS: Record<Notification["type"], string> = {
  donation: "bg-emerald-100 text-emerald-600",
  campaign: "bg-blue-100 text-blue-600",
  user:     "bg-purple-100 text-purple-600",
  system:   "bg-amber-100 text-amber-600",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-4 h-10 w-10 text-slate-300" />
            <h3 className="text-base font-semibold text-slate-900">No notifications</h3>
            <p className="mt-2 text-sm text-slate-500">You'll see updates here when something happens.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <li
                key={notif.id}
                className={[
                  "flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50",
                  !notif.read ? "bg-emerald-50/40" : "",
                ].join(" ")}
              >
                {/* Icon */}
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_COLORS[notif.type]}`}>
                  {TYPE_ICON[notif.type]}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-medium ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>
                      {notif.title}
                    </p>
                    <time className="shrink-0 text-xs text-slate-400 whitespace-nowrap">
                      {notif.time}
                    </time>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{notif.description}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
