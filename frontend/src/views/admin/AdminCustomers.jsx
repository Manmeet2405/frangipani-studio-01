"use client";

import React, { useMemo, useState } from "react";
import { useOutletContext } from "@/context/AdminMenuContext";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/common/SearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";

const tierTone = { Production: "gold", Agency: "accent", Studio: "muted", Creator: "muted" };

export default function AdminCustomers() {
  const { openMenu } = useOutletContext();
  const { customers, requests } = useAdminData();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  const rows = useMemo(() => customers.filter((c) => `${c.name} ${c.company} ${c.city}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  const historyFor = (c) => requests.filter((r) => r.customer === c.name);
  const lastRental = (c) => { const h = historyFor(c); return h.length ? h[0].startDate : "—"; };

  return (
    <>
      <AdminTopbar title="Customers" subtitle={`${customers.length} accounts`} onMenu={openMenu} />
      <div className="space-y-6 p-5 lg:p-8">
        <SearchInput value={query} onChange={setQuery} placeholder="Search customers…" className="sm:max-w-xs" />
        <div className="border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="eyebrow">Customer</TableHead><TableHead className="eyebrow">Company</TableHead>
                  <TableHead className="eyebrow">Email</TableHead><TableHead className="eyebrow">Phone</TableHead>
                  <TableHead className="eyebrow">Rentals</TableHead><TableHead className="eyebrow">Last Rental</TableHead>
                  <TableHead className="eyebrow">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer border-border" onClick={() => setActive(c)}>
                    <TableCell>
                      <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-label text-[0.6rem] text-foreground">{c.name.split(" ").map((n) => n[0]).join("")}</div><span className="font-medium text-foreground">{c.name}</span></div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.company}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{c.rentals}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{lastRental(c)}</TableCell>
                    <TableCell><StatusBadge tone={tierTone[c.tier]}>{c.tier}</StatusBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {active && (
            <div>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-label text-sm text-accent-foreground">{active.name.split(" ").map((n) => n[0]).join("")}</div>
                  <div><SheetTitle className="font-serif text-2xl">{active.name}</SheetTitle><p className="text-sm text-muted-foreground">{active.company}</p></div>
                </div>
              </SheetHeader>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><h4 className="eyebrow mb-1 text-muted-foreground">Email</h4><p className="break-all text-foreground">{active.email}</p></div>
                <div><h4 className="eyebrow mb-1 text-muted-foreground">Phone</h4><p className="text-foreground">{active.phone}</p></div>
                <div><h4 className="eyebrow mb-1 text-muted-foreground">City</h4><p className="text-foreground">{active.city}</p></div>
                <div><h4 className="eyebrow mb-1 text-muted-foreground">Total spend</h4><p className="text-foreground">{formatINR(active.totalSpend)}</p></div>
                <div><h4 className="eyebrow mb-1 text-muted-foreground">Tier</h4><StatusBadge tone={tierTone[active.tier]}>{active.tier}</StatusBadge></div>
                <div><h4 className="eyebrow mb-1 text-muted-foreground">Member since</h4><p className="text-foreground">{new Date(active.joined).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p></div>
              </div>
              <Separator className="my-6" />
              <h4 className="eyebrow mb-4 text-muted-foreground">Rental history</h4>
              {historyFor(active).length ? (
                <ul className="divide-y divide-border">
                  {historyFor(active).map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                      <div><p className="font-medium text-foreground">{r.id}</p><p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p></div>
                      <span className="text-foreground">{formatINR(r.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent rentals on record. This customer has {active.rentals} lifetime rentals.</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
