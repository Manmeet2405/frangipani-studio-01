"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const RequestContext = createContext(null);
const STORAGE_KEY = "firangi_request_cart";

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        items: parsed.items || [],
        quantities: parsed.quantities || {},
        range: parsed.range || { start: null, end: null },
      };
    }
  } catch (e) { /* ignore */ }
  return { items: [], quantities: {}, range: { start: null, end: null } };
};

export const RequestProvider = ({ children }) => {
  const initial = readInitial();
  const [items, setItems] = useState(initial.items); // array of prop ids
  const [quantities, setQuantities] = useState(initial.quantities); // { [id]: number }
  const [range, setRangeState] = useState(initial.range); // ISO strings

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, quantities, range }));
    } catch (e) { /* ignore */ }
  }, [items, quantities, range]);

  const add = useCallback((id, qtyOrRange, maybeRange) => {
    let qty = 1;
    let newRange = null;

    if (typeof qtyOrRange === "number") {
      qty = Math.max(1, qtyOrRange);
      newRange = maybeRange;
    } else if (qtyOrRange && typeof qtyOrRange === "object") {
      newRange = qtyOrRange;
      if (typeof maybeRange === "number") qty = maybeRange;
    }

    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 0) + (typeof qtyOrRange === "number" ? qty : 0) || qty),
    }));

    if (newRange && (newRange.start || newRange.end)) {
      setRangeState((prev) => ({
        start: newRange.start || prev.start,
        end: newRange.end || prev.end,
      }));
    }
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    const valid = Math.max(1, Number(qty) || 1);
    setQuantities((prev) => ({ ...prev, [id]: valid }));
  }, []);

  const getQuantity = useCallback((id) => {
    return quantities[id] || 1;
  }, [quantities]);

  const addMany = useCallback((ids) => {
    setItems((prev) => Array.from(new Set([...prev, ...ids])));
    setQuantities((prev) => {
      const updated = { ...prev };
      ids.forEach((id) => {
        if (!updated[id]) updated[id] = 1;
      });
      return updated;
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x !== id));
    setQuantities((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setQuantities({});
    setRangeState({ start: null, end: null });
  }, []);

  const has = useCallback((id) => items.includes(id), [items]);

  const setRange = useCallback((start, end) => {
    setRangeState({
      start: start ? new Date(start).toISOString() : null,
      end: end ? new Date(end).toISOString() : null,
    });
  }, []);

  const totalCount = items.reduce((sum, id) => sum + (quantities[id] || 1), 0);

  return (
    <RequestContext.Provider
      value={{
        items,
        quantities,
        range,
        count: items.length,
        totalUnitsCount: totalCount,
        add,
        updateQuantity,
        getQuantity,
        addMany,
        remove,
        clear,
        has,
        setRange,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequest must be used within RequestProvider");
  return ctx;
};
