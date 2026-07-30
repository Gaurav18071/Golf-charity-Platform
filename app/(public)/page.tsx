import type { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}