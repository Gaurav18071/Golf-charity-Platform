import type { ReactNode } from "react";

import { Sidebar, Topbar } from "@/components/dashboard";
import { SidebarProvider } from "@/components/dashboard/sidebar/SidebarProvider";
import { MobileDrawer } from "@/components/dashboard/sidebar/MobileDrawer";
interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
 return (
  <SidebarProvider>
    <div className="flex min-h-screen">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Main Content */}
      <main className="flex-1">
        <Topbar />

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

    </div>
  </SidebarProvider>
);
}