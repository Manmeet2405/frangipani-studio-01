"use client";

import React from "react";
import Link from "next/link";
import { editorialImages, STUDIO_CONFIG } from "@/data/firangi";

export default function About() {
  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. HERO SECTION */}
      <section className="wrap hero" aria-labelledby="a-title">
        <div className="hero-copy">
          <p className="eyebrow">Our story</p>
          <h1 className="t-hero" id="a-title">
            A prop library with a <em className="t-italic">stylist’s eye.</em>
          </h1>
          <p className="body-lg">
            {STUDIO_CONFIG.name} is a curated prop rental studio, created to make professional styling pieces accessible to creative teams. It began as a corner of a Mumbai studio — a growing collection of objects too beautiful to let sit idle between shoots — and grew into a library serving photographers, filmmakers and stylists who care about the details in every frame.
          </p>
        </div>
        <img
          src={editorialImages.heroPrimary}
          alt="Studio Frangipani curated arrangement of speckled stoneware pots on a ceramic tray"
          className="hero-img"
        />
      </section>

      {/* 2. MISSION BANNER (YELLOW) */}
      <section className="bg-yellow" aria-labelledby="mission-title">
        <div
          className="wrap"
          style={{
            paddingTop: "96px",
            paddingBottom: "96px",
            display: "flex",
            flexWrap: "wrap",
            gap: "32px 96px",
            alignItems: "flex-start",
          }}
        >
          <h2 className="eyebrow" id="mission-title" style={{ flex: "0 0 200px", paddingTop: "14px" }}>
            Our mission
          </h2>
          <p className="t-section" style={{ flex: "1 1 560px", maxWidth: "64rem" }}>
            To give every creative team access to objects with genuine character — beautifully maintained, thoughtfully curated and ready for the frame, without the cost of owning them.
          </p>
        </div>
      </section>

      {/* 3. WHO WE SERVE */}
      <section className="section" aria-labelledby="who-title">
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "48px 96px", alignItems: "flex-start" }}>
          <div className="stack-16" style={{ flex: "1 1 320px" }}>
            <p className="eyebrow">Who we serve</p>
            <h2 className="t-section" id="who-title">Made for the people behind the image.</h2>
          </div>
          <ul
            className="list-rows"
            style={{
              flex: "999 1 560px",
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              columnGap: "40px",
            }}
          >
            <li>Photographers</li>
            <li>Filmmakers</li>
            <li>Fashion Stylists</li>
            <li>Advertising Agencies</li>
            <li>Production Houses</li>
            <li>Content Creators &amp; Brands</li>
          </ul>
        </div>
      </section>

      {/* 4. PRINCIPLES BEHIND THE LIBRARY */}
      <section className="section bg-ivory" aria-labelledby="diff-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">What makes us different</p>
              <h2 className="t-section" id="diff-title">The principles behind the library.</h2>
            </div>
          </div>
          <ol className="steps" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))" }}>
            <li>
              <p className="step-n">01</p>
              <h3 className="step-t">Curated, never generic</h3>
              <p className="step-c">Every piece is chosen by our stylists for its character, patina and presence on camera.</p>
            </li>
            <li>
              <p className="step-n">02</p>
              <h3 className="step-t">Prepped to perfection</h3>
              <p className="step-c">Steamed, polished and condition-checked before every dispatch so it arrives shoot-ready.</p>
            </li>
            <li>
              <p className="step-n">03</p>
              <h3 className="step-t">Built for creatives</h3>
              <p className="step-c">Flexible rentals, styling notes and a team that speaks the language of the frame.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* 5. STUDIO FRANGIPANI IN NUMBERS (DARK BAND) */}
      <section className="section-sm bg-black on-dark" aria-label="Studio Frangipani in numbers">
        <div className="wrap">
          <dl className="stats">
            <div>
              <dt className="sr-only">Props in the library</dt>
              <dd className="stat-n" style={{ color: "#FFFFFF" }}>300+</dd>
              <p className="stat-l" style={{ color: "rgba(255,255,255,0.78)" }} aria-hidden="true">
                Props in the library
              </p>
            </div>
            <div>
              <dt className="sr-only">Shoots styled</dt>
              <dd className="stat-n" style={{ color: "#FFFFFF" }}>1,200+</dd>
              <p className="stat-l" style={{ color: "rgba(255,255,255,0.78)" }} aria-hidden="true">
                Shoots styled
              </p>
            </div>
            <div>
              <dt className="sr-only">Studios and agencies</dt>
              <dd className="stat-n" style={{ color: "#FFFFFF" }}>180+</dd>
              <p className="stat-l" style={{ color: "rgba(255,255,255,0.78)" }} aria-hidden="true">
                Studios &amp; agencies
              </p>
            </div>
            <div>
              <dt className="sr-only">Founded</dt>
              <dd className="stat-n" style={{ color: "#FED508" }}>2019</dd>
              <p className="stat-l" style={{ color: "rgba(255,255,255,0.78)" }} aria-hidden="true">
                Founded
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* 6. THE STUDIO SPLIT */}
      <section className="media-split" aria-labelledby="studio-title">
        <div className="media-split-copy">
          <p className="eyebrow">The studio</p>
          <h2 className="t-section" id="studio-title">
            Where objects are chosen, restored and readied.
          </h2>
          <p className="body-lg measure">
            Our Mumbai studio is part archive, part workshop. Pieces are sourced from estate sales, artisans and travels, then restored and catalogued. When a shoot calls, they’re styled and prepped by hand.
          </p>
          <div className="btn-row" style={{ marginTop: "32px" }}>
            <Link href="/explore" className="btn btn-primary">
              Explore the collection
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Visit the studio
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
        <img
          src={editorialImages.studio}
          alt="Studio Frangipani workshop"
          loading="lazy"
        />
      </section>
    </div>
  );
}
