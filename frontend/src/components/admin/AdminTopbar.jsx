"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  MessageSquare,
  FileText,
  AlertTriangle,
  ArrowRight,
  Package,
} from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { cn } from "@/lib/utils";

export const AdminTopbar = ({ title, subtitle, onMenu, action }) => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const popoverRef = useRef(null);

  let adminData = null;
  try {
    adminData = useAdminData();
  } catch (e) {
    // If rendered outside AdminDataProvider
    adminData = null;
  }

  const notifications = adminData?.notifications || [];
  const unreadCount = adminData?.unreadAlertsCount || 0;
  const markNotificationRead = adminData?.markNotificationRead;
  const markAllNotificationsRead = adminData?.markAllNotificationsRead;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = (notif) => {
    if (markNotificationRead) {
      markNotificationRead(notif.id);
    }
    setShowNotifications(false);
    if (notif.link) {
      router.push(notif.link);
    } else if (notif.type === "whatsapp" || notif.type === "enquiry") {
      router.push("/admin/enquiries");
    } else if (notif.type === "stock" || notif.type === "low_stock") {
      router.push("/admin/inventory");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-emerald-600" />;
      case "stock":
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-accent" />;
    }
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return "just now";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${Math.floor(diffHr / 24)}d ago`;
    } catch (e) {
      return "recently";
    }
  };

  return (
    <header
      style={{ position: "sticky", top: 0, zIndex: 30 }}
      className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-4 border-b border-border bg-white dark:bg-[#050505] px-4 py-3 sm:px-6 lg:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          aria-label="Open navigation menu"
          onClick={onMenu}
          className="text-foreground transition-colors hover:text-accent lg:hidden flex-shrink-0 p-1 -ml-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-serif text-xl sm:text-2xl leading-tight text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground hidden sm:block truncate max-w-xl">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="relative hidden md:flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search catalogue, SKU, orders…"
            className="h-9 w-48 lg:w-60 rounded-sm border border-input bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {action}

        {/* Notifications Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-sm border border-input text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring",
              showNotifications && "bg-secondary border-foreground/30"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-burgundy px-1 font-label text-[9px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-sm border border-border bg-white dark:bg-[#0F0F0F] shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-semibold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-burgundy/15 px-2 py-0.5 font-label text-[10px] font-bold text-burgundy">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && markAllNotificationsRead && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="flex items-center gap-1 font-label text-[10px] tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CheckCheck className="h-3 w-3" /> MARK ALL READ
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-secondary/40",
                        !notif.read && "bg-accent/5 font-medium"
                      )}
                    >
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary border border-border">
                        {getIcon(notif.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {notif.title}
                          </p>
                          <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-burgundy" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 border-t border-border bg-secondary/20 p-2 text-center text-[11px]">
                <Link
                  href="/admin/enquiries"
                  onClick={() => setShowNotifications(false)}
                  className="flex items-center justify-center gap-1 py-1 font-label text-xs tracking-wider text-accent transition-colors hover:underline"
                >
                  INBOXES <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/admin/inventory"
                  onClick={() => setShowNotifications(false)}
                  className="flex items-center justify-center gap-1 border-l border-border py-1 font-label text-xs tracking-wider text-foreground transition-colors hover:underline"
                >
                  INVENTORY <Package className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#050505] font-serif text-sm font-semibold text-[#FED508] shadow-sm select-none flex-shrink-0" aria-label="Signed in as FS">
          FS
        </div>
      </div>
    </header>
  );
};
