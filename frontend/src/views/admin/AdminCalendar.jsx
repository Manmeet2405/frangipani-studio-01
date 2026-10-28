"use client";

import React, { useMemo, useState } from "react";
import { useOutletContext } from "@/context/AdminMenuContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format, parseISO, isWithinInterval, addMonths } from "date-fns";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { statusMeta, formatINR } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";
import { cn } from "@/lib/utils";

const toneDot = { pending: "bg-taupe", confirmed: "bg-accent", active: "bg-gold", returned: "bg-accent/50", cancelled: "bg-destructive" };
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminCalendar() {
  const { openMenu } = useOutletContext();
  const { requests } = useAdminData();
  const [cursor, setCursor] = useState(new Date(2026, 1, 1));
  const [active, setActive] = useState(null);

  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) }), [cursor]);
  const bookingsFor = (day) => requests.filter((r) => { try { return r.status !== "cancelled" && isWithinInterval(day, { start: parseISO(r.startDate), end: parseISO(r.endDate) }); } catch { return false; } });

  return (
    <>
      <AdminTopbar title="Calendar" subtitle="Bookings & availability" onMenu={openMenu} />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-3xl text-foreground">{format(cursor, "MMMM yyyy")}</h2>
            <div className="flex gap-1">
              <button aria-label="Previous month" onClick={() => setCursor((c) => addMonths(c, -1))} className="flex h-9 w-9 items-center justify-center rounded-sm border border-input hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
              <button aria-label="Next month" onClick={() => setCursor((c) => addMonths(c, 1))} className="flex h-9 w-9 items-center justify-center rounded-sm border border-input hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[["pending", "Pending"], ["confirmed", "Confirmed"], ["active", "Active"], ["returned", "Returns"]].map(([k, label]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("h-2 w-2 rounded-full", toneDot[k])} />{label}</span>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border">{weekdays.map((d) => (<div key={d} className="eyebrow px-3 py-3 text-center text-muted-foreground">{d}</div>))}</div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const inMonth = isSameMonth(day, cursor);
              const isToday = isSameDay(day, new Date());
              const bookings = bookingsFor(day);
              return (
                <div key={i} className={cn("min-h-[96px] border-b border-r border-border p-2", !inMonth && "bg-secondary/30", (i + 1) % 7 === 0 && "border-r-0")}>
                  <div className={cn("mb-1 flex h-6 w-6 items-center justify-center text-xs", isToday ? "rounded-full bg-accent text-accent-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50")}>{format(day, "d")}</div>
                  <div className="space-y-1">
                    {bookings.slice(0, 3).map((b) => (
                      <button key={b.id} onClick={() => setActive(b)} className="flex w-full items-center gap-1 truncate rounded-sm bg-secondary px-1.5 py-0.5 text-left hover:bg-accent/10">
                        <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[b.status])} /><span className="truncate text-[0.62rem] text-foreground">{b.customer.split(" ")[0]}</span>
                      </button>
                    ))}
                    {bookings.length > 3 && <div className="px-1.5 text-[0.6rem] text-muted-foreground">+{bookings.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          {active && (
            <div>
              <SheetHeader className="text-left"><SheetTitle className="font-serif text-2xl">{active.id}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-5 text-sm">
                <div className="flex items-center justify-between"><span className="eyebrow text-muted-foreground">Status</span><StatusBadge tone={statusMeta[active.status].tone}>{statusMeta[active.status].label}</StatusBadge></div>
                <Separator />
                <div><h4 className="eyebrow mb-1.5 text-muted-foreground">Customer</h4><p className="font-medium text-foreground">{active.customer}</p><p className="text-muted-foreground">{active.company}</p></div>
                <div><h4 className="eyebrow mb-1.5 text-muted-foreground">Props</h4><ul className="space-y-1">{active.propNames.map((n) => (<li key={n} className="text-foreground">{n}</li>))}</ul></div>
                <div><h4 className="eyebrow mb-1.5 text-muted-foreground">Rental dates</h4><p className="text-foreground">{active.startDate} → {active.endDate}</p></div>
                <div className="flex items-baseline justify-between border-t border-border pt-4"><span className="eyebrow text-muted-foreground">Amount</span><span className="font-serif text-xl text-foreground">{formatINR(active.total)}</span></div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
