"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getPropById, getPropSKU, getWhatsAppLink, STUDIO_CONFIG } from "@/data/firangi";
import { useRequest } from "@/context/RequestContext";
import { useAdminData } from "@/context/AdminDataContext";
import { DateRangePicker } from "@/components/common/DateRangePicker";

export default function RentalRequest() {
  const { items, range, remove, clear, setRange, getQuantity, updateQuantity } = useRequest();
  const { addEnquiry } = useAdminData();
  const props = items.map(getPropById).filter(Boolean);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    shoot: "Product Photography",
    delivery: "Studio delivery",
    location: "",
    notes: "",
  });

  const [start, setStart] = useState(range.start ? range.start.slice(0, 10) : null);
  const [end, setEnd] = useState(range.end ? range.end.slice(0, 10) : null);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdEnquiry, setCreatedEnquiry] = useState(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const days = useMemo(() => {
    if (start && end) {
      return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
    }
    return 1;
  }, [start, end]);

  const dailyTotal = useMemo(() => {
    return props.reduce((sum, p) => sum + p.pricePerDay * getQuantity(p.id), 0);
  }, [props, getQuantity]);

  const subtotal = dailyTotal * days;
  const totalUnits = useMemo(() => props.reduce((sum, p) => sum + getQuantity(p.id), 0), [props, getQuantity]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const nameOk = form.name.trim().length > 0;
  const datesOk = Boolean(start && end);
  const itemsOk = props.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameOk || !emailOk || !datesOk || !itemsOk) {
      setShowErrors(true);
      toast("Please complete all required fields", {
        description: "Name, email, shoot dates and at least one prop are required.",
      });
      return;
    }

    const itemsSnapshot = props.map((p, i) => ({
      propId: p.id,
      sku: p.sku || getPropSKU(p, i),
      name: p.name,
      quantity: getQuantity(p.id),
      pricePerDay: p.pricePerDay,
    }));

    const newEnquiry = addEnquiry({
      source: "website",
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      shootType: form.shoot,
      delivery: form.delivery,
      location: form.location.trim() || (form.delivery === "Studio delivery" ? "Studio address pending" : "14 Atelier Lane, Bandra West, Mumbai"),
      notes: form.notes.trim(),
      items: itemsSnapshot,
      startDate: start,
      endDate: end,
      days,
      subtotal,
    });

    setCreatedEnquiry(newEnquiry);
    setSubmitted(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsAppEnquiry = () => {
    if (!createdEnquiry) return;
    const text =
      `Hi ${STUDIO_CONFIG.name}, I have submitted a rental request with reference *${createdEnquiry.id}*.\n\n` +
      `• Name: ${createdEnquiry.name}\n` +
      `• Shoot: ${createdEnquiry.shootType}\n` +
      `• Dates: ${createdEnquiry.startDate} to ${createdEnquiry.endDate} (${createdEnquiry.days} days)\n` +
      `• Total Props: ${createdEnquiry.items?.length || 0} items\n` +
      `• Estimated Total: ₹${createdEnquiry.subtotal?.toLocaleString("en-IN")}\n\n` +
      `Looking forward to confirming availability. Thank you!`;
    const url = getWhatsAppLink(text);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const firstName = form.name.trim().split(" ")[0] || "there";

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. EDITORIAL HEADER */}
      <header className="page-head bg-ivory">
        <div className="wrap">
          <p className="eyebrow">Reserve your props</p>
          <h1 className="t-section">Rental request</h1>
          <p className="body-lg measure">
            Share your shoot details and selected props. We’ll confirm availability and send a tailored quote — no payment required to enquire.
          </p>
        </div>
      </header>

      {/* 2. SUBMITTED CONFIRMATION STATE */}
      {submitted && createdEnquiry ? (
        <div className="wrap section-sm">
          <div className="split">
            <div className="stack-24">
              <div className="banner-success" role="status">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "#FED508" }}>
                  <path d="m5 12.5 4.5 4.5L19 7.5"></path>
                </svg>
                <div>
                  <p className="toast-title" style={{ fontSize: "18px", lineHeight: "26px" }}>
                    Your enquiry has been received.
                  </p>
                  <p className="toast-text" style={{ fontSize: "15px" }}>
                    Reference Code: <strong style={{ color: "#FED508" }}>{createdEnquiry.id}</strong>. We confirm availability and share a tailored quote within 24 hours.
                  </p>
                </div>
              </div>

              <h2 className="t-section">Thank you, {firstName}.</h2>
              <p className="body-lg measure">
                Our team will be in touch at <strong>{createdEnquiry.email}</strong>. If you provided a phone number, we will also share your quote directly on WhatsApp.
              </p>

              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={handleWhatsAppEnquiry}>
                  Chat with us on WhatsApp
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                  </svg>
                </button>
                <Link href="/explore" className="btn btn-secondary">
                  Keep browsing
                  <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </Link>
                <Link href="/" className="btn btn-ghost-dark">
                  Back to home
                </Link>
              </div>
            </div>

            <aside className="panel" aria-label="Request summary">
              <div className="panel-head">
                <h2 className="t-title">Request sent</h2>
                <span className="pill">{createdEnquiry.id}</span>
              </div>
              <ul>
                {createdEnquiry.items?.map((item, idx) => (
                  <li key={idx} className="sel-row" style={{ gridTemplateColumns: "minmax(0, 1fr) auto" }}>
                    <div>
                      <p className="sel-name">{item.name}</p>
                      <p className="sel-price">
                        {item.sku} • {item.quantity} unit(s) @ ₹{item.pricePerDay?.toLocaleString("en-IN")}/day
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="summary-rows" style={{ marginTop: "16px" }}>
                <div className="srow">
                  <span className="k">Dates</span>
                  <span>{createdEnquiry.startDate} to {createdEnquiry.endDate} ({createdEnquiry.days} days)</span>
                </div>
                <div className="srow">
                  <span className="k">Delivery</span>
                  <span>{createdEnquiry.delivery}</span>
                </div>
                <div className="srow srow-total">
                  <span className="k">Est. subtotal</span>
                  <span className="v">₹{createdEnquiry.subtotal?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : props.length === 0 ? (
        /* 3. EMPTY STATE */
        <div className="wrap section-sm">
          <div className="empty-panel">
            <div className="empty">
              <img src="/images/frangipani-flower.svg" alt="" className="empty-flower" />
              <div className="empty-copy">
                <p className="eyebrow">A blank canvas</p>
                <h2 className="t-section">Your request is empty.</h2>
                <p className="body-lg measure">
                  Add props from the library, then pick dates on each product to add them to your request.
                </p>
                <div className="btn-row">
                  <Link href="/explore" className="btn btn-primary">
                    Browse the library
                    <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                  </Link>
                  <Link href="/wishlist" className="btn btn-secondary">
                    View wishlist
                    <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4. ACTIVE ENQUIRY FORM */
        <form className="wrap section-sm" noValidate onSubmit={handleSubmit}>
          <div className="split">
            <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
              {/* Fieldset: Your details */}
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="fieldset-title">Your details</legend>
                <div className="form-grid">
                  <div className={`field ${showErrors && !nameOk ? "is-invalid" : ""}`}>
                    <label className="label" htmlFor="r-name">Name <span className="req">*</span></label>
                    <input
                      id="r-name"
                      className="input"
                      type="text"
                      placeholder="Aarav Mehta"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                    {showErrors && !nameOk && (
                      <p className="field-error">
                        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 4 2.8 19.5h18.4Z"></path>
                          <path d="M12 10v4M12 17v.01"></path>
                        </svg>
                        Enter your name.
                      </p>
                    )}
                  </div>

                  <div className={`field ${showErrors && !emailOk ? "is-invalid" : ""}`}>
                    <label className="label" htmlFor="r-email">Email <span className="req">*</span></label>
                    <input
                      id="r-email"
                      className="input"
                      type="email"
                      placeholder="you@studio.com"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                    {showErrors && !emailOk && (
                      <p className="field-error">
                        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 4 2.8 19.5h18.4Z"></path>
                          <path d="M12 10v4M12 17v.01"></path>
                        </svg>
                        Enter a valid email address.
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="r-phone">Phone / WhatsApp</label>
                    <input
                      id="r-phone"
                      className="input"
                      type="tel"
                      placeholder="+91 98200 00000"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="r-co">Company / Production House</label>
                    <input
                      id="r-co"
                      className="input"
                      type="text"
                      placeholder="Studio Noir"
                      autoComplete="organization"
                      value={form.company}
                      onChange={(e) => setField("company", e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Fieldset: Shoot details */}
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="fieldset-title">Shoot details</legend>
                <div className="form-grid">
                  <div className="field">
                    <label className="label" htmlFor="r-type">Shoot type</label>
                    <div className="select-wrap">
                      <select
                        id="r-type"
                        className="select"
                        value={form.shoot}
                        onChange={(e) => setField("shoot", e.target.value)}
                      >
                        <option>Product Photography</option>
                        <option>Editorial</option>
                        <option>Fashion Campaign</option>
                        <option>Film &amp; Motion</option>
                        <option>Interior / Set</option>
                        <option>Lifestyle</option>
                        <option>Advertising</option>
                        <option>Social Media</option>
                      </select>
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="r-del">Delivery / pickup</label>
                    <div className="select-wrap">
                      <select
                        id="r-del"
                        className="select"
                        value={form.delivery}
                        onChange={(e) => setField("delivery", e.target.value)}
                      >
                        <option>Studio delivery</option>
                        <option>Self pickup</option>
                      </select>
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="span-2">
                    <DateRangePicker
                      start={start}
                      end={end}
                      required={true}
                      showErrors={showErrors && !datesOk}
                      onChange={(s, e) => {
                        setStart(s);
                        setEnd(e);
                        if (s && e) {
                          setRange(new Date(s), new Date(e));
                        }
                      }}
                    />
                  </div>

                  {form.delivery === "Studio delivery" ? (
                    <div className="field span-2">
                      <label className="label" htmlFor="r-loc">Delivery location</label>
                      <input
                        id="r-loc"
                        className="input"
                        type="text"
                        placeholder="Studio address, city"
                        autoComplete="street-address"
                        value={form.location}
                        onChange={(e) => setField("location", e.target.value)}
                      />
                      <p className="field-hint">Studio delivery is available across the city with 48-hour notice.</p>
                    </div>
                  ) : (
                    <div className="span-2 unavailable-note">
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"></path>
                        <circle cx="12" cy="10" r="2.5"></circle>
                      </svg>
                      <p>Complimentary self-pickup from 14 Atelier Lane, Bandra West, Mumbai 400050 • Mon–Sat, 10am – 7pm IST.</p>
                    </div>
                  )}

                  <div className="field span-2">
                    <label className="label" htmlFor="r-notes">Additional notes</label>
                    <textarea
                      id="r-notes"
                      className="textarea"
                      placeholder="Tell us about the concept, palette or any specific styling needs..."
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Right: Sticky Request Summary (Compact & Viewport-Contained) */}
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
              aria-labelledby="req-h"
            >
              <div className="panel-head flex-shrink-0" style={{ marginBottom: "16px" }}>
                <h2 className="t-title" id="req-h">Your request</h2>
                <span className="pill">{totalUnits} {totalUnits === 1 ? "prop" : "props"}</span>
              </div>

              {/* Scrollable list of props */}
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
                  {props.map((p, index) => {
                    const qty = getQuantity(p.id);
                    const skuCode = p.sku || getPropSKU(p, index);
                    return (
                      <li key={p.id} className="sel-row">
                        <img src={p.images?.[0] || "/images/placeholder.jpg"} alt={p.name} />
                        <div>
                          <p className="sel-name">
                            <Link href={`/product/${p.id}`}>{p.name}</Link>
                          </p>
                          <p className="sel-price">
                            <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{skuCode}</span> • ₹{p.pricePerDay.toLocaleString("en-IN")} / day
                          </p>
                          {/* Quantity adjuster */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <button
                              type="button"
                              className="circle-btn"
                              style={{ width: "26px", height: "26px", fontSize: "12px" }}
                              disabled={qty <= 1}
                              onClick={() => updateQuantity(p.id, Math.max(1, qty - 1))}
                              aria-label="Decrease quantity"
                            >
                              –
                            </button>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{qty}</span>
                            <button
                              type="button"
                              className="circle-btn"
                              style={{ width: "26px", height: "26px", fontSize: "12px" }}
                              disabled={qty >= (p.available ?? 1)}
                              onClick={() => updateQuantity(p.id, Math.min(p.available ?? 1, qty + 1))}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Remove ${p.name}`}
                          onClick={() => remove(p.id)}
                        >
                          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pinned Bottom CTA (ALWAYS VISIBLE) */}
              <div className="flex-shrink-0 pt-4" style={{ marginTop: "auto" }}>
                <div className="summary-rows" style={{ margin: 0 }}>
                  <div className="srow">
                    <span className="k">Daily total</span>
                    <span>₹{dailyTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="srow">
                    <span className="k">Rental days</span>
                    <span>{days} {days === 1 ? "day" : "days"}</span>
                  </div>
                  <div className="srow srow-total">
                    <span className="k">Est. subtotal</span>
                    <span className="v font-serif" style={{ fontSize: "22px", fontWeight: 600 }}>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <p className="small" style={{ margin: "6px 0 16px", fontSize: "11.5px", color: "var(--muted)" }}>
                  Indicative only. Stock is not committed until confirmed by studio.
                </p>

                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  Submit rental request
                  <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7M8 7h9v9"></path>
                  </svg>
                </button>

                <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                  <button type="button" className="tlink" style={{ fontSize: "12px" }} onClick={clear}>
                    <span>Clear request</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      )}
    </div>
  );
}
