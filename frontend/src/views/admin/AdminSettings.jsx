"use client";

import React, { useState } from "react";
import { useOutletContext } from "@/context/AdminMenuContext";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Database, ShieldCheck, CheckCircle2, Copy } from "lucide-react";
import { STUDIO_CONFIG } from "@/data/firangi";

const Row = ({ title, desc, children }) => (
  <div className="flex items-center justify-between gap-6 py-4">
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    {children}
  </div>
);

export default function AdminSettings() {
  const { openMenu } = useOutletContext();
  const [toggles, setToggles] = useState({
    requests: true,
    deposit: true,
    delivery: false,
    newsletter: true,
    waAdminAlerts: true,
    waCustomerConsent: true,
    autoReserveLock: true,
  });

  const [waConfig, setWaConfig] = useState({
    phoneNumberId: STUDIO_CONFIG.admin.phoneNumberId,
    wabaId: STUDIO_CONFIG.admin.wabaId,
    webhookVerifyToken: STUDIO_CONFIG.admin.verifyToken,
    adminPhone: STUDIO_CONFIG.phone,
    storageProvider: STUDIO_CONFIG.admin.storageProvider,
    warehouseLocation: STUDIO_CONFIG.warehouseLocation,
    defaultReorderThreshold: String(STUDIO_CONFIG.admin.reorderThreshold),
  });

  const setToggle = (k) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  const copyWebhookUrl = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : "https://studiofrangipani.rentals/api/whatsapp/webhook";
    navigator.clipboard?.writeText(url);
    toast("Webhook URL copied to clipboard", { description: url });
  };

  const save = (e) => {
    e.preventDefault();
    toast("Settings saved successfully", {
      description: "Studio operations, Meta WhatsApp credentials, and inventory parameters have been updated.",
    });
  };

  return (
    <>
      <AdminTopbar
        title="Settings"
        subtitle="Studio preferences · WhatsApp Cloud API & Architecture"
        onMenu={openMenu}
      />
      <form onSubmit={save} className="max-w-4xl space-y-8 p-5 lg:p-8">
        {/* Studio profile */}
        <section className="border border-border bg-card p-6">
          <h3 className="font-serif text-2xl text-foreground">Studio profile</h3>
          <p className="text-xs text-muted-foreground">Public details shown across the catalogue and enquiries.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Studio name</Label>
              <Input defaultValue={STUDIO_CONFIG.name} className="h-11 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Contact email</Label>
              <Input defaultValue={STUDIO_CONFIG.email} className="h-11 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="eyebrow text-foreground">Studio address</Label>
              <Textarea
                defaultValue={STUDIO_CONFIG.address}
                rows={2}
                className="rounded-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* WhatsApp Cloud API & Webhook Configuration (PDF Section 6) */}
        <section className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <h3 className="font-serif text-2xl text-foreground">Meta WhatsApp Cloud API</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Inbound two-way inbox, verified webhook receiver, and automated admin alerts (PDF Architecture Level B/C).
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cloud API Configured
            </span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Meta Phone Number ID</Label>
              <Input
                value={waConfig.phoneNumberId}
                onChange={(e) => setWaConfig((c) => ({ ...c, phoneNumberId: e.target.value }))}
                className="h-11 rounded-sm font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">WhatsApp Business Account (WABA) ID</Label>
              <Input
                value={waConfig.wabaId}
                onChange={(e) => setWaConfig((c) => ({ ...c, wabaId: e.target.value }))}
                className="h-11 rounded-sm font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="eyebrow text-foreground">Official Webhook Callback URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : "/api/whatsapp/webhook"}
                  className="h-11 rounded-sm bg-secondary/50 font-mono text-xs text-muted-foreground"
                />
                <Button type="button" variant="outline" onClick={copyWebhookUrl} className="h-11 gap-1.5 px-4">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Register this URL in Meta App Dashboard &gt; WhatsApp &gt; Configuration &gt; Webhook.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="eyebrow text-foreground">Webhook Verification Token (hub.verify_token)</Label>
              <Input
                value={waConfig.webhookVerifyToken}
                onChange={(e) => setWaConfig((c) => ({ ...c, webhookVerifyToken: e.target.value }))}
                className="h-11 rounded-sm font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="eyebrow text-foreground">Admin Alert Recipient Mobile (for automated enquiry notifications)</Label>
              <Input
                value={waConfig.adminPhone}
                onChange={(e) => setWaConfig((c) => ({ ...c, adminPhone: e.target.value }))}
                className="h-11 rounded-sm font-mono text-xs"
                placeholder="+91 98200 99881"
              />
            </div>
          </div>

          <div className="mt-4 divide-y divide-border border-t border-border pt-2">
            <Row
              title="Automatic WhatsApp alerts to Admin"
              desc="Send approved outbound template notification immediately upon new enquiry submission."
            >
              <Switch
                checked={toggles.waAdminAlerts}
                onCheckedChange={() => setToggle("waAdminAlerts")}
              />
            </Row>
            <Row
              title="Mandatory customer contact consent"
              desc="Require explicit opt-in checkbox on enquiry form before contacting via phone or WhatsApp."
            >
              <Switch
                checked={toggles.waCustomerConsent}
                onCheckedChange={() => setToggle("waCustomerConsent")}
              />
            </Row>
          </div>
        </section>

        {/* Database & Physical Inventory Architecture (PDF Section 7 & 8) */}
        <section className="border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-2xl text-foreground">Physical Inventory &amp; Storage Architecture</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Multi-tier inventory model: On-hand, Reserved, and Available balances with atomic row locking.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Database Solution</Label>
              <Input defaultValue="Supabase PostgreSQL (Relational + RLS)" readOnly className="h-11 rounded-sm bg-secondary/50 text-xs font-mono" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Image Storage Provider</Label>
              <Select
                value={waConfig.storageProvider}
                onValueChange={(v) => setWaConfig((c) => ({ ...c, storageProvider: v }))}
              >
                <SelectTrigger className="h-11 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase Storage (CDN + WebP optimization)</SelectItem>
                  <SelectItem value="cloudinary">Cloudinary Media Library</SelectItem>
                  <SelectItem value="cloudflare">Cloudflare R2 Object Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Default Warehouse Location</Label>
              <Input
                value={waConfig.warehouseLocation}
                onChange={(e) => setWaConfig((c) => ({ ...c, warehouseLocation: e.target.value }))}
                className="h-11 rounded-sm text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Default Low Stock Reorder Threshold</Label>
              <Input
                type="number"
                value={waConfig.defaultReorderThreshold}
                onChange={(e) => setWaConfig((c) => ({ ...c, defaultReorderThreshold: e.target.value }))}
                className="h-11 rounded-sm text-xs font-mono"
              />
            </div>
          </div>

          <div className="mt-4 divide-y divide-border border-t border-border pt-2">
            <Row
              title="Prevent over-reserving (Atomic Row Locking)"
              desc="Enforce strict Available = On-Hand - Reserved check. Block order confirmation if requested quantity exceeds available stock."
            >
              <Switch
                checked={toggles.autoReserveLock}
                onCheckedChange={() => setToggle("autoReserveLock")}
              />
            </Row>
          </div>
        </section>

        {/* Rental preferences */}
        <section className="border border-border bg-card p-6">
          <h3 className="font-serif text-2xl text-foreground">Rental preferences</h3>
          <div className="mt-4 divide-y divide-border">
            <Row title="Accept new requests" desc="Allow customers to submit rental requests.">
              <Switch checked={toggles.requests} onCheckedChange={() => setToggle("requests")} />
            </Row>
            <Row title="Require security deposit" desc="Apply a refundable deposit per piece.">
              <Switch checked={toggles.deposit} onCheckedChange={() => setToggle("deposit")} />
            </Row>
            <Row title="Offer studio delivery" desc="Enable on-set and studio delivery.">
              <Switch checked={toggles.delivery} onCheckedChange={() => setToggle("delivery")} />
            </Row>
            <Row title="Newsletter sign-ups" desc="Collect emails from the footer form.">
              <Switch checked={toggles.newsletter} onCheckedChange={() => setToggle("newsletter")} />
            </Row>
          </div>
        </section>

        {/* Pricing */}
        <section className="border border-border bg-card p-6">
          <h3 className="font-serif text-2xl text-foreground">Pricing defaults</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Deposit %</Label>
              <Input defaultValue="25" className="h-11 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Min. rental (days)</Label>
              <Input defaultValue="1" className="h-11 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="eyebrow text-foreground">Weekly discount %</Label>
              <Input defaultValue="15" className="h-11 rounded-sm" />
            </div>
          </div>
        </section>

        <Separator />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="line">
            Reset Defaults
          </Button>
          <Button type="submit" variant="editorial" size="lg">
            Save All Settings
          </Button>
        </div>
      </form>
    </>
  );
}
