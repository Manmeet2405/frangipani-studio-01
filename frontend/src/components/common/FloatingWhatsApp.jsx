"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWhatsAppLink, STUDIO_CONFIG, WHATSAPP_QUICK_MENU } from "@/data/firangi";

export const FloatingWhatsApp = () => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const menuList = STUDIO_CONFIG.quickMenu || WHATSAPP_QUICK_MENU || [];

  const handleSendCustom = (e) => {
    e?.preventDefault();
    const text = msg.trim() || `Hi ${STUDIO_CONFIG.name}, I would like to enquire about your prop collection and rental availability.`;
    const url = getWhatsAppLink(text);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    setMsg("");
    setSelectedId(null);
  };

  const handleSendQuickMessage = (item) => {
    const url = getWhatsAppLink(item.message);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    setMsg("");
    setSelectedId(null);
  };

  const handleSelectToInput = (item) => {
    setMsg(item.message);
    setSelectedId(item.id);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[380px] sm:w-[410px] max-w-[calc(100vw-24px)] overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col max-h-[580px] h-[540px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-charcoal px-4 py-3.5 text-charcoal-foreground flex-shrink-0 w-full box-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/30 font-label text-[0.62rem] text-emerald-400 flex-shrink-0">
                {STUDIO_CONFIG.initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-charcoal" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight truncate">{STUDIO_CONFIG.name} Atelier</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <p className="text-[0.65rem] text-charcoal-foreground/70 truncate">Online · Typically replies in 15m</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-charcoal-foreground/60 hover:text-charcoal-foreground transition-colors p-1 flex-shrink-0 ml-2"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Chat Area (Strictly Vertical Only) */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3 bg-muted/15 w-full box-border"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
            }}
          >
            {/* Greeting Agent Bubble */}
            <div className="flex gap-2.5 w-full">
              <div className="h-6 w-6 rounded-full bg-emerald-700/20 text-emerald-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {STUDIO_CONFIG.initials}
              </div>
              <div className="flex-1 min-w-0 rounded-sm bg-background p-3 text-xs leading-relaxed text-foreground shadow-sm border border-border/80 box-border">
                <p>Hello! 👋 Welcome to <strong>{STUDIO_CONFIG.name}</strong>.</p>
                <p className="mt-1 text-muted-foreground text-[11px]">
                  Choose any pre-written inquiry below to send directly to WhatsApp, or type your own question.
                </p>
              </div>
            </div>

            {/* Pre-written Menu Section */}
            <div className="space-y-1.5 pt-1 w-full box-border">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                  Common Inquiries
                </span>
                <span className="text-[10px] text-muted-foreground/80">Click to send</span>
              </div>

              <div className="flex flex-col gap-1.5 w-full box-border">
                {menuList.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex items-center justify-between gap-2.5 rounded-md border p-2.5 transition-all text-left cursor-pointer w-full box-border",
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm"
                          : "border-border/80 bg-background hover:border-emerald-600/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:shadow-xs"
                      )}
                      onClick={() => handleSendQuickMessage(item)}
                      title="Click to send directly to WhatsApp"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="text-base flex-shrink-0 mt-0.5 leading-none">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground leading-snug group-hover:text-emerald-700 transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendQuickMessage(item);
                        }}
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs ml-1"
                        aria-label={`Send ${item.label}`}
                        title="Send this message"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Custom Input Box */}
          <div className="p-3 bg-background border-t border-border flex-shrink-0 space-y-1.5 w-full box-border">
            <form onSubmit={handleSendCustom} className="flex gap-2 w-full">
              <input
                type="text"
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value);
                  if (selectedId) setSelectedId(null);
                }}
                placeholder="Or type custom query…"
                className="h-9 flex-1 min-w-0 rounded-sm border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0"
                aria-label="Send WhatsApp"
                title="Send to WhatsApp"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
              <span>Direct WhatsApp Concierge</span>
              <span>{STUDIO_CONFIG.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat on WhatsApp"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105",
          open ? "bg-charcoal text-charcoal-foreground" : "bg-emerald-600 text-white hover:bg-emerald-700"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  );
};

