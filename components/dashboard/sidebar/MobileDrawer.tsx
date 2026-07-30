"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import { Sidebar } from "./Sidebar";
import { useSidebar } from "./SidebarProvider";

export function MobileDrawer() {
  
  const { isOpen, closeSidebar } = useSidebar();
 

const pathname = usePathname();

useEffect(() => {
  closeSidebar();
}, [pathname, closeSidebar]);

return (
  
    <Sheet
  open={isOpen}
  onOpenChange={(open) => {
    if (!open) {
      closeSidebar();
    }
  }}
>
      <SheetContent
        side="left"
        className="w-72 p-0 lg:hidden"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}