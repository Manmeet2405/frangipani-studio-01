"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "firangi_wishlist";

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  // Lazy initial state reads persisted value once — avoids the mount-time
  // overwrite race that previously cleared saved items.
  const [ids, setIds] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) { /* ignore */ }
  }, [ids]);

  const isWishlisted = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, isWishlisted, toggle, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
