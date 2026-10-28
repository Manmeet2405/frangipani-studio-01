"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useOutletContext } from "@/context/AdminMenuContext";
import {
  Boxes, PackageCheck, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Plus, RefreshCw, FileText, Download, Search, Filter, ShieldAlert,
  CheckCircle2, Clock, MapPin, Truck, RotateCcw, AlertOctagon, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/common/SearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  categories, categoryName, formatINR, exportInventoryToCSV,
  exportMovementsToCSV, downloadCSV
} from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";
import { cn } from "@/lib/utils";

export default function AdminInventory() {
  const { openMenu } = useOutletContext();
  const {
    props, stockMovements, receiveStock, reconcileStock, writeOffStock
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("balances");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");

  // Modals state
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);

  // Form states
  const [receiveForm, setReceiveForm] = useState({ qty: 5, ref: "", reason: "Stock replenishment", supplier: "" });
  const [reconcileForm, setReconcileForm] = useState({ physicalCount: 0, reason: "Monthly cycle count discrepancy" });
  const [writeOffForm, setWriteOffForm] = useState({ qty: 1, reason: "Damaged during production set" });

  // Summary Metrics (PDF Section 7 definitions)
  const metrics = useMemo(() => {
    const onHand = props.reduce((sum, p) => sum + (p.onHand || 0), 0);
    const reserved = props.reduce((sum, p) => sum + (p.reserved || 0), 0);
    const available = props.reduce((sum, p) => sum + (p.available ?? Math.max(0, p.onHand - p.reserved)), 0);
    const lowStockItems = props.filter((p) => (p.available ?? 0) <= (p.reorderLevel ?? 2));
    const outOfStockItems = props.filter((p) => (p.available ?? 0) === 0);
    return { onHand, reserved, available, lowStock: lowStockItems.length, outOfStock: outOfStockItems.length };
  }, [props]);

  // Filtered props list
  const filteredProps = useMemo(() => {
    return props.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (stockStatusFilter === "low" && (p.available ?? 0) > (p.reorderLevel ?? 2)) return false;
      if (stockStatusFilter === "out" && (p.available ?? 0) > 0) return false;
      if (stockStatusFilter === "in" && (p.available ?? 0) === 0) return false;
      if (query.trim()) {
        const text = `${p.name} ${p.sku || ""} ${p.location || ""}`.toLowerCase();
        if (!text.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [props, catFilter, stockStatusFilter, query]);

  // Filtered movements list
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      if (movementTypeFilter !== "all" && m.movementType !== movementTypeFilter) return false;
      if (query.trim()) {
        const text = `${m.sku} ${m.propName || ""} ${m.referenceId || ""} ${m.reason || ""}`.toLowerCase();
        if (!text.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [stockMovements, movementTypeFilter, query]);

  // Low stock list for alert banner
  const lowStockAlerts = useMemo(() => {
    return props.filter((p) => (p.available ?? 0) <= (p.reorderLevel ?? 2));
  }, [props]);

  // Actions
  const handleOpenReceive = (prop = null) => {
    const target = prop || props[0];
    setSelectedProp(target);
    setReceiveForm({
      qty: 5,
      ref: `PO-${Date.now().toString().slice(-4)}`,
      reason: "Inventory replenishment",
      supplier: target ? target.supplier || "Heritage Prop Atelier" : "",
    });
    setReceiveModalOpen(true);
  };

  const submitReceive = (e) => {
    e.preventDefault();
    if (!selectedProp) return;
    receiveStock(selectedProp.id, receiveForm.qty, receiveForm.ref, receiveForm.reason, "Admin");
    toast("Stock Received Successfully", {
      description: `Added ${receiveForm.qty} units to ${selectedProp.name} (${selectedProp.sku}).`,
    });
    setReceiveModalOpen(false);
  };

  const handleOpenReconcile = (prop) => {
    setSelectedProp(prop);
    setReconcileForm({
      physicalCount: prop.onHand || 0,
      reason: "Monthly cycle count discrepancy adjustment",
    });
    setReconcileModalOpen(true);
  };

  const submitReconcile = (e) => {
    e.preventDefault();
    if (!selectedProp) return;
    const res = reconcileStock(selectedProp.id, reconcileForm.physicalCount, reconcileForm.reason, "Admin");
    toast("Stock Count Reconciled", {
      description: `Adjusted by ${res.diff > 0 ? `+${res.diff}` : res.diff} units. Current on-hand: ${reconcileForm.physicalCount}.`,
    });
    setReconcileModalOpen(false);
  };

  const handleOpenWriteOff = (prop) => {
    setSelectedProp(prop);
    setWriteOffForm({
      qty: 1,
      reason: "Damaged during studio shoot; written off",
    });
    setWriteOffModalOpen(true);
  };

  const submitWriteOff = (e) => {
    e.preventDefault();
    if (!selectedProp) return;
    writeOffStock(selectedProp.id, writeOffForm.qty, writeOffForm.reason, "Admin");
    toast("Damaged Unit Written Off", {
      description: `Removed ${writeOffForm.qty} unit from sellable inventory.`,
    });
    setWriteOffModalOpen(false);
  };

  const handleExportBalances = () => {
    const csv = exportInventoryToCSV(props);
    downloadCSV(`studio_frangipani_inventory_balances_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast("Inventory CSV Exported", { description: `${props.length} records exported.` });
  };

  const handleExportMovements = () => {
    const csv = exportMovementsToCSV(stockMovements);
    downloadCSV(`studio_frangipani_movement_ledger_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast("Movement Ledger CSV Exported", { description: `${stockMovements.length} audit records exported.` });
  };

  return (
    <>
      <AdminTopbar
        title="Physical Inventory & Stock Ledger"
        subtitle="Exact On-hand, Reserved, and Available stock tracking per transactional ledger."
        onMenu={openMenu}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenReceive()} variant="editorial" size="sm">
              <Plus className="h-4 w-4" /> Receive Stock
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-5 lg:p-8">
        {/* KPI Stats Bar (PDF Section 7 definitions) */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">On-Hand Stock</span>
              <Boxes className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl text-foreground">{metrics.onHand}</span>
              <span className="text-xs text-muted-foreground">units</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Physically held sellable units in warehouse</p>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">Committed Reserved</span>
              <Clock className="h-5 w-5 text-gold" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl text-foreground">{metrics.reserved}</span>
              <span className="text-xs text-muted-foreground">units</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Committed to confirmed orders, awaiting dispatch</p>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">Available to Rent</span>
              <PackageCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl text-emerald-700">{metrics.available}</span>
              <span className="text-xs text-muted-foreground">units</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Exact sellable units (On-hand minus Reserved)</p>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">Low Stock Alerts</span>
              <AlertTriangle className={cn("h-5 w-5", metrics.lowStock > 0 ? "text-burgundy" : "text-muted-foreground")} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={cn("font-serif text-3xl", metrics.lowStock > 0 ? "text-burgundy" : "text-foreground")}>
                {metrics.lowStock}
              </span>
              <span className="text-xs text-muted-foreground">props</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">At or below reorder threshold (≤ 2 units)</p>
          </div>
        </div>

        {/* Low stock alert banner */}
        {lowStockAlerts.length > 0 && (
          <div className="border border-gold/40 bg-gold/5 p-4 sm:p-5 rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Low Stock Attention Required ({lowStockAlerts.length} pieces)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lowStockAlerts.map((p) => `${p.name} (${p.available ?? 0} avail)`).slice(0, 3).join(", ")}
                    {lowStockAlerts.length > 3 && ` and ${lowStockAlerts.length - 3} more`}.
                  </p>
                </div>
              </div>
              <Button
                variant="line"
                size="sm"
                onClick={() => setStockStatusFilter("low")}
                className="self-start sm:self-auto border-gold/40 text-gold hover:bg-gold/10"
              >
                View Low Stock Pieces
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="balances" className="data-[state=active]:bg-card font-label text-xs tracking-[0.1em]">
                <Boxes className="h-3.5 w-3.5 mr-1.5" /> Physical Stock Balances ({props.length})
              </TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-card font-label text-xs tracking-[0.1em]">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Transaction Ledger ({stockMovements.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab === "balances" ? (
                <Button onClick={handleExportBalances} variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export Balances CSV
                </Button>
              ) : (
                <Button onClick={handleExportMovements} variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export Ledger CSV
                </Button>
              )}
            </div>
          </div>

          {/* TAB 1: PHYSICAL BALANCES */}
          <TabsContent value="balances" className="space-y-4 m-0">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by SKU, prop name, rack..."
                className="lg:max-w-xs"
              />
              <div className="flex flex-wrap gap-2.5">
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="h-11 w-full sm:w-48 rounded-sm text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="h-11 w-full sm:w-44 rounded-sm text-xs">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in">In Stock (Available &gt; 0)</SelectItem>
                    <SelectItem value="low">Low Stock (≤ Reorder)</SelectItem>
                    <SelectItem value="out">Out of Stock (0 Avail)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Balances Table */}
            <div className="border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="eyebrow">SKU</TableHead>
                      <TableHead className="eyebrow">Prop Name</TableHead>
                      <TableHead className="eyebrow">Category</TableHead>
                      <TableHead className="eyebrow">Location / Rack</TableHead>
                      <TableHead className="eyebrow text-center">On-Hand</TableHead>
                      <TableHead className="eyebrow text-center">Reserved</TableHead>
                      <TableHead className="eyebrow text-center">Available</TableHead>
                      <TableHead className="eyebrow">Stock Status</TableHead>
                      <TableHead className="eyebrow text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProps.map((p) => {
                      const avail = p.available ?? Math.max(0, p.onHand - p.reserved);
                      const isLow = avail <= (p.reorderLevel ?? 2);
                      const isOut = avail === 0;

                      return (
                        <TableRow key={p.id} className="border-border hover:bg-secondary/20">
                          <TableCell className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                            {p.sku}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt={p.name} className="h-10 w-8 object-cover border border-border flex-shrink-0" />
                              <div className="min-w-0">
                                <Link href={`/product/${p.id}`} className="font-medium text-sm text-foreground hover:text-accent truncate block max-w-[200px]">
                                  {p.name}
                                </Link>
                                <span className="text-[0.68rem] text-muted-foreground">{formatINR(p.pricePerDay)}/day</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {categoryName(p.category)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-accent" /> {p.location || "Warehouse 1"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm font-medium text-foreground">
                            {p.onHand}
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm font-medium text-gold">
                            {p.reserved}
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm font-bold">
                            <span className={cn(isOut ? "text-burgundy" : (isLow ? "text-gold" : "text-emerald-700"))}>
                              {avail}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 font-label text-[0.62rem] tracking-[0.12em]",
                              isOut
                                ? "bg-burgundy/10 text-burgundy border border-burgundy/30"
                                : isLow
                                ? "bg-gold/15 text-gold border border-gold/40"
                                : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25"
                            )}>
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isOut ? "bg-burgundy" : (isLow ? "bg-gold" : "bg-emerald-600")
                              )} />
                              {isOut ? "OUT OF STOCK" : (isLow ? "LOW STOCK" : "IN STOCK")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReceive(p)}
                                title="Receive stock / Stock in"
                                className="h-8 px-2 text-xs"
                              >
                                + Stock
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenReconcile(p)}
                                title="Cycle count & reconcile"
                                className="h-8 px-2 text-xs text-muted-foreground"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenWriteOff(p)}
                                title="Write off damaged unit"
                                className="h-8 px-2 text-xs text-burgundy hover:text-burgundy"
                              >
                                <AlertOctagon className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {!filteredProps.length && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No inventory pieces match your current filters.
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: TRANSACTION LEDGER */}
          <TabsContent value="movements" className="space-y-4 m-0">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search ledger by SKU, ref, reason..."
                className="lg:max-w-xs"
              />
              <div className="flex gap-2.5">
                <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                  <SelectTrigger className="h-11 w-full sm:w-48 rounded-sm text-xs">
                    <SelectValue placeholder="Movement Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Movement Types</SelectItem>
                    <SelectItem value="receipt">Stock Receipts (+)</SelectItem>
                    <SelectItem value="reserve">Order Reservations</SelectItem>
                    <SelectItem value="dispatch">Dispatches (-)</SelectItem>
                    <SelectItem value="return">Returns (+)</SelectItem>
                    <SelectItem value="adjustment">Reconciliations (±)</SelectItem>
                    <SelectItem value="write_off">Damaged Write-offs (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="eyebrow">Movement ID</TableHead>
                      <TableHead className="eyebrow">Timestamp</TableHead>
                      <TableHead className="eyebrow">Type</TableHead>
                      <TableHead className="eyebrow">SKU &amp; Prop</TableHead>
                      <TableHead className="eyebrow text-center">Change (Signed Qty)</TableHead>
                      <TableHead className="eyebrow text-center">Resulting Balances</TableHead>
                      <TableHead className="eyebrow">Reference ID</TableHead>
                      <TableHead className="eyebrow">Reason / Audit Trail</TableHead>
                      <TableHead className="eyebrow">Actor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((m) => {
                      const isPositive = m.signedQty > 0;
                      return (
                        <TableRow key={m.id} className="border-border">
                          <TableCell className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                            {m.id}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(m.createdAt).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 font-label text-[0.62rem] tracking-[0.1em]",
                              m.movementType === "receipt" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25" :
                              m.movementType === "reserve" ? "bg-gold/15 text-gold border border-gold/30" :
                              m.movementType === "dispatch" ? "bg-blue-500/10 text-blue-700 border border-blue-500/25" :
                              m.movementType === "return" ? "bg-purple-500/10 text-purple-700 border border-purple-500/25" :
                              m.movementType === "write_off" ? "bg-burgundy/10 text-burgundy border border-burgundy/30" :
                              "bg-secondary text-foreground"
                            )}>
                              {m.movementType.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-mono text-xs font-medium text-foreground">{m.sku}</span>
                              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{m.propName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm font-semibold whitespace-nowrap">
                            <span className={isPositive ? "text-emerald-700" : (m.signedQty < 0 ? "text-burgundy" : "text-muted-foreground")}>
                              {isPositive ? `+${m.signedQty}` : m.signedQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground whitespace-nowrap">
                            OH: {m.onHandAfter} | Res: {m.reservedAfter} | Avail: {m.availableAfter}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-foreground whitespace-nowrap">
                            {m.referenceId || "\u2014"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {m.reason}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {m.actor || "Admin"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {!filteredMovements.length && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No stock ledger entries found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL 1: RECEIVE STOCK (Stock-in / Receipt) */}
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Receive Physical Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitReceive} className="space-y-4 py-2">
            <div>
              <Label className="eyebrow text-foreground">Select Prop / SKU</Label>
              <Select
                value={selectedProp?.id || ""}
                onValueChange={(id) => setSelectedProp(props.find((p) => p.id === id))}
              >
                <SelectTrigger className="h-11 rounded-sm mt-1.5">
                  <SelectValue placeholder="Choose prop" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {props.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.sku} \u2014 {p.name} ({p.onHand} on-hand)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="eyebrow text-foreground">Quantity to Receive</Label>
                <Input
                  type="number"
                  min="1"
                  value={receiveForm.qty}
                  onChange={(e) => setReceiveForm((f) => ({ ...f, qty: e.target.value }))}
                  className="h-11 rounded-sm mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="eyebrow text-foreground">PO / Delivery Ref</Label>
                <Input
                  value={receiveForm.ref}
                  onChange={(e) => setReceiveForm((f) => ({ ...f, ref: e.target.value }))}
                  placeholder="PO-2026-042"
                  className="h-11 rounded-sm mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="eyebrow text-foreground">Supplier / Atelier</Label>
              <Input
                value={receiveForm.supplier}
                onChange={(e) => setReceiveForm((f) => ({ ...f, supplier: e.target.value }))}
                placeholder="Heritage Prop Atelier"
                className="h-11 rounded-sm mt-1.5"
              />
            </div>

            <div>
              <Label className="eyebrow text-foreground">Audit Reason / Notes</Label>
              <Input
                value={receiveForm.reason}
                onChange={(e) => setReceiveForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Stock replenishment batch"
                className="h-11 rounded-sm mt-1.5"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="line" onClick={() => setReceiveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="editorial">
                Confirm Stock Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: RECONCILE STOCK COUNT */}
      <Dialog open={reconcileModalOpen} onOpenChange={setReconcileModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Reconcile Stock Count</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitReconcile} className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Per studio guidelines, inventory balances are corrected via ledger reconciliation entries
              rather than erasing historical records.
            </p>

            <div className="border border-border bg-secondary/20 p-3 rounded-sm space-y-1">
              <p className="text-sm font-medium text-foreground">{selectedProp?.name}</p>
              <p className="font-mono text-xs text-muted-foreground">SKU: {selectedProp?.sku}</p>
              <p className="text-xs text-muted-foreground">
                Currently Recorded On-Hand: <strong className="text-foreground">{selectedProp?.onHand}</strong> units
              </p>
            </div>

            <div>
              <Label className="eyebrow text-foreground">Physical Count (Actual on shelf)</Label>
              <Input
                type="number"
                min="0"
                value={reconcileForm.physicalCount}
                onChange={(e) => setReconcileForm((f) => ({ ...f, physicalCount: e.target.value }))}
                className="h-11 rounded-sm mt-1.5 font-mono text-lg"
                required
              />
              <span className="text-[0.68rem] text-muted-foreground mt-1 block">
                Calculated adjustment entry:{" "}
                <strong className={Number(reconcileForm.physicalCount) - (selectedProp?.onHand || 0) >= 0 ? "text-emerald-700" : "text-burgundy"}>
                  {Number(reconcileForm.physicalCount) - (selectedProp?.onHand || 0) > 0 ? "+" : ""}
                  {Number(reconcileForm.physicalCount) - (selectedProp?.onHand || 0)} units
                </strong>
              </span>
            </div>

            <div>
              <Label className="eyebrow text-foreground">Audit Reason</Label>
              <Input
                value={reconcileForm.reason}
                onChange={(e) => setReconcileForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Discrepancy identified in monthly cycle count"
                className="h-11 rounded-sm mt-1.5"
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="line" onClick={() => setReconcileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="editorial">
                Apply Reconciliation Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: WRITE-OFF DAMAGED UNIT */}
      <Dialog open={writeOffModalOpen} onOpenChange={setWriteOffModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-burgundy">Write Off Damaged Prop</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitWriteOff} className="space-y-4 py-2">
            <div className="border border-border bg-secondary/20 p-3 rounded-sm space-y-1">
              <p className="text-sm font-medium text-foreground">{selectedProp?.name}</p>
              <p className="font-mono text-xs text-muted-foreground">SKU: {selectedProp?.sku}</p>
              <p className="text-xs text-muted-foreground">
                Currently On-Hand: <strong className="text-foreground">{selectedProp?.onHand}</strong> units
              </p>
            </div>

            <div>
              <Label className="eyebrow text-foreground">Units to Write Off</Label>
              <Input
                type="number"
                min="1"
                max={selectedProp?.onHand || 1}
                value={writeOffForm.qty}
                onChange={(e) => setWriteOffForm((f) => ({ ...f, qty: e.target.value }))}
                className="h-11 rounded-sm mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="eyebrow text-foreground">Reason / Damage Report</Label>
              <Textarea
                rows={3}
                value={writeOffForm.reason}
                onChange={(e) => setWriteOffForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Broken glass fluting on editorial shoot; unit quarantined."
                className="rounded-sm resize-none mt-1.5"
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="line" onClick={() => setWriteOffModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="outline" className="border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white">
                Confirm Damage Write-off
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
