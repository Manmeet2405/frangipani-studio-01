"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "@/context/AdminMenuContext";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatCard } from "@/components/admin/StatCard";
import { analytics, categoryName, formatINR } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";

const PIE = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--taupe))"];
const tip = { border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", borderRadius: 2, fontSize: 12 };
const rentalsByMonth = analytics.revenueByMonth.map((m) => ({ month: m.month, rentals: Math.round(m.revenue / 6800) }));

const Box = ({ title, subtitle, children, className = "" }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`border border-border bg-card p-6 min-w-0 ${className}`}>
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-6 h-64 w-full min-w-0">
        {mounted ? children : <div className="h-full w-full bg-secondary/30 animate-pulse rounded-sm" />}
      </div>
    </div>
  );
};

export default function AdminAnalytics() {
  const { openMenu } = useOutletContext();
  const { props } = useAdminData();

  const metrics = useMemo(() => {
    const totalRentals = props.reduce((s, p) => s + (p.rentalCount || 0), 0);
    const revenue = props.reduce((s, p) => s + (p.rentalCount || 0) * (p.pricePerDay || 0), 0);
    const avg = totalRentals ? Math.round(revenue / totalRentals) : 0;
    const available = props.filter((p) => p.availability === "available").length;
    const utilisation = props.length ? Math.round(((props.length - available) / props.length) * 100) : 0;
    return { totalRentals, revenue, avg, utilisation };
  }, [props]);

  const topProps = useMemo(() => [...props].sort((a, b) => (b.rentalCount || 0) - (a.rentalCount || 0)).slice(0, 6)
    .map((p) => ({ name: p.name.length > 22 ? p.name.slice(0, 20) + "…" : p.name, rentals: p.rentalCount || 0 })), [props]);

  const stats = [
    { label: "Total Rentals", value: metrics.totalRentals.toLocaleString("en-IN"), delta: "+9.2%", trend: "up", sub: "all time" },
    { label: "Estimated Revenue", value: formatINR(metrics.revenue), delta: "+12.4%", trend: "up", sub: "all time" },
    { label: "Avg. Rental Value", value: formatINR(metrics.avg), delta: "+3.1%", trend: "up", sub: "per booking" },
    { label: "Inventory Utilisation", value: `${metrics.utilisation}%`, delta: "-2.4%", trend: "down", sub: "currently out" },
  ];

  return (
    <>
      <AdminTopbar title="Analytics" subtitle="Performance overview" onMenu={openMenu} />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (<StatCard key={s.label} {...s} />))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box title="Monthly rental trends" subtitle="Bookings per month" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={rentalsByMonth} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <defs><linearGradient id="rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.28} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} width={30} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tip} formatter={(v) => [`${v} rentals`, ""]} />
                <Area type="monotone" dataKey="rentals" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#rt)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          <Box title="Popular categories" subtitle="Share of demand">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <PieChart>
                <Pie data={analytics.categoryDemand} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2} isAnimationActive={false}>
                  {analytics.categoryDemand.map((e, i) => (<Cell key={i} fill={PIE[i % PIE.length]} />))}
                </Pie>
                <Tooltip contentStyle={tip} formatter={(v, n) => [`${v}%`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box title="Revenue by month" subtitle="Last 6 months">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={analytics.revenueByMonth} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tip} formatter={(v) => [formatINR(v), "Revenue"]} cursor={{ fill: "hsl(var(--secondary))" }} />
                <Bar dataKey="revenue" fill="hsl(var(--gold))" radius={[2, 2, 0, 0]} barSize={22} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box title="Most rented props" subtitle="By total rental count">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={topProps} layout="vertical" margin={{ top: 0, right: 16, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                <Tooltip contentStyle={tip} cursor={{ fill: "hsl(var(--secondary))" }} formatter={(v) => [`${v} rentals`, ""]} />
                <Bar dataKey="rentals" fill="hsl(var(--accent))" radius={[0, 2, 2, 0]} barSize={16} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </div>
      </div>
    </>
  );
}
