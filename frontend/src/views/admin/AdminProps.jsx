"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useOutletContext } from "@/context/AdminMenuContext";
import { Plus, Eye, Pencil, Trash2, UploadCloud, Layers, AlertTriangle } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { categories, categoryName, allShootTypes, allStyles, formatINR, getPropSKU } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";

const blank = {
  name: "",
  sku: "",
  category: "decor",
  description: "",
  pricePerDay: "",
  onHand: 5,
  reserved: 0,
  reorderLevel: 2,
  location: "Main Studio - Rack A",
  supplier: "Studio Workshop",
  color: "",
  material: "",
  dimensions: "",
  condition: "Excellent",
  style: "Contemporary",
  shootTypes: [],
  availability: "available",
  images: [],
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <Label className="eyebrow text-foreground">{label}</Label>
    {children}
  </div>
);

export default function AdminProps() {
  const { openMenu } = useOutletContext();
  const { props, addProp, updateProp, deleteProp } = useAdminData();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(() => {
    return props.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;

      const onHand = Number(p.onHand ?? p.quantity ?? 1);
      const reserved = Number(p.reserved ?? 0);
      const available = p.available != null ? Number(p.available) : Math.max(0, onHand - reserved);
      const reorderLevel = Number(p.reorderLevel ?? 2);

      if (stockFilter === "available" && available <= 0) return false;
      if (stockFilter === "low_stock" && (available > reorderLevel || available === 0)) return false;
      if (stockFilter === "out_of_stock" && available > 0) return false;
      if (stockFilter === "reserved" && reserved === 0) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const sku = (p.sku || getPropSKU(p.id)).toLowerCase();
        const name = (p.name || "").toLowerCase();
        if (!name.includes(q) && !sku.includes(q) && !p.id.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [props, query, cat, stockFilter]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleShoot = (s) =>
    setForm((p) => ({
      ...p,
      shootTypes: p.shootTypes.includes(s)
        ? p.shootTypes.filter((x) => x !== s)
        : [...p.shootTypes, s],
    }));

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...blank,
      sku: `SF-${String(props.length + 1).padStart(3, "0")}`,
    });
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...p,
      sku: p.sku || getPropSKU(p.id),
      pricePerDay: String(p.pricePerDay),
      onHand: p.onHand ?? p.quantity ?? 1,
      reserved: p.reserved ?? 0,
      reorderLevel: p.reorderLevel ?? 2,
      location: p.location || "Main Studio - Rack A",
      supplier: p.supplier || "Studio Workshop",
    });
    setDialogOpen(true);
  };

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (file) setF("images", [URL.createObjectURL(file)]);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast("Please enter a prop name");
      return;
    }
    const onHandNum = Math.max(0, Number(form.onHand) || 0);
    const reservedNum = Math.max(0, Number(form.reserved) || 0);
    const availableNum = Math.max(0, onHandNum - reservedNum);

    const payload = {
      ...form,
      onHand: onHandNum,
      reserved: reservedNum,
      available: availableNum,
      quantity: onHandNum,
      availability: availableNum > 0 ? "available" : (reservedNum > 0 ? "reserved" : "rented"),
      sku: form.sku || getPropSKU(editing?.id || Date.now().toString()),
    };

    if (editing) {
      updateProp(editing.id, payload);
      toast("Prop updated", { description: `${form.name} (${payload.sku})` });
    } else {
      addProp(payload);
      toast("Prop added to catalogue", { description: `${form.name} (${payload.sku})` });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deleteProp(toDelete.id);
      toast("Prop deleted", { description: toDelete.name });
      setToDelete(null);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Prop Collection"
        subtitle={`${props.length} catalogue items · Physical inventory tracking`}
        onMenu={openMenu}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5">
              <Link href="/admin/inventory">
                <Layers className="h-4 w-4" /> Stock Ledger
              </Link>
            </Button>
            <Button onClick={openAdd} variant="editorial" size="sm">
              <Plus className="h-4 w-4" /> Add Prop
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, SKU (e.g. SF-WOD-001)…"
            className="lg:max-w-xs"
          />
          <div className="flex flex-wrap gap-3">
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="h-12 w-full rounded-sm sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="h-12 w-full rounded-sm sm:w-48">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inventory</SelectItem>
                <SelectItem value="available">In Stock (Available &gt; 0)</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤ Reorder)</SelectItem>
                <SelectItem value="reserved">Reserved Units (&gt; 0)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock (0 Avail)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="eyebrow">Prop &amp; SKU</TableHead>
                  <TableHead className="eyebrow">Category</TableHead>
                  <TableHead className="eyebrow">Price / Day</TableHead>
                  <TableHead className="eyebrow text-center">On-Hand</TableHead>
                  <TableHead className="eyebrow text-center">Reserved</TableHead>
                  <TableHead className="eyebrow text-center">Available</TableHead>
                  <TableHead className="eyebrow">Status</TableHead>
                  <TableHead className="eyebrow text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const sku = p.sku || getPropSKU(p.id);
                  const onHand = Number(p.onHand ?? p.quantity ?? 1);
                  const reserved = Number(p.reserved ?? 0);
                  const available = p.available != null ? Number(p.available) : Math.max(0, onHand - reserved);
                  const reorder = Number(p.reorderLevel ?? 2);
                  const isLow = available > 0 && available <= reorder;
                  const isOut = available <= 0;

                  return (
                    <TableRow key={p.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || "/placeholder.jpg"}
                            alt={p.name}
                            className="h-12 w-10 flex-shrink-0 object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{p.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] tracking-wider text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded-sm border border-border">
                                {sku}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                                {p.location || "Main Warehouse"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {categoryName(p.category)}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatINR(p.pricePerDay)}
                      </TableCell>
                      <TableCell className="text-center font-mono font-medium text-foreground">
                        {onHand}
                      </TableCell>
                      <TableCell className="text-center font-mono text-amber-700">
                        {reserved > 0 ? (
                          <span className="font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-sm">
                            {reserved}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-sm",
                            isOut
                              ? "bg-rose-500/15 text-rose-600 font-bold"
                              : isLow
                              ? "bg-amber-500/15 text-amber-600 font-bold"
                              : "bg-emerald-500/15 text-emerald-700"
                          )}
                        >
                          {available}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <StatusBadge tone="muted">Out of Stock</StatusBadge>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 font-label text-[10px] uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
                            <AlertTriangle className="h-3 w-3" /> Low ({available})
                          </span>
                        ) : (
                          <StatusBadge tone="accent">Available</StatusBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="View on site"
                          >
                            <Link href={`/product/${p.id}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            onClick={() => openEdit(p)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Prop & Inventory"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setToDelete(p)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-burgundy hover:text-burgundy"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {!rows.length && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No props match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing ? "Edit Prop & Physical Inventory" : "Add New Prop"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Prop Name">
                <Input
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                  className="h-11 rounded-sm"
                  placeholder="Vintage Handcrafted Brass Urli"
                />
              </Field>
            </div>

            <Field label="SKU Code (Stock Keeping Unit)">
              <Input
                value={form.sku}
                onChange={(e) => setF("sku", e.target.value.toUpperCase())}
                className="h-11 rounded-sm font-mono uppercase"
                placeholder="SF-BRS-001"
              />
            </Field>

            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setF("category", v)}>
                <SelectTrigger className="h-11 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Price per Day (₹)">
              <Input
                type="number"
                value={form.pricePerDay}
                onChange={(e) => setF("pricePerDay", e.target.value)}
                className="h-11 rounded-sm"
                placeholder="850"
              />
            </Field>

            <Field label="Warehouse Location / Shelf">
              <Input
                value={form.location || ""}
                onChange={(e) => setF("location", e.target.value)}
                className="h-11 rounded-sm"
                placeholder="Main Studio - Shelf B2"
              />
            </Field>

            {/* Physical Inventory Controls */}
            <div className="sm:col-span-2 rounded-sm border border-border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-serif text-sm font-semibold text-foreground">
                  Physical Inventory Balances (PDF Model)
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  Available = On-Hand minus Reserved
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="On-Hand (Sellable)">
                  <Input
                    type="number"
                    min="0"
                    value={form.onHand}
                    onChange={(e) => setF("onHand", e.target.value)}
                    className="h-10 rounded-sm bg-card font-mono"
                  />
                </Field>
                <Field label="Reserved (Orders)">
                  <Input
                    type="number"
                    min="0"
                    value={form.reserved}
                    disabled={!editing}
                    onChange={(e) => setF("reserved", e.target.value)}
                    className="h-10 rounded-sm bg-card font-mono text-amber-700"
                  />
                </Field>
                <Field label="Reorder Alert Level">
                  <Input
                    type="number"
                    min="1"
                    value={form.reorderLevel}
                    onChange={(e) => setF("reorderLevel", e.target.value)}
                    className="h-10 rounded-sm bg-card font-mono"
                  />
                </Field>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Currently available for rental:{" "}
                <strong className="text-foreground">
                  {Math.max(0, (Number(form.onHand) || 0) - (Number(form.reserved) || 0))} units
                </strong>
                .
              </p>
            </div>

            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
                  rows={3}
                  className="rounded-sm resize-none"
                />
              </Field>
            </div>

            <Field label="Supplier / Artisan">
              <Input
                value={form.supplier || ""}
                onChange={(e) => setF("supplier", e.target.value)}
                className="h-11 rounded-sm"
                placeholder="Moradabad Metal Craft"
              />
            </Field>

            <Field label="Colour">
              <Input
                value={form.color}
                onChange={(e) => setF("color", e.target.value)}
                className="h-11 rounded-sm"
              />
            </Field>
            <Field label="Material">
              <Input
                value={form.material}
                onChange={(e) => setF("material", e.target.value)}
                className="h-11 rounded-sm"
              />
            </Field>
            <Field label="Dimensions">
              <Input
                value={form.dimensions}
                onChange={(e) => setF("dimensions", e.target.value)}
                className="h-11 rounded-sm"
              />
            </Field>
            <Field label="Condition">
              <Input
                value={form.condition}
                onChange={(e) => setF("condition", e.target.value)}
                className="h-11 rounded-sm"
              />
            </Field>
            <Field label="Style">
              <Select value={form.style} onValueChange={(v) => setF("style", v)}>
                <SelectTrigger className="h-11 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allStyles.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Shoot Types">
                <div className="flex flex-wrap gap-2">
                  {allShootTypes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleShoot(s)}
                      className={cn(
                        "border px-3 py-1.5 text-xs transition-colors",
                        form.shootTypes.includes(s)
                          ? "border-accent bg-accent/10 text-accent font-medium"
                          : "border-border text-foreground hover:border-foreground/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Image (Supabase Storage / Cloudinary ready)">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden border border-border bg-muted">
                    {form.images[0] && (
                      <img src={form.images[0]} alt="preview" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-foreground/40">
                    <UploadCloud className="h-4 w-4" /> Upload image
                    <input type="file" accept="image/*" onChange={onImage} className="hidden" />
                  </label>
                </div>
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button variant="line" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="editorial" onClick={save}>
              Save Prop &amp; Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Delete this prop?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} ({toDelete?.sku || getPropSKU(toDelete?.id)}) will be removed from the catalogue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
