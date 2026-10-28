import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { editorialImages } from "@/data/firangi";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="wrap nf flex-1" style={{ paddingTop: "96px", paddingBottom: "120px" }}>
        <div className="stack-24">
          <p className="eyebrow">Error 404</p>
          <p className="nf-num" aria-hidden="true">
            4<img src="/images/frangipani-flower.svg" alt="" style={{ width: "120px", height: "120px" }} />4
          </p>
          <h1 className="t-section">This piece has left the frame.</h1>
          <p className="body-lg measure">
            The page you’re looking for has moved, or the prop is no longer in the library. Head back to the collection to find something just as good.
          </p>
          <div className="btn-row" style={{ marginTop: "32px" }}>
            <Link href="/explore" className="btn btn-primary">
              Explore props
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
            <Link href="/" className="btn btn-secondary">
              Back to home
              <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
        <img
          src={editorialImages.flatlayA}
          alt="Curated still life on marble"
          style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
        />
      </main>
      <Footer />
    </div>
  );
}
