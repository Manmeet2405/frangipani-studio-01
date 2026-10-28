"use client";

import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/common/ProductCard";
import {
  editorialImages,
  categories,
  props as allProps,
  getFeaturedProps,
  STUDIO_CONFIG,
} from "@/data/firangi";

const featuredCategories = [
  { name: "Tableware & Serving", slug: "tableware-serving", desc: "Bowls, cake stands, cups, plates & platters.", img: "/images/categories/tableware-serving.jpg" },
  { name: "Glassware & Drinkware", slug: "glassware", desc: "Bottles, drinking glasses, jars & perfume bottles.", img: "/images/categories/glassware.jpg" },
  { name: "Decorative Objects & Display", slug: "decorative-objects", desc: "Vases, frames, mirrors, prisms & vintage pieces.", img: "/images/categories/decorative-objects.jpg" },
  { name: "Metal Objects", slug: "metal-objects", desc: "Brass, copper & silver props for any shoot.", img: "/images/categories/metal-objects.jpg" },
  { name: "Marble, Stone & Natural Materials", slug: "marble-stone", desc: "Marble props, stones & wooden boards.", img: "/images/categories/marble-stone.jpg" },
  { name: "Jewellery & Fashion Display", slug: "jewellery-fashion", desc: "Jewellery display stands & boxes.", img: "/images/categories/jewellery-fashion.jpg" },
  { name: "Themed / Special Props", slug: "themed-props", desc: "Party, pooja, school, sea/ocean & more.", img: "/images/categories/themed-props.jpg" },
  { name: "Product Shoot Essentials", slug: "product-shoot", desc: "Backgrounds, textures, risers & acrylic blocks.", img: "/images/categories/product-shoot.jpg" },
];

