"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Check for a hash in the URL
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};
