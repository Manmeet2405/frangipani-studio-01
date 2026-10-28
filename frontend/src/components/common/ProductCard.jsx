"use client";

import React from "react";
import Link from "next/link";
import { categoryName, getPropSKU } from "@/data/firangi";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

export const ProductCard = ({ prop, index = 0 }) => {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(prop?.id);
  const sku = prop?.sku || getPropSKU(prop, index);
  const isOut = prop?.available === 0 || prop?.availability === "reserved";
  const priceStr = Number(prop?.pricePerDay || 0).toLocaleString("en-IN");
  const img = prop?.images && prop.images[0] ? prop.images[0] : "/images/placeholder.jpg";
  const cat = categoryName(prop?.category);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(prop.id);
    toast(saved ? "Removed from wishlist" : "Saved to wishlist", {
      description: prop.name,
    });
  };

  return (
    <article className={`pcard ${isOut ? "is-out" : ""}`}>
      <div className="pcard-media">
        <Link href={`/product/${prop.id}`} className="pcard-imglink" aria-label={prop.name}>
          <img src={img} alt={prop.name} className="pcard-img" loading="lazy" />
        </Link>
        <button
          type="button"
          className={`heart-float ${saved ? "is-on" : ""}`}
          aria-label={saved ? `Remove ${prop.name} from wishlist` : `Save ${prop.name} to wishlist`}
          aria-pressed={saved}
          onClick={handleHeartClick}
        >
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path className="ic-heart" d="M19.5 12.6 12 20l-7.5-7.4A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 7.5 6.3Z" />
          </svg>
        </button>
        {isOut && <span className="out-tag">Reserved</span>}
      </div>

      <div
        className="pcard-meta"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "8px",
          minWidth: 0,
        }}
      >
        <p
          className="meta-cat"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
          }}
          title={cat}
        >
          {cat}
        </p>
        {sku && (
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {sku}
          </span>
        )}
      </div>

      <h3 className="pcard-title">
        <Link href={`/product/${prop.id}`}>{prop.name}</Link>
      </h3>

      <div className="pcard-foot">
        <p className="price">
          ₹{priceStr} <span className="per">/ day</span>
        </p>
        <span className={`status ${isOut ? "is-out" : ""}`}>
          <i className="dot" aria-hidden="true" />
          {isOut ? "Reserved" : (prop.available != null ? `${prop.available} In Stock` : "Available")}
        </span>
      </div>
    </article>
  );
};
