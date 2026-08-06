import type { ReactNode } from "react";

import { Sidebar, Topbar } from "@/components/dashboard";
import { SidebarProvider } from "@/components/dashboard/sidebar/SidebarProvider";
import { MobileDrawer } from "@/components/dashboard/sidebar/MobileDrawer";
import { ProfileProvider } from "@/context/ProfileContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    // ProfileProvider loads the current user's profile once and shares it
    // across all dashboard pages via context. No UI changes — purely additive.
    <ProfileProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>

          {/* Mobile Drawer */}
          <MobileDrawer />

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden">
            <Topbar />

            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>

        </div>
      </SidebarProvider>
    </ProfileProvider>
  );
}