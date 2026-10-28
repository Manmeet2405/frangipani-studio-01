"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMenuContext } from "@/context/AdminMenuContext";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <AdminMenuContext.Provider value={{ openMenu: () => setOpen(true) }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
          <AdminSidebar />
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-64 border-r-0 p-0 bg-[#050505]">
            <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="lg:pl-64 min-w-0 flex-1 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </AdminMenuContext.Provider>
  );
}
