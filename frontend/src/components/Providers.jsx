"use client";

import { AdminDataProvider } from "@/context/AdminDataContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RequestProvider } from "@/context/RequestContext";

export function Providers({ children }) {
  return (
    <AdminDataProvider>
      <WishlistProvider>
        <RequestProvider>{children}</RequestProvider>
      </WishlistProvider>
    </AdminDataProvider>
  );
}

