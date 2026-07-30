import {
  HandCoins,
  Target,
  Users,
  UserCheck,
  BarChart3,
} from "lucide-react";

import {
  WelcomeBanner,
  StatsGrid,
  QuickActions,
  RecentActivity,
} from "@/components/dashboard/overview";

export default function DashboardPage() {
  const stats = [
    {
      id: "campaigns",
      title: "Campaigns",
      value: 12,
      icon: <Target className="h-6 w-6" />,
      description: "2 campaigns ending this week",
    },
    {
      id: "donations",
      title: "Total Donations",
      value: "₹2.45L",
      icon: <HandCoins className="h-6 w-6" />,
      description: "+18% this month",
    },
    {
      id: "subscribers",
      title: "Subscribers",
      value: 856,
      icon: <Users className="h-6 w-6" />,
      description: "34 joined this week",
    },
    {
      id: "volunteers",
      title: "Volunteers",
      value: 42,
      icon: <UserCheck className="h-6 w-6" />,
      description: "8 active today",
    },
  ];

  const quickActions = [
    {
      id: "campaign",
      title: "New Campaign",
      description: "Launch a new fundraising campaign",
      icon: <Target className="h-6 w-6" />,
    },
    {
      id: "reports",
      title: "View Reports",
      description: "Track fundraising performance",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      id: "donations",
      title: "Manage Donations",
      description: "Review incoming donations",
      icon: <HandCoins className="h-6 w-6" />,
    },
    {
      id: "subscribers",
      title: "Subscribers",
      description: "Manage your community",
      icon: <Users className="h-6 w-6" />,
    },
  ];

  const activities = [
    {
      id: "1",
      title: "New donation received",
      description: "₹5,000 donated to Summer Charity Cup",
      time: "5 min ago",
      icon: <HandCoins className="h-5 w-5" />,
    },
    {
      id: "2",
      title: "Campaign created",
      description: "Junior Golf Championship fundraiser",
      time: "1 hour ago",
      icon: <Target className="h-5 w-5" />,
    },
    {
      id: "3",
      title: "New subscriber",
      description: "Rahul Sharma joined the newsletter",
      time: "Yesterday",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <WelcomeBanner userName="Gaurav" />

      <StatsGrid stats={stats} />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <QuickActions actions={quickActions} />
        </div>

        <div className="xl:col-span-2">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}