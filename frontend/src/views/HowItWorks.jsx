"use client";

import React, { useState } from "react";
import Link from "next/link";
import { editorialImages, STUDIO_CONFIG } from "@/data/firangi";

const faqs = [
  {
    q: "What is the minimum rental period?",
    a: "Rentals start at a single day. Extended rentals are billed per day, with weekly rates available for longer productions.",
  },
  {
    q: "Do you deliver props to set?",
    a: "Yes. We offer studio and on-set delivery across the city with 48-hour notice. Complimentary self-pickup from our Mumbai studio is also available.",
  },
  {
    q: "Is a deposit required?",
    a: "A refundable security deposit applies per piece, returned in full once props are returned in their original condition.",
  },
  {
    q: "Can you source a specific prop?",
    a: "Absolutely. Our stylists offer a bespoke sourcing service for pieces not currently in the library. Reach out via our contact page.",
  },
  {
    q: "How far in advance should I book?",
    a: "We recommend requesting at least a week ahead for larger sets, though we often accommodate last-minute shoots — just ask.",
  },
];

export default function HowItWorks() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. HERO SECTION */}
      <section className="wrap hero" aria-labelledby="h-title">
        <div className="hero-copy">
          <p className="eyebrow">The process</p>
          <h1 className="t-hero" id="h-title">
            From first browse to final frame.
          </h1>
          <p className="body-lg measure">
            Renting from {STUDIO_CONFIG.name} is designed to be effortless — so you can spend your energy on the shoot, not the logistics.
          </p>
        </div>
        <img
          src={editorialImages.flatlayA}
          alt="A styling studio desk with notebook, envelopes, a camel beret and an espresso"
          className="hero-img"
        />
      </section>

      {/* 2. STEPS (01 BROWSE, 02 CHOOSE, 03 REQUEST, 04 SHOOT) */}
      <section className="section bg-ivory" aria-label="Steps">
        <div className="wrap">
          <ol className="steps">
            <li>
              <p className="step-n">01</p>
              <h2 className="step-t">Browse</h2>
              <p className="step-c">
                Explore the curated collection by category, style or shoot type. Search for exactly what your concept needs.
              </p>
            </li>
            <li>
              <p className="step-n">02</p>
              <h2 className="step-t">Choose</h2>
              <p className="step-c">
                Save the pieces that fit your story to a wishlist and refine the edit until the set feels right.
              </p>
            </li>
            <li>
              <p className="step-n">03</p>
              <h2 className="step-t">Request</h2>
              <p className="step-c">
                Pick your rental dates and send a request. We confirm availability and share a tailored quote within 24 hours.
              </p>
            </li>
            <li>
              <p className="step-n">04</p>
              <h2 className="step-t">Shoot</h2>
              <p className="step-c">
                Props arrive prepped and camera-ready — delivered to your studio or ready for pickup. Return when you wrap.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* 3. MEDIA SPLIT (CURATED STYLING) */}
      <section className="media-split" aria-labelledby="care-title">
        <img
          src={editorialImages.studio}
          alt="A cream jar styled on stacked white plinths with a branch and gold beads"
          loading="lazy"
        />
        <div className="media-split-copy bg-black on-dark">
          <p className="eyebrow" style={{ color: "#FED508" }}>Curated styling</p>
          <h2 className="t-section" id="care-title" style={{ color: "#FFFFFF" }}>
            Every detail, handled with care.
          </h2>
          <div className="btn-row" style={{ marginTop: "32px" }}>
            <Link href="/explore" className="btn btn-primary">
              Explore props
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="section" aria-labelledby="faq-title">
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "48px 96px", alignItems: "flex-start" }}>
          <div className="stack-16" style={{ flex: "1 1 320px" }}>
            <p className="eyebrow">Questions</p>
            <h2 className="t-section" id="faq-title">Good to know</h2>
            <div className="panel" style={{ marginTop: "40px" }}>
              <p className="t-small-serif">Still have a question?</p>
              <Link href="/contact" className="btn btn-primary" style={{ marginTop: "20px" }}>
                Talk to our team
                <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div style={{ flex: "999 1 560px", minWidth: 0 }}>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="acc-item">
                  <button
                    type="button"
                    className="acc-btn"
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                  >
                    <span className="acc-q">{faq.q}</span>
                    {isOpen ? (
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14"></path>
                      </svg>
                    ) : (
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                    )}
                  </button>
                  {isOpen && <p className="acc-panel">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
