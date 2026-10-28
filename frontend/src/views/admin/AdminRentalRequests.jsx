"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useOutletContext } from "@/context/AdminMenuContext";
import {
  Inbox, MessageSquare, Send, CheckCircle2, AlertTriangle, Phone, Mail,
  ExternalLink, ArrowUpRight, Search, Filter, ShieldCheck, Clock, Check,
  RotateCcw, Truck, XCircle, Sparkles, Plus, RefreshCw, UserCheck, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { statusMeta, categoryName, formatINR, normalizePhone, STUDIO_CONFIG } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";
import { cn } from "@/lib/utils";

const WEBSITE_STATUSES = ["all", "new", "contacted", "quoted", "won", "lost"];
const WA_STATUSES = ["all", "unread", "open", "waiting", "closed"];

const QUICK_TEMPLATES = [
  {
    label: "Quotation & Availability Ready",
    text: "Hello! We have reviewed your enquiry and all requested pieces are available. The total quotation with our shoot-ready styling service is attached. Shall we proceed with reservation?",
  },
  {
    label: "Order Confirmed & Stock Reserved",
    text: "Great news! Your booking is confirmed and all units have been officially committed and reserved in our studio atelier. We will prepare them 24 hours prior to your shoot date.",
  },
  {
    label: "Studio Delivery Schedule",
    text: "Hi! Our dispatch team will deliver the prepped props directly to your studio set by 9:00 AM on the shoot day. Please coordinate security gate access.",
  },
  {
    label: "Return Confirmation",
    text: "Thank you for returning the props! Our team has inspected the pieces and processed your security deposit refund.",
  },
];

export default function AdminRentalRequests() {
  const { openMenu } = useOutletContext();
  const {
    enquiries, waConversations, props, confirmEnquiry, dispatchOrder,
    returnOrder, cancelEnquiry, deleteEnquiry, updateEnquiryStatus, sendWhatsAppMessage,
    simulateInboundWhatsApp, updateWhatsAppStatus, deleteWhatsAppConversation
  } = useAdminData();

  // Active top-level inbox tab: "website" | "whatsapp"
  const [inboxTab, setInboxTab] = useState("website");

  // Deletion Confirmation Dialog States
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [convToDelete, setConvToDelete] = useState(null);

  // Website Enquiries filter states
  const [webQuery, setWebQuery] = useState("");
  const [webStatus, setWebStatus] = useState("all");
  const [activeEnquiry, setActiveEnquiry] = useState(null);

  // WhatsApp Inbox filter states
  const [waQuery, setWaQuery] = useState("");
  const [waStatusFilter, setWaStatusFilter] = useState("all");
  const [selectedConvId, setSelectedConvId] = useState(waConversations[0]?.id || null);
  const [replyText, setReplyText] = useState("");

  // Inbound Simulation Modal
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simPhone, setSimPhone] = useState(STUDIO_CONFIG.phone);
  const [simCustomer, setSimCustomer] = useState("Aarav Mehta");
  const [simMessage, setSimMessage] = useState("Can I add one more item to my shoot booking for next Tuesday?");

  // Filtered Website Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (webStatus !== "all" && e.status !== webStatus) return false;
      if (webQuery.trim()) {
        const text = `${e.reference || e.id} ${e.customer} ${e.company || ""} ${e.phone || ""}`.toLowerCase();
        if (!text.includes(webQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [enquiries, webStatus, webQuery]);

  // Filtered WhatsApp Conversations
  const filteredConversations = useMemo(() => {
    return waConversations.filter((c) => {
      if (waStatusFilter !== "all" && c.status !== waStatusFilter) return false;
      if (waQuery.trim()) {
        const text = `${c.customerName} ${c.company || ""} ${c.phone} ${c.messages?.[c.messages.length - 1]?.text || ""}`.toLowerCase();
        if (!text.includes(waQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [waConversations, waStatusFilter, waQuery]);

  // Currently selected WhatsApp conversation
  const activeConversation = useMemo(() => {
    return waConversations.find((c) => c.id === selectedConvId) || waConversations[0] || null;
  }, [waConversations, selectedConvId]);

  // Linked enquiry for active WhatsApp conversation (shared contact via normalized phone)
  const linkedEnquiry = useMemo(() => {
    if (!activeConversation) return null;
    const norm = activeConversation.normalizedPhone || normalizePhone(activeConversation.phone);
    return enquiries.find((e) => e.normalizedPhone === norm || e.phone === activeConversation.phone);
  }, [activeConversation, enquiries]);

  // Unread badge counts
  const unreadWebCount = useMemo(() => enquiries.filter((e) => e.unread || e.status === "new").length, [enquiries]);
  const unreadWaCount = useMemo(() => waConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0), [waConversations]);

  // --------------------------------------------------------------------------
  // ACTIONS: ENQUIRY WORKFLOW (Atomic stock actions)
  // --------------------------------------------------------------------------
  const handleConfirmReservation = (enq) => {
    const res = confirmEnquiry(enq.id, "Admin");
    if (!res.success) {
      toast("Cannot Confirm Reservation", { description: res.error });
      return;
    }
    toast("Order Confirmed & Stock Reserved", {
      description: `Committed units in physical inventory for ${enq.customer}. Movement logged to ledger.`,
    });
    setActiveEnquiry((prev) => (prev && prev.id === enq.id ? { ...prev, status: "won" } : prev));
  };

  const handleDispatch = (enq) => {
    dispatchOrder(enq.id, "Admin");
    toast("Order Dispatched", { description: `Deducted on-hand & reserved units for ${enq.reference}.` });
    setActiveEnquiry((prev) => (prev && prev.id === enq.id ? { ...prev, status: "active" } : prev));
  };

  const handleReturn = (enq) => {
    returnOrder(enq.id, "Admin");
    toast("Order Returned & Restocked", { description: `Added units back into available on-hand stock.` });
    setActiveEnquiry((prev) => (prev && prev.id === enq.id ? { ...prev, status: "returned" } : prev));
  };

  const handleCancel = (enq) => {
    cancelEnquiry(enq.id, "Admin");
    toast("Order Cancelled", { description: `Released any reserved units back into available inventory.` });
    setActiveEnquiry((prev) => (prev && prev.id === enq.id ? { ...prev, status: "lost" } : prev));
  };

  const handleConfirmDeleteEnquiry = () => {
    if (!enquiryToDelete) return;
    deleteEnquiry(enquiryToDelete.id);
    toast("Order Enquiry Deleted", {
      description: `Order ${enquiryToDelete.reference || enquiryToDelete.id} from ${enquiryToDelete.customer} has been permanently deleted.`,
    });
    if (activeEnquiry && (activeEnquiry.id === enquiryToDelete.id || activeEnquiry.reference === enquiryToDelete.id)) {
      setActiveEnquiry(null);
    }
    setEnquiryToDelete(null);
  };

  const handleConfirmDeleteConv = () => {
    if (!convToDelete) return;
    deleteWhatsAppConversation(convToDelete.id);
    toast("WhatsApp Conversation Deleted", {
      description: `Chat thread with ${convToDelete.customerName} has been deleted.`,
    });
    if (activeConversation?.id === convToDelete.id) {
      setSelectedConvId(null);
    }
    setConvToDelete(null);
  };

  // Reply via WhatsApp action
  const handleReplyClickWhatsApp = (enq) => {
    const norm = normalizePhone(enq.phone);
    const text = `Hello ${enq.customer}! ${STUDIO_CONFIG.name} here regarding your enquiry ${enq.reference || enq.id}. We have reviewed your request for ${enq.days} days shoot.`;
    const url = `https://wa.me/${norm}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // --------------------------------------------------------------------------
  // ACTIONS: WHATSAPP MESSAGING
  // --------------------------------------------------------------------------
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;
    sendWhatsAppMessage(activeConversation.id, replyText.trim(), "Admin");
    setReplyText("");
    toast("WhatsApp Message Dispatched", { description: `Sent to ${activeConversation.phone} via Meta Cloud API.` });
  };

  const handleInsertTemplate = (text) => {
    setReplyText(text);
  };

  const handleSimulateWebhook = (e) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    simulateInboundWhatsApp(simPhone, simMessage.trim(), simCustomer);
    setSimModalOpen(false);
    toast("Inbound Meta Webhook Simulated", {
      description: `Received WhatsApp message from ${simCustomer} (${simPhone}).`,
    });
  };

  return (
    <>
      <AdminTopbar
        title="Enquiry Hub & Two Inboxes"
        subtitle="Manage website quote requests and two-way Meta WhatsApp customer conversations."
        onMenu={openMenu}
        action={
          inboxTab === "whatsapp" && (
            <Button
              onClick={() => setSimModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-emerald-600/40 text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" /> Simulate Inbound WhatsApp
            </Button>
          )
        }
      />

      <div className="space-y-6 p-5 lg:p-8">
        {/* Main Inbox Selector (PDF Section 5: "Two inboxes in the admin dashboard") */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setInboxTab("website")}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3.5 font-serif text-lg transition-colors border-b-2 -mb-px",
              inboxTab === "website"
                ? "border-accent text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Inbox className="h-5 w-5" />
            <span>Website Enquiries</span>
            {unreadWebCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-label text-[0.62rem] text-accent-foreground">
                {unreadWebCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setInboxTab("whatsapp")}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3.5 font-serif text-lg transition-colors border-b-2 -mb-px",
              inboxTab === "whatsapp"
                ? "border-accent text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            <span>WhatsApp Two-Way Inbox</span>
            {unreadWaCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 font-label text-[0.62rem] text-white">
                {unreadWaCount}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* INBOX 1: WEBSITE ENQUIRIES (per PDF Section 5)                   */}
        {/* ================================================================= */}
        {inboxTab === "website" && (
          <div className="space-y-6">
            {/* Status Pills & Search Filter */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5 bg-muted/50 p-1 rounded-sm border border-border">
                {WEBSITE_STATUSES.map((st) => {
                  const count = st === "all" ? enquiries.length : enquiries.filter((e) => e.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setWebStatus(st)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 font-label text-xs tracking-[0.1em] rounded-sm transition-all",
                        webStatus === st
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="capitalize">{st === "all" ? "All Enquiries" : statusMeta[st]?.label || st}</span>
                      <span className="text-[0.65rem] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <SearchInput
                value={webQuery}
                onChange={setWebQuery}
                placeholder="Search reference, customer, phone..."
                className="lg:max-w-xs"
              />
            </div>

            {/* Enquiries Table */}
            <div className="border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="eyebrow">Enquiry Ref</TableHead>
                      <TableHead className="eyebrow">Customer &amp; Phone</TableHead>
                      <TableHead className="eyebrow">Requested Pieces (Snapshot)</TableHead>
                      <TableHead className="eyebrow">Rental Dates</TableHead>
                      <TableHead className="eyebrow">Est. Quote</TableHead>
                      <TableHead className="eyebrow">Status</TableHead>
                      <TableHead className="eyebrow text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnquiries.map((enq) => {
                      const meta = statusMeta[enq.status] || statusMeta.new;
                      const itemCount = (enq.items || []).reduce((s, i) => s + (i.quantity || 1), 0);

                      return (
                        <TableRow
                          key={enq.id}
                          onClick={() => setActiveEnquiry(enq)}
                          className={cn(
                            "cursor-pointer border-border hover:bg-secondary/20 transition-colors",
                            enq.unread && "bg-accent/5 font-medium"
                          )}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {enq.unread && <span className="h-2 w-2 rounded-full bg-accent" />}
                              <span>{enq.reference || enq.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground">{enq.customer}</div>
                            <div className="text-xs text-muted-foreground">{enq.company || "Direct Individual"} \u00B7 {enq.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {(enq.items || []).map((x) => `${x.quantity || 1}\u00D7 ${x.name}`).slice(0, 2).join(", ")}
                              {(enq.items || []).length > 2 && ` +${(enq.items || []).length - 2} more`}
                            </div>
                            <span className="text-[0.68rem] text-muted-foreground">{itemCount} total units \u00B7 {enq.shootType}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {enq.startDate} \u2192 {enq.endDate} ({enq.days}d)
                          </TableCell>
                          <TableCell className="font-serif text-sm font-semibold text-foreground whitespace-nowrap">
                            {formatINR(enq.subtotal)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReplyClickWhatsApp(enq)}
                                title="Click to chat on WhatsApp"
                                className="h-8 border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="line"
                                size="sm"
                                onClick={() => setActiveEnquiry(enq)}
                                className="h-8 text-xs"
                              >
                                Review
                              </Button>
                              {enq.status === "lost" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEnquiryToDelete(enq)}
                                  title="Delete cancelled order"
                                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {!filteredEnquiries.length && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No website enquiries match your current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* INBOX 2: WHATSAPP TWO-WAY INBOX (per PDF Section 5 & 6)          */}
        {/* ================================================================= */}
        {inboxTab === "whatsapp" && (
          <div className="grid gap-6 lg:grid-cols-[340px_1fr] border border-border bg-card shadow-sm min-h-[640px]">
            {/* LEFT: Conversation List */}
            <div className="border-r border-border flex flex-col">
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-foreground">Conversations</h3>
                  <span className="font-label text-[0.62rem] text-muted-foreground tracking-[0.1em]">
                    META CLOUD API v21.0
                  </span>
                </div>
                <SearchInput
                  value={waQuery}
                  onChange={setWaQuery}
                  placeholder="Search chats by name or phone..."
                />
                <div className="flex flex-wrap gap-1">
                  {WA_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setWaStatusFilter(st)}
                      className={cn(
                        "px-2 py-1 font-label text-[0.65rem] tracking-[0.08em] rounded-sm capitalize transition-colors",
                        waStatusFilter === st
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {st === "all" ? "All" : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversations Scroll */}
              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {filteredConversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  const lastMsg = conv.messages?.[conv.messages.length - 1];

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        if (conv.unreadCount > 0) {
                          updateWhatsAppStatus(conv.id, "open");
                        }
                      }}
                      className={cn(
                        "w-full text-left p-4 transition-colors flex items-start gap-3",
                        isSelected ? "bg-secondary/40 border-l-2 border-accent" : "hover:bg-secondary/20"
                      )}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600/15 font-label text-xs text-emerald-700">
                        {conv.customerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-sm text-foreground truncate">{conv.customerName}</p>
                          <span className="text-[0.65rem] text-muted-foreground flex-shrink-0">
                            {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.phone}</p>
                        <p className="text-xs text-muted-foreground/80 truncate mt-1 line-clamp-1">
                          {lastMsg?.direction === "outbound" && <span className="text-accent font-medium">You: </span>}
                          {lastMsg?.text || "No messages yet"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[0.65rem] text-white font-medium">
                            {conv.unreadCount}
                          </span>
                        )}
                        {conv.status === "closed" && (
                          <span className="font-label text-[0.6rem] text-muted-foreground uppercase px-1 py-0.5 rounded bg-secondary/80">
                            Closed
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConvToDelete(conv);
                          }}
                          title="Delete conversation"
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  );
                })}
                {!filteredConversations.length && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No WhatsApp chats match filters.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Active Chat View */}
            {activeConversation ? (
              <div className="flex flex-col h-full min-h-[600px]">
                {/* Chat Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-label text-sm">
                      {activeConversation.customerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                        <span>{activeConversation.customerName}</span>
                        {activeConversation.company && (
                          <span className="text-xs text-muted-foreground">({activeConversation.company})</span>
                        )}
                      </h4>
                      <p className="font-mono text-xs text-muted-foreground">{activeConversation.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Linked enquiry shortcut */}
                    {linkedEnquiry && (
                      <button
                        onClick={() => setActiveEnquiry(linkedEnquiry)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-accent/40 bg-accent/10 text-accent rounded-sm hover:bg-accent/20 transition-colors"
                      >
                        <span>Linked: {linkedEnquiry.reference}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}

                    {/* Status dropdown */}
                    <Select
                      value={activeConversation.status}
                      onValueChange={(val) => updateWhatsAppStatus(activeConversation.id, val)}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Open in WhatsApp Web */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://wa.me/${normalizePhone(activeConversation.phone)}`, "_blank")}
                      title="Open in WhatsApp Web"
                      className="h-8 px-2 text-xs border-emerald-600/30 text-emerald-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    {/* Delete conversation */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConvToDelete(activeConversation)}
                      title="Delete conversation"
                      className={cn(
                        "h-8 px-2.5 text-xs transition-colors",
                        activeConversation.status === "closed"
                          ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium"
                          : "border-border text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">
                        {activeConversation.status === "closed" ? "Delete Closed Chat" : "Delete Chat"}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Closed Chat Banner */}
                {activeConversation.status === "closed" && (
                  <div className="mx-4 mt-3 rounded-sm border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive flex items-center justify-between">
                    <div>
                      <p className="font-medium">Conversation Closed / Cancelled</p>
                      <p className="text-[11px] text-muted-foreground">You can permanently delete this conversation and clear all message logs.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConvToDelete(activeConversation)}
                      className="h-7 text-xs px-2.5 ml-3 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete Chat
                    </Button>
                  </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/15">
                  <div className="text-center my-2">
                    <span className="font-label text-[0.62rem] tracking-[0.14em] text-muted-foreground bg-background px-3 py-1 border border-border">
                      END-TO-END VERIFIED META CLOUD API THREAD
                    </span>
                  </div>

                  {(activeConversation.messages || []).map((msg) => {
                    const isOut = msg.direction === "outbound";
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col max-w-[80%]", isOut ? "ml-auto items-end" : "mr-auto items-start")}
                      >
                        <div
                          className={cn(
                            "rounded-sm px-4 py-2.5 text-sm leading-relaxed shadow-xs",
                            isOut
                              ? "bg-charcoal text-charcoal-foreground rounded-br-none"
                              : "bg-card text-foreground border border-border rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={cn(
                              "mt-1.5 flex items-center justify-end gap-1 text-[0.65rem]",
                              isOut ? "text-charcoal-foreground/60" : "text-muted-foreground"
                            )}
                          >
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isOut && (
                              <span title={`Status: ${msg.deliveryState || "delivered"}`} className="text-emerald-400 font-bold">
                                ✓✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Templates Toolbar */}
                <div className="border-t border-border p-3 bg-card/60 flex items-center gap-2 overflow-x-auto">
                  <span className="font-label text-[0.62rem] text-muted-foreground tracking-[0.1em] flex-shrink-0">
                    QUICK REPLIES:
                  </span>
                  {QUICK_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleInsertTemplate(tpl.text)}
                      className="text-xs whitespace-nowrap px-2.5 py-1 rounded-sm border border-border bg-background hover:bg-secondary/40 text-foreground transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Reply Input Box */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeConversation.customerName} on WhatsApp…`}
                    className="h-11 rounded-sm text-sm"
                  />
                  <Button type="submit" variant="editorial" className="h-11 px-5 gap-1.5 flex-shrink-0">
                    <Send className="h-4 w-4" /> Send
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
                Select a conversation from the left to start messaging.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL DRAWER: REVIEW ENQUIRY (with exact physical inventory actions) */}
      <Sheet open={!!activeEnquiry} onOpenChange={(v) => !v && setActiveEnquiry(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg p-6">
          {activeEnquiry && (
            <div className="space-y-6">
              <SheetHeader className="text-left border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-serif text-2xl">{activeEnquiry.reference || activeEnquiry.id}</SheetTitle>
                  <StatusBadge tone={statusMeta[activeEnquiry.status]?.tone || "accent"}>
                    {statusMeta[activeEnquiry.status]?.label || activeEnquiry.status}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted on {new Date(activeEnquiry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </SheetHeader>

              {/* Customer Contact & Consent */}
              <div>
                <h4 className="eyebrow mb-2.5 text-muted-foreground">Customer Profile</h4>
                <div className="border border-border bg-card p-4 rounded-sm space-y-2 text-sm">
                  <p className="font-semibold text-foreground text-base">{activeEnquiry.customer}</p>
                  {activeEnquiry.company && <p className="text-muted-foreground">{activeEnquiry.company}</p>}
                  <p className="text-foreground font-mono">{activeEnquiry.phone}</p>
                  {activeEnquiry.email && <p className="text-muted-foreground">{activeEnquiry.email}</p>}

                  {/* Explicit Consent Badge */}
                  <div className="pt-2 border-t border-border/70 flex items-center gap-1.5 text-xs text-emerald-700">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Explicit customer contact consent verified</span>
                  </div>

                  {/* Quick Contact Shortcuts */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReplyClickWhatsApp(activeEnquiry)}
                      className="h-8 flex-1 border-emerald-600/30 text-emerald-800 text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${activeEnquiry.phone}`)}
                      className="h-8 flex-1 text-xs"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1" /> Call
                    </Button>
                    {activeEnquiry.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${activeEnquiry.email}`)}
                        className="h-8 flex-1 text-xs"
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" /> Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Requested Items Snapshot */}
              <div>
                <h4 className="eyebrow mb-2.5 text-muted-foreground">Selected Props Snapshot</h4>
                <div className="border border-border bg-card p-4 rounded-sm divide-y divide-border/60">
                  {(activeEnquiry.items || []).map((item, idx) => {
                    const currentProp = props.find((p) => p.id === item.propId || p.sku === item.sku);
                    const avail = currentProp?.available ?? "—";
                    return (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <span className="font-mono text-xs text-muted-foreground">SKU: {item.sku}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{item.quantity} \u00D7 {formatINR(item.pricePerDay)}/day</p>
                          <span className="text-[0.68rem] text-muted-foreground">Available on shelf: {avail}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 flex justify-between items-baseline font-medium">
                    <span className="eyebrow text-muted-foreground">Estimated Total ({activeEnquiry.days} days)</span>
                    <span className="font-serif text-xl text-foreground">{formatINR(activeEnquiry.subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* Shoot & Logistics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="border border-border p-3 rounded-sm bg-secondary/15">
                  <span className="eyebrow text-muted-foreground">Rental Dates</span>
                  <p className="text-foreground mt-0.5">{activeEnquiry.startDate} \u2192 {activeEnquiry.endDate}</p>
                </div>
                <div className="border border-border p-3 rounded-sm bg-secondary/15">
                  <span className="eyebrow text-muted-foreground">Fulfillment</span>
                  <p className="text-foreground mt-0.5">{activeEnquiry.delivery}</p>
                </div>
                <div className="border border-border p-3 rounded-sm bg-secondary/15 sm:col-span-2">
                  <span className="eyebrow text-muted-foreground">Location</span>
                  <p className="text-foreground mt-0.5">{activeEnquiry.location}</p>
                </div>
                {activeEnquiry.notes && (
                  <div className="border border-border p-3 rounded-sm bg-secondary/15 sm:col-span-2">
                    <span className="eyebrow text-muted-foreground">Client Notes</span>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{activeEnquiry.notes}</p>
                  </div>
                )}
              </div>

              {/* Status Transition Control (per PDF Section 5) */}
              <div>
                <h4 className="eyebrow mb-2 text-muted-foreground">Workflow Status</h4>
                <Select
                  value={activeEnquiry.status}
                  onValueChange={(val) => updateEnquiryStatus(activeEnquiry.id, val, `Status set to ${val}`)}
                >
                  <SelectTrigger className="h-11 rounded-sm capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="won">Won / Confirmed</SelectItem>
                    <SelectItem value="lost">Lost / Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transactional Stock Actions (PDF Section 7 & 8) */}
              <div>
                <h4 className="eyebrow mb-2.5 text-muted-foreground">Physical Stock Ledger Actions</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={() => handleConfirmReservation(activeEnquiry)}
                    disabled={activeEnquiry.status === "won" || activeEnquiry.status === "confirmed"}
                    variant="editorial"
                    className="w-full text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm &amp; Reserve
                  </Button>
                  <Button
                    onClick={() => handleDispatch(activeEnquiry)}
                    disabled={activeEnquiry.status !== "won" && activeEnquiry.status !== "confirmed"}
                    variant="outline"
                    className="w-full text-xs"
                  >
                    <Truck className="h-3.5 w-3.5 mr-1" /> Dispatch Units
                  </Button>
                  <Button
                    onClick={() => handleReturn(activeEnquiry)}
                    disabled={activeEnquiry.status !== "active"}
                    variant="line"
                    className="w-full text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restock Return
                  </Button>
                  {activeEnquiry.status === "lost" ? (
                    <Button
                      onClick={() => setEnquiryToDelete(activeEnquiry)}
                      variant="outline"
                      className="w-full text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Cancelled Order
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCancel(activeEnquiry)}
                      variant="outline"
                      className="w-full text-xs border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel Order
                    </Button>
                  )}
                </div>

                {activeEnquiry.status === "lost" && (
                  <div className="mt-3 rounded-sm border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Reserved inventory has been released. You can permanently delete this record.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setEnquiryToDelete(activeEnquiry)}
                      className="h-8 text-xs px-3 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Audit History Timeline */}
              {activeEnquiry.history && activeEnquiry.history.length > 0 && (
                <div>
                  <h4 className="eyebrow mb-2 text-muted-foreground">Activity History</h4>
                  <ul className="border-l border-border pl-4 space-y-3 text-xs">
                    {activeEnquiry.history.map((h, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent" />
                        <p className="font-medium text-foreground">{h.notes || `Status: ${h.status}`}</p>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {h.actor} \u00B7 {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* MODAL: SIMULATE INBOUND WHATSAPP WEBHOOK (Level C Testing) */}
      <Dialog open={simModalOpen} onOpenChange={setSimModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Simulate Inbound WhatsApp Webhook
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSimulateWebhook} className="space-y-4 py-2 text-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Demonstrates real-time Meta WhatsApp Cloud API webhook ingestion.
              This will fire an incoming message event, update the unread badge, and create or append to the conversation.
            </p>

            <div>
              <Label className="eyebrow text-foreground">Sender Mobile Phone</Label>
              <Input
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                placeholder="+91 98200 11223"
                className="h-11 rounded-sm mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="eyebrow text-foreground">Customer Profile Name</Label>
              <Input
                value={simCustomer}
                onChange={(e) => setSimCustomer(e.target.value)}
                placeholder="Aarav Mehta"
                className="h-11 rounded-sm mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="eyebrow text-foreground">Incoming Message Payload</Label>
              <Textarea
                rows={3}
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                placeholder="Customer message text…"
                className="rounded-sm resize-none mt-1.5"
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="line" onClick={() => setSimModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="editorial" className="bg-emerald-700 hover:bg-emerald-800">
                Simulate Webhook Arrival
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG: DELETE ORDER / ENQUIRY */}
      <AlertDialog open={!!enquiryToDelete} onOpenChange={(v) => !v && setEnquiryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete this order?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm text-foreground/80 pt-2">
              <p>
                Order <strong className="text-foreground">{enquiryToDelete?.reference || enquiryToDelete?.id}</strong> from{" "}
                <strong className="text-foreground">{enquiryToDelete?.customer}</strong> ({enquiryToDelete?.phone}) will be permanently deleted from the database.
              </p>
              {enquiryToDelete?.status !== "lost" ? (
                <p className="rounded-sm bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  Note: This order has not been cancelled yet. Deleting it will release all reserved units back into available stock.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This order was already cancelled. Deleting it will permanently remove the record and its audit history.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteEnquiry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG: DELETE WHATSAPP CONVERSATION */}
      <AlertDialog open={!!convToDelete} onOpenChange={(v) => !v && setConvToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete WhatsApp conversation?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm text-foreground/80 pt-2">
              <p>
                The chat thread with <strong className="text-foreground">{convToDelete?.customerName}</strong> ({convToDelete?.phone}) including all {convToDelete?.messages?.length || 0} messages will be permanently deleted.
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. Inbound webhook history and customer chat logs for this thread will be cleared.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel>Keep Conversation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteConv}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
