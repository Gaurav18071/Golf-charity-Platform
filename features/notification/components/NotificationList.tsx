"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationDTO } from "../types/notification.types";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "../actions/notification.actions";
import {
  Bell,
  CheckCheck,
  HandCoins,
  Target,
  Building2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface NotificationListProps {
  initialNotifications: NotificationDTO[];
}

function formatDate(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationList({
  initialNotifications,
}: NotificationListProps) {
  const [notifications, setNotifications] =
    useState<NotificationDTO[]>(initialNotifications);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsReadAction(id);
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsReadAction();
    setMarkingAll(false);
  };

  const getIcon = (type: string) => {
    if (type.startsWith("ORGANIZATION")) {
      return <Building2 className="h-5 w-5 text-purple-600" />;
    }
    if (type.startsWith("CAMPAIGN")) {
      return <Target className="h-5 w-5 text-blue-600" />;
    }
    if (type.startsWith("DONATION") || type.startsWith("PAYMENT")) {
      return <HandCoins className="h-5 w-5 text-emerald-600" />;
    }
    return <Bell className="h-5 w-5 text-amber-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Unread Count & Mark All As Read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }.`
              : "You're all caught up with your updates."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No notifications yet
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Important updates about your organization, campaigns, and donations will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`p-5 sm:p-6 transition flex items-start justify-between gap-4 ${
                  !item.isRead ? "bg-emerald-50/30" : "hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                    {getIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>

                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          onClick={() => {
                            if (!item.isRead) handleMarkAsRead(item.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mark as read button */}
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
