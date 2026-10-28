"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductCard } from "@/components/common/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useRequest } from "@/context/RequestContext";
import { getPropById, editorialImages } from "@/data/firangi";

export default function Wishlist() {
  const { ids, clear, toggle } = useWishlist();
  const { addMany } = useRequest();
  const router = useRouter();
  const items = ids.map(getPropById).filter(Boolean);

  const subtotal = items.reduce((acc, p) => acc + (p.pricePerDay || 0), 0);

  const requestAll = () => {
    addMany(ids);
    toast("Added to your request", {
      description: `${ids.length} ${ids.length === 1 ? "prop" : "props"} ready to reserve.`,
    });
    router.push("/rental-request");
  };

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. EDITORIAL HEADER */}
      <header className="page-head bg-ivory">
        <div className="wrap">
          <p className="eyebrow">Your selection</p>
          <h1 className="t-section">Wishlist</h1>
          <p className="body-lg measure">
            The pieces you’ve saved for an upcoming shoot. Send them across as a rental request when you’re ready.
          </p>
        </div>
      </header>

      {/* 2. FILLED WISHLIST */}
      {items.length > 0 ? (
        <div className="wrap section-sm">
          <div className="split">
            {/* Left: Saved Props Grid */}
            <section aria-label="Saved props">
              <div
                className="results-head"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  paddingBottom: "20px",
                  marginBottom: "28px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p className="ui" style={{ fontSize: "18px", fontWeight: 500, margin: 0 }} aria-live="polite">
                      {items.length} {items.length === 1 ? "piece saved" : "pieces saved"}
                    </p>
                    <span style={{ fontSize: "14px", color: "var(--muted)" }}>• ₹{subtotal.toLocaleString("en-IN")} / day</span>
                  </div>
                  <button
                    type="button"
                    className="tlink"
                    style={{ marginTop: "4px", fontSize: "13px" }}
                    onClick={() => {
                      clear();
                      toast("Wishlist cleared");
                    }}
                  >
                    <span>Clear all saved pieces</span>
                  </button>
                </div>

                {/* Top Quick Action Button: Immediately visible without scrolling */}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ minHeight: "46px", padding: "0 24px" }}
                  onClick={requestAll}
                >
                  Proceed to Request ({items.length})
                  <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
              </div>

              <div className="pgrid">
                {items.map((prop, index) => (
                  <ProductCard key={prop.id} prop={prop} index={index} />
                ))}
              </div>

              <p className="small" style={{ marginTop: "40px" }}>
                Tap the heart on any card to remove it from your wishlist.
              </p>
            </section>

            {/* Right: Sticky Selection Summary (Compact & Always Viewport-Contained) */}
            <aside
              className="panel sticky flex flex-col"
              style={{
                position: "sticky",
                top: "100px",
                maxHeight: "calc(100vh - 120px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              aria-labelledby="sel-h"
            >
              <div className="panel-head flex-shrink-0" style={{ marginBottom: "16px" }}>
                <div>
                  <h2 className="t-title" id="sel-h">Your selection</h2>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0" }}>
                    Estimated daily rate card
                  </p>
                </div>
                <span className="pill">
                  {items.length} {items.length === 1 ? "prop" : "props"}
                </span>
              </div>

              {/* Scrollable list of items: Max height so the CTA is NEVER pushed off-screen */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden pr-1"
                style={{
                  maxHeight: "260px",
                  scrollbarWidth: "thin",
                  borderTop: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                  overscrollBehavior: "contain",
                }}
              >
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {items.map((p) => (
                    <li key={p.id} className="sel-row">
                      <img src={p.images?.[0] || "/images/placeholder.jpg"} alt={p.name} />
                      <div>
                        <p className="sel-name">
                          <Link href={`/product/${p.id}`}>{p.name}</Link>
                        </p>
                        <p className="sel-price">
                          ₹{Number(p.pricePerDay).toLocaleString("en-IN")} / day
                        </p>
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => toggle(p.id)}
                      >
                        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 6l12 12M18 6 6 18"></path>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pinned Bottom CTA Section (ALWAYS VISIBLE ON SCREEN) */}
              <div className="flex-shrink-0 pt-4" style={{ marginTop: "auto" }}>
                <div className="srow srow-total" style={{ margin: 0 }}>
                  <span className="k font-medium">Daily subtotal</span>
                  <span className="v font-serif" style={{ fontSize: "22px", fontWeight: 600 }}>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginTop: "16px" }}
                  onClick={requestAll}
                >
                  Proceed to Request ({items.length})
                  <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>

                <p className="small text-center" style={{ marginTop: "12px", color: "var(--muted)", fontSize: "12px" }}>
                  Pick shoot dates on the next step. No payment required to enquire.
                </p>
              </div>
            </aside>
          </div>

          {/* Floating Sticky Bar for Mobile / Tablet / Scrolled Views */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md bg-charcoal text-white rounded-full p-2.5 px-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-label text-xs font-bold flex-shrink-0">
                {items.length}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {items.length} {items.length === 1 ? "prop" : "props"} saved
                </p>
                <p className="text-[10px] text-white/60">
                  ₹{subtotal.toLocaleString("en-IN")} / day
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestAll}
              className="flex items-center gap-1.5 rounded-full bg-yellow px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-yellow/90 transition-all flex-shrink-0 ml-2"
            >
              <span>Proceed</span>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* 3. EMPTY WISHLIST */
        <div className="wrap section-sm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(440px, 100%), 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            <div className="empty" style={{ padding: 0 }}>
              <img src="/images/frangipani-flower.svg" alt="" className="empty-flower" />
              <div className="empty-copy">
                <p className="eyebrow">A blank canvas</p>
                <h2 className="t-section">Your wishlist is waiting to be styled.</h2>
                <p className="body-lg measure">
                  Save the objects that catch your eye as you browse, then send them across as a rental request when the set feels right.
                </p>
                <div className="btn-row">
                  <Link href="/explore" className="btn btn-primary">
                    Browse the library
                    <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                  </Link>
                  <Link href="/how-it-works" className="btn btn-secondary">
                    How it works
                    <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <img
              src={editorialImages.flatlayA}
              alt="Dried eucalyptus pods beside a wooden spool of twine"
              style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
