"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
