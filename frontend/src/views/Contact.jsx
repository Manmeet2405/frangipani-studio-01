"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { editorialImages, STUDIO_CONFIG } from "@/data/firangi";
import { useAdminData } from "@/context/AdminDataContext";

export default function Contact() {
  const { addEnquiry } = useAdminData();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    shoot: "",
    message: "",
  });

  const [showErrors, setShowErrors] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentName, setSentName] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const nameOk = form.name.trim().length > 0;
  const msgOk = form.message.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameOk || !emailOk || !msgOk) {
      setShowErrors(true);
      toast("Please complete the required fields", {
        description: "Name, email and a message are required.",
      });
      return;
    }

    addEnquiry({
      source: "contact_form",
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      shootType: form.shoot || "General Enquiry",
      notes: form.message.trim(),
      items: [],
      subtotal: 0,
      days: 0,
    });

    setSentName(form.name.trim().split(" ")[0] || "there");
    setSent(true);
    setShowErrors(false);
    toast("Enquiry received", {
      description: "Our studio team will be in touch shortly.",
    });
    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      shoot: "",
      message: "",
    });
  };

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. EDITORIAL HEADER */}
      <header className="page-head bg-ivory">
        <div className="wrap">
          <p className="eyebrow">Say hello</p>
          <h1 className="t-section">Contact the studio</h1>
          <p className="body-lg measure">
            Planning a shoot, need a custom set, or want to visit the library in person? We’d love to hear from you.
          </p>
        </div>
      </header>

      {/* 2. FORM & DETAILS SPLIT */}
      <div className="wrap section-sm">
        <div className="split split-wide">
          <form noValidate onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {sent && (
              <div className="banner-success" role="status">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "#FED508" }}>
                  <path d="m5 12.5 4.5 4.5L19 7.5"></path>
                </svg>
                <div>
                  <p className="toast-title" style={{ fontSize: "17px" }}>Your enquiry has been received.</p>
                  <p className="toast-text">Thank you, {sentName}. We’ll be in touch shortly.</p>
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className={`field ${showErrors && !nameOk ? "is-invalid" : ""}`}>
                <label className="label" htmlFor="c-name">Name <span className="req">*</span></label>
                <input
                  id="c-name"
                  className="input"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                <label className="label" htmlFor="c-email">Email <span className="req">*</span></label>
                <input
                  id="c-email"
                  className="input"
                  type="email"
                  placeholder="you@studio.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {showErrors && !emailOk && (
                  <p className="field-error">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 4 2.8 19.5h18.4Z"></path>
                      <path d="M12 10v4M12 17v.01"></path>
                    </svg>
                    {form.email.trim() ? "Enter a valid email address." : "Enter your email address."}
                  </p>
                )}
              </div>

              <div className="field">
                <label className="label" htmlFor="c-phone">Phone / WhatsApp</label>
                <input
                  id="c-phone"
                  className="input"
                  type="tel"
                  placeholder="+91 98200 00000"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="c-co">Company / Production House</label>
                <input
                  id="c-co"
                  className="input"
                  type="text"
                  placeholder="Studio Noir"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>

              <div className="field span-2">
                <label className="label" htmlFor="c-type">Shoot type</label>
                <div className="select-wrap">
                  <select
                    id="c-type"
                    className="select"
                    value={form.shoot}
                    onChange={(e) => setForm({ ...form, shoot: e.target.value })}
                  >
                    <option value="">Select type</option>
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

              <div className={`field span-2 ${showErrors && !msgOk ? "is-invalid" : ""}`}>
                <label className="label" htmlFor="c-msg">Message <span className="req">*</span></label>
                <textarea
                  id="c-msg"
                  className="textarea"
                  placeholder="Tell us about your project, styling needs or dates..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                ></textarea>
                {showErrors && !msgOk && (
                  <p className="field-error">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 4 2.8 19.5h18.4Z"></path>
                      <path d="M12 10v4M12 17v.01"></path>
                    </svg>
                    Tell us a little about your project.
                  </p>
                )}
              </div>
            </div>

            <div className="btn-row">
              <button type="submit" className="btn btn-primary btn-lg">
                Send enquiry
                <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* Right: Studio Details */}
          <aside aria-label="Studio details" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <img
              src={editorialImages.flatlayB}
              alt="Studio Frangipani studio still life"
              style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
            />

            <div className="contact-list">
              <div className="contact-item">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="1.5"></rect>
                  <path d="m3.5 6 8.5 7 8.5-7"></path>
                </svg>
                <div>
                  <p className="k">Email</p>
                  <p className="v">
                    <a className="inline-link" href={`mailto:${STUDIO_CONFIG.email}`}>
                      {STUDIO_CONFIG.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1"></path>
                </svg>
                <div>
                  <p className="k">Phone / WhatsApp</p>
                  <p className="v">
                    <a className="inline-link" href={`tel:${STUDIO_CONFIG.phone.replace(/\s+/g, '')}`}>
                      {STUDIO_CONFIG.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"></path>
                  <circle cx="12" cy="10" r="2.5"></circle>
                </svg>
                <div>
                  <p className="k">Location</p>
                  <p className="v">{STUDIO_CONFIG.address}</p>
                </div>
              </div>

              <div className="contact-item">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                <div>
                  <p className="k">Business hours</p>
                  <p className="v">{STUDIO_CONFIG.businessHours}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
