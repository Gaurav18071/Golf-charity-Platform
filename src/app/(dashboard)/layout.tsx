import type { ReactNode } from "react";

import { Sidebar, Topbar } from "@/src/components/dashboard";
import { SidebarProvider } from "@/src/components/dashboard/sidebar/SidebarProvider";
import { MobileDrawer } from "@/src/components/dashboard/sidebar/MobileDrawer";
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
      <main className="flex-1 overflow-x-hidden">
        <Topbar />

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

    </div>
  </SidebarProvider>
);
}