export default function Home() {
  const picks = [...getFeaturedProps(), ...allProps.filter((p) => !p.featured)].slice(0, 10);

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. HERO SECTION */}
      <section className="wrap hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">The {STUDIO_CONFIG.name} prop library</p>
          <h1 className="t-hero" id="hero-title">
            Props for every creative vision.
          </h1>
          <p className="body-lg measure">
            Curated objects, accessories and styling pieces for photography, film, fashion and everything in between.
          </p>
          <div className="btn-row">
            <Link href="/explore" className="btn btn-primary btn-lg">
              Explore collection
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary btn-lg">
              How it works
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>

        <figure className="hero-media">
          <img
            src={editorialImages.heroPrimary}
            alt="Speckled stoneware lidded pots with wooden spoons on a long ceramic tray"
            className="hero-img"
          />
          <figcaption className="plate">
            <p className="eyebrow">Featured styling</p>
            <p className="plate-title">The Ivory Editorial Set</p>
          </figcaption>
        </figure>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="section bg-ivory" id="categories" aria-labelledby="cat-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">Browse by category</p>
              <h2 className="t-section" id="cat-title">
                A library organised<br />for the frame.
              </h2>
            </div>
            <Link href="/explore" className="tlink">
              <span>View all props</span>
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>

          <div className="cgrid">
            {featuredCategories.map((c) => (
              <Link key={c.slug} href={`/explore?category=${c.slug}`} className="ctile">
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="ctile-body">
                  <div>
                    <h3 className="ctile-title">{c.name}</h3>
                    <p className="ctile-desc">{c.desc}</p>
                  </div>
                  <span className="ctile-arrow" aria-hidden="true">
                    <svg className="ic" viewBox="0 0 24 24">
                      <path d="M7 17 17 7M8 7h9v9"></path>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EDITORS' SELECTION */}
      <section className="section" aria-labelledby="sel-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">The editors’ selection</p>
              <h2 className="t-section" id="sel-title">
                Curated for your next shoot
              </h2>
              <p className="body-lg measure">
                A rotating edit of the pieces our stylists reach for most.
              </p>
            </div>
            <Link href="/explore" className="tlink">
              <span>Shop all props</span>
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>

          <div className="pgrid pgrid-5">
            {picks.map((prop, index) => (
              <ProductCard key={prop.id} prop={prop} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL SPLIT */}
      <section className="media-split bg-ivory" aria-labelledby="ed-title">
        <img
          src={editorialImages.heroSecondary}
          alt="A blank sheet of paper beside eucalyptus and a ceramic pot on marble"
          loading="lazy"
        />
        <div className="media-split-copy">
          <p className="eyebrow">Editorial</p>
          <h2 className="t-section" id="ed-title">
            Small details.<br />
            <em className="t-italic">Big visual stories.</em>
          </h2>
          <p className="body-lg measure">
            Find the pieces that transform a frame — the quiet objects that give an image its atmosphere and its edge.
          </p>
          <div className="btn-row" style={{ marginTop: "32px" }}>
            <Link href="/explore" className="btn btn-primary">
              Explore the collection
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (4 STEPS) */}
      <section className="section" aria-labelledby="how-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">How it works</p>
              <h2 className="t-section" id="how-title">
                From first browse to final frame.
              </h2>
            </div>
            <Link href="/how-it-works" className="tlink">
              <span>How it works</span>
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>

          <ol className="steps">
            <li>
              <p className="step-n">01</p>
              <h3 className="step-t">Discover</h3>
              <p className="step-c">Browse our curated collection of objects with genuine character.</p>
            </li>
            <li>
              <p className="step-n">02</p>
              <h3 className="step-t">Select</h3>
              <p className="step-c">Choose the props that fit your concept and save them to a wishlist.</p>
            </li>
            <li>
              <p className="step-n">03</p>
              <h3 className="step-t">Request</h3>
              <p className="step-c">Send a rental request with your preferred shoot dates.</p>
            </li>
            <li>
              <p className="step-n">04</p>
              <h3 className="step-t">Create</h3>
              <p className="step-c">Props arrive prepped and camera-ready. Bring your vision to life.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* 6. IN THE FRAME (STYLING GALLERY) */}
      <section className="section bg-ivory" aria-labelledby="frame-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">In the frame</p>
              <h2 className="t-section" id="frame-title">
                Props, styled for the shoot.
              </h2>
              <p className="body-lg measure">
                A glimpse of the {STUDIO_CONFIG.name} library at work across editorials, campaigns and lifestyle sets.
              </p>
            </div>
          </div>

          <div className="gallery">
            <figure className="g-wide g-tall">
              <img src={editorialImages.flatlayA} alt="Notebook, envelopes, a camel beret and an espresso styled on marble" loading="lazy" />
            </figure>
            <figure className="g-tall">
              <img src={allProps.find((p) => p.id === "fr-003")?.images[0] || editorialImages.studio} alt="Close-up of a pearl necklace with a crystal clasp" loading="lazy" />
            </figure>
            <figure className="g-tall">
              <img src={allProps.find((p) => p.id === "fr-025")?.images[0] || editorialImages.neutralProps} alt="Ornate antique gold oval mirror on a pale wall" loading="lazy" />
            </figure>
            <figure>
              <img src={editorialImages.flatlayB} alt="Espresso and a marble-topped tray from above" loading="lazy" />
            </figure>
            <figure>
              <img src={allProps.find((p) => p.id === "fr-007")?.images[0] || editorialImages.heroSecondary} alt="White hydrangeas in a glass bottle and a teacup" loading="lazy" />
            </figure>
            <figure className="g-wide">
              <img src={editorialImages.studio} alt="A cream jar on stacked white plinths with a branch and gold beads" loading="lazy" />
            </figure>
            <figure className="g-wide">
              <img src={allProps.find((p) => p.id === "fr-011")?.images[0] || editorialImages.neutralProps} alt="Tortoiseshell glasses and accessories on a tray" loading="lazy" />
            </figure>
            <figure className="g-wide">
              <img src={editorialImages.neutralProps} alt="Dried eucalyptus pods beside a wooden spool of twine" loading="lazy" />
            </figure>
          </div>
        </div>
      </section>

      {/* 7. CTA BAND */}
      <section className="bg-yellow cta-band" aria-labelledby="cta-title">
        <div className="wrap">
          <p className="eyebrow">Ready when you are</p>
          <h2 className="t-hero" id="cta-title">Planning your next shoot?</h2>
          <p className="body-lg" style={{ color: "#050505" }}>
            Find the pieces that make the frame.
          </p>
          <div className="btn-row">
            <Link href="/explore" className="btn btn-dark btn-lg">
              Explore props
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
            <Link href="/contact" className="btn btn-ghost-dark btn-lg">
              Talk to a stylist
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
