"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useRequest } from "@/context/RequestContext";
import { StudioLogo } from "@/components/common/StudioLogo";

export const Navbar = () => {
  const { count: wishCount } = useWishlist();
  const { count: requestCount } = useRequest();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/explore", label: "Explore", active: pathname.startsWith("/explore") || pathname.startsWith("/product") },
    { href: "/#categories", label: "Categories", active: false },
    { href: "/how-it-works", label: "How it works", active: pathname === "/how-it-works" },
    { href: "/about", label: "About", active: pathname === "/about" },
    { href: "/contact", label: "Contact", active: pathname === "/contact" },
  ];

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="logo-link flex items-center" aria-label="Studio Frangipani home">
          <StudioLogo />
        </Link>

        <nav className="main-nav" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`nav-link ${link.active ? "is-active" : ""}`}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/explore" className="icon-btn hicon hicon-search" aria-label="Search the catalogue">
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
          </Link>

          <Link href="/wishlist" className="icon-btn hicon" aria-label={`Wishlist, ${wishCount} saved`}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path className="ic-heart" d="M19.5 12.6 12 20l-7.5-7.4A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 7.5 6.3Z"></path>
            </svg>
            {wishCount > 0 && <span className="count" aria-hidden="true">{wishCount}</span>}
          </Link>

          <Link href="/rental-request" className="icon-btn hicon hicon-req" aria-label={`Rental request, ${requestCount} props`}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="4" width="14" height="17" rx="1.5"></rect>
              <path d="M9 4h6v3H9zM9 12h6M9 16h4"></path>
            </svg>
            {requestCount > 0 && <span className="count" aria-hidden="true">{requestCount}</span>}
          </Link>

          <Link href="/explore" className="btn btn-primary btn-sm header-cta">
            Explore props
            <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </Link>

          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mmenu" role="dialog" aria-label="Menu" aria-modal="true">
          <div className="mmenu-top">
            <Link href="/" className="logo-link flex items-center" aria-label="Studio Frangipani home" onClick={() => setMobileOpen(false)}>
              <StudioLogo />
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18"></path>
              </svg>
            </button>
          </div>

          <nav className="mmenu-links" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`mmenu-link ${link.active ? "is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mmenu-utils">
            <Link href="/wishlist" className="mmenu-util" onClick={() => setMobileOpen(false)}>
              Wishlist <span className="pill">{wishCount}</span>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
            <Link href="/rental-request" className="mmenu-util" onClick={() => setMobileOpen(false)}>
              Rental request <span className="pill">{requestCount}</span>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>

          <Link
            href="/explore"
            className="btn btn-primary btn-block"
            style={{ marginTop: "auto" }}
            onClick={() => setMobileOpen(false)}
          >
            Explore props
            <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </Link>
        </div>
      )}
    </header>
  );
};
