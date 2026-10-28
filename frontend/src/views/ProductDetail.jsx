"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getPropById,
  getRelatedProps,
  props as allProps,
  categoryName,
  formatINR,
  getPropSKU,
  getWhatsAppLink,
  STUDIO_CONFIG,
} from "@/data/firangi";
import { useWishlist } from "@/context/WishlistContext";
import { useRequest } from "@/context/RequestContext";
import { ProductCard } from "@/components/common/ProductCard";
import { DateRangePicker } from "@/components/common/DateRangePicker";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const prop = getPropById(id);

  const { isWishlisted, toggle } = useWishlist();
  const { add: addToRequest, has: inRequest } = useRequest();

  const [activeImg, setActiveImg] = useState(0);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [termsOpen, setTermsOpen] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  const related = useMemo(() => {
    if (!prop) return [];
    let list = getRelatedProps(prop, 6);
    if (list.length < 4) {
      const fill = allProps.filter((p) => p.id !== prop.id && !list.includes(p));
      list = [...list, ...fill].slice(0, 6);
    }
    return list.slice(0, 6);
  }, [prop]);

  if (!prop) {
    return (
      <div className="page" style={{ padding: "96px 20px", textAlign: "center" }}>
        <h1 className="t-section">Prop not found</h1>
        <p className="body-lg" style={{ marginTop: "16px" }}>
          This piece may have been retired from the library.
        </p>
        <Link href="/explore" className="btn btn-primary" style={{ marginTop: "24px" }}>
          Back to library
        </Link>
      </div>
    );
  }

  const sku = prop.sku || getPropSKU(prop);
  const images = prop.images && prop.images.length > 0 ? prop.images : ["/images/placeholder.jpg"];
  const maxAvailable = Math.max(1, prop.available ?? 1);
  const isOut = prop.available === 0 || prop.availability === "reserved";

  const days =
    start && end
      ? Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1)
      : 0;

  const unitTotal = days > 0 ? days * prop.pricePerDay : prop.pricePerDay;
  const total = unitTotal * quantity;
  const wished = isWishlisted(prop.id);
  const added = inRequest(prop.id);

  const handleAddToRequest = () => {
    addToRequest(prop.id, quantity, {
      start: start ? new Date(start).toISOString() : null,
      end: end ? new Date(end).toISOString() : null,
    });
    toast("Added to request", {
      description: `${quantity}x ${prop.name} ${days > 0 ? `(${days} days)` : ""}`,
    });
  };

  const handleWhatsAppClick = () => {
    const dateStr =
      start && end
        ? `from ${start} to ${end} (${days} days)`
        : "dates to be confirmed";
    const text =
      `Hi ${STUDIO_CONFIG.name}, I would like to enquire about renting *${prop.name}* (SKU: ${sku})\n\n` +
      `• Quantity: ${quantity} unit(s)\n` +
      `• Rental Period: ${dateStr}\n` +
      `• Daily Rate: ₹${prop.pricePerDay.toLocaleString("en-IN")}/day\n` +
      `• Estimated Total: ₹${total.toLocaleString("en-IN")}\n\n` +
      `Please confirm piece availability and booking procedure. Thank you!`;
    const url = getWhatsAppLink(text);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleToggleSave = () => {
    toggle(prop.id);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist", {
      description: prop.name,
    });
  };

  const prevImg = () => {
    setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImg = () => {
    setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      <main className="wrap">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 24px",
            paddingTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="back-link"
            style={{ background: "none", border: 0, cursor: "pointer" }}
          >
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6"></path>
            </svg>
            <span>Back</span>
          </button>
          <Link href={`/explore?category=${prop.category}`} className="tlink">
            <span>{categoryName(prop.category)}</span>
          </Link>
        </nav>

        {/* PDP Main Split */}
        <div className="pdp">
          {/* Left: Gallery */}
          <section aria-label="Gallery">
            <div className="gallery-main">
              <img src={images[activeImg]} alt={prop.name} />
            </div>

            <div className="thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`thumb ${activeImg === i ? "is-sel" : ""}`}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={activeImg === i}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}

              {images.length > 1 && (
                <div className="thumbs-nav">
                  <button
                    type="button"
                    className="circle-btn"
                    aria-label="Previous image"
                    onClick={prevImg}
                  >
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m15 6-6 6 6 6"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="circle-btn"
                    aria-label="Next image"
                    onClick={nextImg}
                  >
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m9 6 6 6-6 6"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right: Info & Booking */}
          <section className="pdp-info" aria-labelledby="p-title">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 10px", minWidth: 0 }}>
                <p className="eyebrow eyebrow-muted" style={{ margin: 0 }}>{categoryName(prop.category)}</p>
                <span style={{ color: "var(--line)" }}>•</span>
                <span style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {sku}
                </span>
              </div>
              <span className={`status-pill ${isOut ? "is-out" : ""}`} style={{ flexShrink: 0 }}>
                <i className="dot" aria-hidden="true"></i>
                {isOut ? "Reserved" : (prop.available != null ? `${prop.available} in stock` : "Available")}
              </span>
            </div>

            <h1 className="t-section" id="p-title" style={{ marginTop: "12px" }}>
              {prop.name}
            </h1>
            <p className="pdp-price">
              <strong>₹{Number(prop.pricePerDay).toLocaleString("en-IN")}</strong>
              <span>per day</span>
            </p>
            <p className="body-lg">{prop.description}</p>

            {/* Date Range Picker Component */}
            <div style={{ paddingTop: "8px" }}>
              <p className="eyebrow" style={{ marginBottom: "16px" }}>Select rental dates</p>
              <DateRangePicker
                start={start}
                end={end}
                onChange={(s, e) => {
                  setStart(s);
                  setEnd(e);
                }}
              />
            </div>

            {/* Quantity Selector */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--line)" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--black)" }}>Quantity</p>
                <p className="small">Available units: {prop.available ?? 1}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="circle-btn"
                  style={{ width: "36px", height: "36px" }}
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span style={{ fontFamily: "var(--serif)", fontSize: "20px", minWidth: "24px", textAlign: "center" }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="circle-btn"
                  style={{ width: "36px", height: "36px" }}
                  disabled={quantity >= maxAvailable}
                  onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Summary Rows */}
            <div className="summary-rows">
              <div className="srow">
                <span className="k">Daily price</span>
                <span>₹{Number(prop.pricePerDay).toLocaleString("en-IN")}</span>
              </div>
              <div className="srow">
                <span className="k">Rental duration</span>
                <span>{days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "—"}</span>
              </div>
              <div className="srow">
                <span className="k">Quantity</span>
                <span>{quantity} {quantity === 1 ? "piece" : "pieces"}</span>
              </div>
              <div className="srow srow-total">
                <span className="k">Estimated total</span>
                <span className="v">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Button Actions */}
            {isOut ? (
              <>
                <div className="unavailable-note" role="note" style={{ marginTop: "16px" }}>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                  <p>
                    All units are currently reserved for another shoot. Save it to your wishlist or enquire on WhatsApp for upcoming returns.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-block btn-lg" disabled style={{ marginTop: "16px" }}>
                  Currently unavailable
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
              </>
            ) : added ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <button type="button" className="btn btn-done btn-block btn-lg" aria-disabled="true">
                  Added to request
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5"></path>
                  </svg>
                </button>
                <Link href="/rental-request" className="btn btn-primary btn-block btn-lg">
                  Review your request
                  <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={handleAddToRequest}
                style={{ marginTop: "16px" }}
              >
                Add to request
                <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </button>
            )}

            {/* Secondary Buttons: WhatsApp & Wishlist */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="btn btn-secondary"
                style={{ justifyContent: "center", gap: "10px" }}
              >
                <span>Chat on WhatsApp</span>
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "#25D366" }}>
                  <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                </svg>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                aria-pressed={wished}
                onClick={handleToggleSave}
                style={{ justifyContent: "center", gap: "12px" }}
              >
                <span>{wished ? "Saved" : "Save to wishlist"}</span>
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    className="ic-heart"
                    d="M19.5 12.6 12 20l-7.5-7.4A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 7.5 6.3Z"
                    style={{ fill: wished ? "currentColor" : "none" }}
                  ></path>
                </svg>
              </button>
            </div>

            {/* Features Row */}
            <ul className="features" style={{ marginTop: "32px" }}>
              <li className="feature">
                <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"></path>
                  <circle cx="7" cy="18" r="1.8"></circle>
                  <circle cx="17" cy="18" r="1.8"></circle>
                </svg>
                Studio delivery
              </li>
              <li className="feature">
                <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Condition assured
              </li>
              <li className="feature">
                <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"></path>
                </svg>
                Shoot-ready prep
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Specifications & Accordion Terms */}
      <section className="section bg-ivory" aria-labelledby="spec-title" style={{ marginTop: "64px" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", gap: "64px" }}>
          <div>
            <p className="eyebrow">The details</p>
            <h2 className="t-section" id="spec-title" style={{ margin: "16px 0 32px" }}>
              Specifications
            </h2>
            <dl className="specs">
              <div className="spec">
                <dt>Code / SKU</dt>
                <dd style={{ fontSize: "18px" }}>{sku}</dd>
              </div>
              <div className="spec">
                <dt>Material</dt>
                <dd>{prop.material || "Ceramic"}</dd>
              </div>
              <div className="spec">
                <dt>Colour</dt>
                <dd>{prop.color || "Neutral"}</dd>
              </div>
              <div className="spec">
                <dt>Dimensions</dt>
                <dd>{prop.dimensions || "Standard"}</dd>
              </div>
              <div className="spec">
                <dt>Condition</dt>
                <dd>{prop.condition || "Excellent"}</dd>
              </div>
              <div className="spec">
                <dt>Times rented</dt>
                <dd>{prop.rentalCount}+</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="eyebrow">Suitable for</p>
            <h3 className="t-title" style={{ margin: "16px 0 20px" }}>
              At home in every set
            </h3>
            <div className="chips" style={{ marginBottom: "40px" }}>
              {prop.shootTypes?.map((s) => (
                <span key={s} className="pill pill-line">
                  {s}
                </span>
              ))}
            </div>

            <div className="acc-sm">
              <div className="acc-item">
                <button
                  type="button"
                  className="acc-btn"
                  aria-expanded={termsOpen}
                  onClick={() => setTermsOpen(!termsOpen)}
                >
                  <span className="acc-q">Rental terms</span>
                  {termsOpen ? (
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14"></path>
                    </svg>
                  ) : (
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  )}
                </button>
                {termsOpen && (
                  <p className="acc-panel">
                    Minimum one-day rental. A refundable security deposit applies per piece. Props are dispatched cleaned and styled; please return in the same condition. Extended rentals are billed per day.
                  </p>
                )}
              </div>

              <div className="acc-item">
                <button
                  type="button"
                  className="acc-btn"
                  aria-expanded={delOpen}
                  onClick={() => setDelOpen(!delOpen)}
                >
                  <span className="acc-q">Delivery &amp; pickup</span>
                  {delOpen ? (
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14"></path>
                    </svg>
                  ) : (
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  )}
                </button>
                {delOpen && (
                  <p className="acc-panel">
                    Studio delivery available across the city with 48-hour notice. Self-pickup from the {STUDIO_CONFIG.name} studio in {STUDIO_CONFIG.addressLine2} is complimentary.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Props */}
      <section className="section" aria-labelledby="rel-title">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-copy">
              <p className="eyebrow">You may also like</p>
              <h2 className="t-section" id="rel-title">
                Related props
              </h2>
            </div>
            <Link href={`/explore?category=${prop.category}`} className="tlink">
              <span>View all props</span>
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <div className="pgrid pgrid-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} prop={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
