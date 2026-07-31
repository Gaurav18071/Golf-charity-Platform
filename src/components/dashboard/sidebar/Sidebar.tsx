import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./navigation/SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  return (
    <aside className="flex h-full w-72 flex-col">
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav />
      </div>

      <SidebarFooter />
    </aside>
  );
}