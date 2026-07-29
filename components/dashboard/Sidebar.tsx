import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav />
      </div>

      <SidebarFooter />
    </aside>
  );
}