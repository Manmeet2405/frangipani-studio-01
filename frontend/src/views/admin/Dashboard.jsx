"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useOutletContext } from "@/context/AdminMenuContext";
import {
  Package,
  PackageCheck,
  Activity,
  MessageSquare,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  Inbox,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { analytics, statusMeta, categoryName, formatINR, STUDIO_CONFIG } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";

const rentalsByMonth = analytics.revenueByMonth.map((m) => ({
  month: m.month,
  rentals: Math.round(m.revenue / 6800),
}));
const tip = {
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  borderRadius: 2,
  fontSize: 12,
};

export default function Dashboard() {
  const { openMenu } = useOutletContext();
  const { props, enquiries, waConversations, requests, lowStockCount } = useAdminData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Physical Inventory Calculations
  const inventoryStats = useMemo(() => {
    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;

    props.forEach((p) => {
      const onHand = Number(p.onHand ?? p.quantity ?? 1);
      const reserved = Number(p.reserved ?? 0);
      const available = p.available != null ? Number(p.available) : Math.max(0, onHand - reserved);
      totalOnHand += onHand;
      totalReserved += reserved;
      totalAvailable += available;
    });

    const pendingEnquiries = enquiries.filter((e) => e.status === "new" || e.status === "contacted").length;
    const unreadWa = waConversations.filter((c) => c.status === "unread").length;

    return {
      totalOnHand,
      totalReserved,
      totalAvailable,
      pendingEnquiries,
      unreadWa,
    };
  }, [props, enquiries, waConversations]);

  const summary = useMemo(() => [
    {
      label: "Total Catalogue",
      value: String(props.length),
      delta: `${inventoryStats.totalOnHand} units`,
      trend: "up",
      sub: "physically held on-hand",
      icon: Package,
    },
    {
      label: "Available Stock",
      value: String(inventoryStats.totalAvailable),
      delta: `${Math.round((inventoryStats.totalAvailable / (inventoryStats.totalOnHand || 1)) * 100)}%`,
      trend: "up",
      sub: "available to rent now",
      icon: PackageCheck,
    },
    {
      label: "Reserved Stock",
      value: String(inventoryStats.totalReserved),
      delta: "Committed",
      trend: inventoryStats.totalReserved > 0 ? "up" : "down",
      sub: "confirmed order reservations",
      icon: Activity,
    },
    {
      label: "Two Inboxes Activity",
      value: String(inventoryStats.pendingEnquiries + inventoryStats.unreadWa),
      delta: `${inventoryStats.unreadWa} WA unread`,
      trend: "up",
      sub: `${inventoryStats.pendingEnquiries} pending web enquiries`,
      icon: MessageSquare,
      highlight: true,
    },
  ], [props.length, inventoryStats]);

  const popular = useMemo(
    () =>
      [...props]
        .sort((a, b) => (b.rentalCount || 0) - (a.rentalCount || 0))
        .slice(0, 5)
        .map((p) => ({ ...p, revenue: (p.rentalCount || 0) * p.pricePerDay })),
    [props]
  );

  return (
    <>
      <AdminTopbar
        title="Good morning, Admin"
        subtitle={`${STUDIO_CONFIG.name} · Operations & Physical Inventory Control`}
        onMenu={openMenu}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5">
              <Link href="/admin/inventory">
                <Layers className="h-4 w-4" /> Stock Ledger
              </Link>
            </Button>
            <Button asChild variant="editorial" size="sm" className="gap-1.5">
              <Link href="/admin/enquiries">
                <Inbox className="h-4 w-4" /> Two Inboxes
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-8 p-5 lg:p-8">
        {/* Low Stock Warning Banner if any */}
        {lowStockCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/10 p-4 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-500/20 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Inventory Alert: {lowStockCount} {lowStockCount === 1 ? "prop has" : "props have"} reached or dropped below reorder threshold
                </p>
                <p className="text-xs text-muted-foreground">
                  Available stock has reached critical level. Review items and initiate supplier receipt.
                </p>
              </div>
            </div>
            <Button asChild variant="line" size="sm" className="self-start sm:self-auto text-xs">
              <Link href="/admin/inventory">Inspect Low Stock</Link>
            </Button>
          </div>
        )}

        {/* Dynamic Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Analytics preview */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-foreground">Revenue over time</h3>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </div>
              <StatusBadge tone="accent">+12.4%</StatusBadge>
            </div>
            <div className="h-56 w-full min-w-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueByMonth} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FED508" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#FFF4BE" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAD8CF" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: "#050505" }}
                      tick={{ fontSize: 12, fill: "#65645E" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tick={{ fontSize: 11, fill: "#65645E" }}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip contentStyle={tip} formatter={(v) => [formatINR(v), "Revenue"]} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#050505"
                      strokeWidth={2}
                      fill="url(#rev)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-secondary/30 animate-pulse rounded-sm" />
              )}
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="mb-6">
              <h3 className="font-serif text-2xl text-foreground">Rentals over time</h3>
              <p className="text-xs text-muted-foreground">Monthly bookings</p>
            </div>
            <div className="h-56 w-full min-w-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rentalsByMonth} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAD8CF" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: "#050505" }}
                      tick={{ fontSize: 12, fill: "#65645E" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      tick={{ fontSize: 11, fill: "#65645E" }}
                    />
                    <Tooltip
                      contentStyle={tip}
                      cursor={{ fill: "#FFF4BE" }}
                      formatter={(v) => [`${v} rentals`, ""]}
                    />
                    <Bar
                      dataKey="rentals"
                      fill="#FED508"
                      stroke="#050505"
                      strokeWidth={1}
                      radius={[2, 2, 0, 0]}
                      barSize={24}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-secondary/30 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Popular categories + props */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <h3 className="font-serif text-2xl text-foreground">Most popular categories</h3>
            <ul className="mt-6 space-y-4">
              {[...analytics.categoryDemand]
                .sort((a, b) => b.value - a.value)
                .map((c) => (
                  <li key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{c.value}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${c.value * 3.5}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-foreground">Most rented props</h3>
              <Link
                href="/admin/analytics"
                className="font-label text-[0.66rem] tracking-[0.14em] text-accent hover:underline"
              >
                DETAILS
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {popular.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <img
                    src={p.images?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="h-12 w-10 flex-shrink-0 object-cover border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{categoryName(p.category)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{p.rentalCount || 0} rentals</p>
                    <p className="text-xs text-muted-foreground">{formatINR(p.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent enquiries & rental activity */}
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h3 className="font-serif text-2xl text-foreground">Recent enquiries &amp; orders</h3>
              <p className="text-xs text-muted-foreground">Direct from website submissions and WhatsApp inquiries</p>
            </div>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 font-label text-[0.68rem] tracking-[0.14em] text-accent hover:underline"
            >
              TWO INBOXES <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="eyebrow">Enquiry ID</TableHead>
                  <TableHead className="eyebrow">Customer</TableHead>
                  <TableHead className="eyebrow">Items Requested</TableHead>
                  <TableHead className="eyebrow">Rental Dates</TableHead>
                  <TableHead className="eyebrow">Estimated Total</TableHead>
                  <TableHead className="eyebrow">Status</TableHead>
                  <TableHead className="eyebrow text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                      No recent enquiries or orders recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.slice(0, 6).map((r) => {
                    const m = statusMeta[r.status] || { label: r.status, tone: "muted" };
                    return (
                      <TableRow key={r.id} className="border-border">
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          {r.id}
                        </TableCell>
                        <TableCell>
                          <div className="text-foreground font-medium">{r.customer}</div>
                          <div className="text-xs text-muted-foreground">{r.company || r.phone}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {r.propNames && r.propNames.length > 0
                            ? r.propNames.join(", ")
                            : `${r.items} items`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
                          {r.startDate} → {r.endDate}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {formatINR(r.total)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="line" size="sm">
                            <Link href="/admin/enquiries">Manage</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
