"use client";

import React, { useState } from "react";
import { useOutletContext } from "@/context/AdminMenuContext";
import { Plus, Package, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminData } from "@/context/AdminDataContext";

const blank = { name: "", description: "", image: "" };

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2"><Label className="eyebrow text-foreground">{label}</Label>{children}</div>
);

export default function AdminCategories() {
  const { openMenu } = useOutletContext();
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [toDelete, setToDelete] = useState(null);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(blank); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description, image: c.image }); setDialogOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast("Please enter a category name"); return; }
    if (editing) { updateCategory(editing.slug, form); toast("Category updated", { description: form.name }); }
    else { addCategory(form); toast("Category added", { description: form.name }); }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) { deleteCategory(toDelete.slug); toast("Category deleted", { description: toDelete.name }); setToDelete(null); }
  };

  return (
    <>
      <AdminTopbar title="Categories" subtitle={`${categories.length} collections`} onMenu={openMenu}
        action={<Button onClick={openAdd} variant="editorial" size="sm"><Plus className="h-4 w-4" /> Add category</Button>} />
      <div className="p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <div key={c.slug} className="group flex flex-col overflow-hidden border border-border bg-card transition-shadow duration-300 hover:shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={c.image} alt={c.name} className="editorial-img h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-background/90 px-2.5 py-1 font-label text-[0.6rem] tracking-[0.12em] text-foreground backdrop-blur-sm"><Package className="h-3 w-3" /> {c.count}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-xl text-foreground">{c.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                <div className="mt-auto flex gap-2 pt-5">
                  <Button onClick={() => openEdit(c)} variant="line" size="sm" className="flex-1"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                    <a href={`/explore?category=${c.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> View</a>
                  </Button>
                  <Button onClick={() => setToDelete(c)} variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-burgundy hover:text-burgundy" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-2xl">{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="grid gap-5 py-2">
            <Field label="Category name"><Input value={form.name} onChange={(e) => setF("name", e.target.value)} className="h-11 rounded-sm" placeholder="Jewellery" /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={3} className="rounded-sm resize-none" placeholder="Pearl, gold and statement pieces for close-ups." /></Field>
            <Field label="Image URL"><Input value={form.image} onChange={(e) => setF("image", e.target.value)} className="h-11 rounded-sm" placeholder="https://…" /></Field>
            {form.image && (
              <div className="h-32 w-full overflow-hidden border border-border bg-muted"><img src={form.image} alt="preview" className="h-full w-full object-cover" /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="line" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="editorial" onClick={save}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.name} will be removed from the collection list. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
