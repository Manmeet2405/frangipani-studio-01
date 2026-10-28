"use client";

import React, { useState } from "react";
import Link from "next/link";
import { categories, STUDIO_CONFIG } from "@/data/firangi";
import { StudioLogo } from "@/components/common/StudioLogo";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'success' | 'error'

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <div style={{ fontFamily: "var(--sans)", color: "#050505", width: "100%" }}>
      {/* Newsletter Section */}
      <section className="newsletter on-dark" aria-labelledby="nl-title">
        <div className="wrap newsletter-grid">
          <div className="stack-16">
            <p className="eyebrow" style={{ color: "#FED508" }}>Newsletter</p>
            <h2 className="nl-title" id="nl-title">Props with a point of view.</h2>
            <p className="nl-copy">Join our list for new arrivals, styling notes and behind-the-scenes from the {STUDIO_CONFIG.name} library.</p>
          </div>

          <form className="nl-form" noValidate onSubmit={handleSubmit}>
            <label className="nl-label" htmlFor="nl-email">Email address</label>
            <div className={`nl-row ${status === "error" ? "is-invalid" : ""}`}>
              <input
                id="nl-email"
                className="nl-input"
                type="email"
                placeholder="your@studio.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                aria-invalid={status === "error"}
                aria-describedby="nl-msg"
              />
              <button type="submit" className="nl-submit" aria-label="Subscribe">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </button>
            </div>
            <div id="nl-msg" aria-live="polite">
              {status === "error" && (
                <p className="nl-msg">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4 2.8 19.5h18.4Z"></path>
                    <path d="M12 10v4M12 17v.01"></path>
                  </svg>
                  Enter a valid email address.
                </p>
              )}
              {status === "success" && (
                <p className="nl-msg">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "#FED508" }}>
                    <path d="m5 12.5 4.5 4.5L19 7.5"></path>
                  </svg>
                  You’re on the list. New arrivals land in your inbox first.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Main Studio Footer */}
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <Link href="/" aria-label={`${STUDIO_CONFIG.name} home`} className="inline-block mb-4">
                <StudioLogo size="md" />
              </Link>
              <p className="footer-blurb">
                {STUDIO_CONFIG.tagline}
              </p>
            </div>

            <nav aria-label="Explore">
              <h3 className="footer-h">Explore</h3>
              <ul className="footer-links">
                <li><Link href="/explore">All props</Link></li>
                <li><Link href="/how-it-works">How it works</Link></li>
                <li><Link href="/wishlist">Wishlist</Link></li>
                <li><Link href="/rental-request">Request props</Link></li>
              </ul>
            </nav>

            <nav aria-label="Studio">
              <h3 className="footer-h">Studio</h3>
              <ul className="footer-links">
                <li><Link href="/about">About {STUDIO_CONFIG.name}</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li>
                  {process.env.NEXT_PUBLIC_ADMIN_URL ? (
                    <a
                      href={process.env.NEXT_PUBLIC_ADMIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Admin
                    </a>
                  ) : (
                    <Link href="/admin">Admin</Link>
                  )}
                </li>
              </ul>
            </nav>

            <nav aria-label="Categories">
              <h3 className="footer-h">Categories</h3>
              <ul className="footer-links">
                {categories.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/explore?category=${cat.slug}`}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="footer-bottom">
            <p className="small">© {STUDIO_CONFIG.copyrightYear} {STUDIO_CONFIG.name}. A curated prop rental studio.</p>
            <ul className="socials">
              <li><a href={STUDIO_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href={STUDIO_CONFIG.socials.pinterest} target="_blank" rel="noopener noreferrer">Pinterest</a></li>
              <li><a href={STUDIO_CONFIG.socials.behance} target="_blank" rel="noopener noreferrer">Behance</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
