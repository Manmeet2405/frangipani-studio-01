"use client";

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { AdminMenuContext } from "@/context/AdminMenuContext";

export const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <AdminDataProvider>
      <AdminMenuContext.Provider value={{ openMenu: () => setOpen(true) }}>
        <div className="min-h-screen bg-background">
          {/* Desktop sidebar */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
            <AdminSidebar />
          </aside>

          {/* Mobile sidebar */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-64 border-r-0 p-0">
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="lg:pl-64">
            {children}
          </div>
        </div>
      </AdminMenuContext.Provider>
    </AdminDataProvider>
  );
};
