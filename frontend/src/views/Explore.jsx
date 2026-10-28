"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/common/ProductCard";
import {
  catalogue,
  priceBands,
  sortOptions,
  slugToFilterCategory,
  categoryFilterOptions,
  colourOptions,
  styleOptions,
  shootOptions,
  availabilityOptions,
} from "@/data/firangi";

const defaultFilters = () => ({
  categories: [],
  prices: [],
  colours: [],
  styles: [],
  shootTypes: [],
  availability: [],
});

export default function Explore() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState(() => {
    const slug = searchParams.get("category");
    const mapped = slug ? slugToFilterCategory(slug) : null;
    return { ...defaultFilters(), categories: mapped ? [mapped] : [] };
  });

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Collapsible accordion states for filters
  const [openGroups, setOpenGroups] = useState({
    categories: true,
    prices: true,
    colours: false,
    styles: false,
    shootTypes: false,
    availability: false,
  });

  const sortRef = useRef(null);

  useEffect(() => {
    const slug = searchParams.get("category");
    const mapped = slug ? slugToFilterCategory(slug) : null;
    if (mapped) {
      setFilters((p) => ({ ...p, categories: [mapped] }));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGroup = (key) => {
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleOption = (group, value) => {
    setFilters((p) => {
      const current = p[group];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...p, [group]: next };
    });
  };

  const resetAll = () => {
    setFilters(defaultFilters());
    setQuery("");
    router.replace("/explore");
  };

  const results = useMemo(() => {
    let list = catalogue.filter((p) => {
      if (filters.categories.length && !p.filterCategories.some((c) => filters.categories.includes(c))) return false;
      if (filters.prices.length) {
        const ok = filters.prices.some((id) => {
          const b = priceBands.find((x) => x.id === id);
          return b && p.pricePerDay >= b.min && p.pricePerDay <= b.max;
        });
        if (!ok) return false;
      }
      if (filters.colours.length && !p.colourTags.some((c) => filters.colours.includes(c))) return false;
      if (filters.styles.length && !filters.styles.includes(p.styleTag)) return false;
      if (filters.shootTypes.length && !p.shootTags.some((s) => filters.shootTypes.includes(s))) return false;
      if (filters.availability.length && !filters.availability.includes(p.availabilityGroup)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${p.name} ${p.category} ${p.material} ${p.color} ${p.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => b.addedOrder - a.addedOrder);
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "popular":
        list = [...list].sort((a, b) => b.rentalCount - a.rentalCount);
        break;
      default:
        list = [...list].sort((a, b) =>
          b.featured === a.featured ? b.rentalCount - a.rentalCount : b.featured ? 1 : -1
        );
    }
    return list;
  }, [filters, query, sort]);

  // Active filter chips
  const chips = [];
  Object.entries(filters).forEach(([key, arr]) => {
    arr.forEach((val) => {
      let label = val;
      if (key === "prices") {
        label = priceBands.find((b) => b.id === val)?.label || val;
      }
      chips.push({ key, val, label });
    });
  });

  const removeChip = (key, val) => {
    setFilters((p) => ({ ...p, [key]: p[key].filter((v) => v !== val) }));
  };

  const sortLabel = sortOptions.find((s) => s.id === sort)?.label || "Recommended";
  const noFilters = chips.length === 0 && !query;

  // Filter groups configuration
  const filterGroups = [
    {
      id: "categories",
      label: "Category",
      options: (categoryFilterOptions || []).map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        return {
          id,
          label,
          count: catalogue.filter((p) => p.filterCategories && p.filterCategories.includes(id)).length,
        };
      }),
    },
    {
      id: "prices",
      label: "Price per day",
      options: priceBands.map((opt) => ({
        id: opt.id,
        label: opt.label,
        count: catalogue.filter((p) => p.pricePerDay >= opt.min && p.pricePerDay <= opt.max).length,
      })),
    },
    {
      id: "colours",
      label: "Colour",
      options: colourOptions.map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        return {
          id,
          label,
          count: catalogue.filter((p) => p.colourTags && p.colourTags.includes(id)).length,
        };
      }),
    },
    {
      id: "styles",
      label: "Style",
      options: styleOptions.map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        return {
          id,
          label,
          count: catalogue.filter((p) => p.styleTag === id).length,
        };
      }),
    },
    {
      id: "shootTypes",
      label: "Shoot type",
      options: shootOptions.map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        return {
          id,
          label,
          count: catalogue.filter((p) => p.shootTags && p.shootTags.includes(id)).length,
        };
      }),
    },
    {
      id: "availability",
      label: "Availability",
      options: availabilityOptions.map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        return {
          id,
          label,
          count: catalogue.filter((p) => p.availabilityGroup === id).length,
        };
      }),
    },
  ];

  const renderFilterGroups = () => (
    <>
      {filterGroups.map((g) => {
        const isOpen = openGroups[g.id];
        return (
          <div key={g.id} className="fgroup">
            <button
              type="button"
              className="fgroup-btn"
              aria-expanded={isOpen}
              onClick={() => toggleGroup(g.id)}
            >
              {g.label}
              {isOpen ? (
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14"></path>
                </svg>
              ) : (
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              )}
            </button>
            {isOpen && (
              <div className="fgroup-body" role="group" aria-label={g.label}>
                {g.options.map((opt) => {
                  const isChecked = filters[g.id].includes(opt.id);
                  return (
                    <label key={opt.id} className="check">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption(g.id, opt.id)}
                      />
                      <span>{opt.label}</span>
                      <span className="n">{opt.count}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="page" style={{ fontFamily: "var(--sans)", color: "#050505", background: "#FFFFFF" }}>
      {/* 1. EDITORIAL HEADER */}
      <header className="page-head bg-ivory">
        <div className="wrap">
          <p className="eyebrow">The catalogue</p>
          <h1 className="t-section">Explore the collection</h1>
          <p className="body-lg measure">Objects, accessories and details curated for your next visual story.</p>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: "32px" }}>
        {/* 2. SEARCH & SORT TOOLBAR */}
        <div className="toolbar" role="search">
          <div className="search">
            <label htmlFor="q" className="sr-only">Search the catalogue</label>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
            <input
              id="q"
              className="input"
              type="search"
              placeholder="Search by name, material or colour…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="icon-btn search-clear"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18"></path>
                </svg>
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary filters-btn"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
          >
            Filters {chips.length ? `(${chips.length})` : ""}
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8"></path>
              <circle cx="16" cy="7" r="2"></circle>
              <circle cx="10" cy="17" r="2"></circle>
            </svg>
          </button>

          <div className="sort" ref={sortRef}>
            <span className="sort-label" id="sort-l">Sort</span>
            <button
              type="button"
              className="sort-btn"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-labelledby="sort-l sort-v"
              onClick={() => setSortOpen(!sortOpen)}
            >
              <span id="sort-v">{sortLabel}</span>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>

            {sortOpen && (
              <div className="menu" role="listbox" aria-label="Sort props">
                {sortOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={sort === s.id}
                    className={`menu-item ${sort === s.id ? "is-sel" : ""}`}
                    onClick={() => {
                      setSort(s.id);
                      setSortOpen(false);
                    }}
                  >
                    {s.label}
                    {sort === s.id && (
                      <svg className="ic ic-sm" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 7.5"></path>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. EXPLORE LAYOUT (SIDEBAR + GRID) */}
        <div className="explore">
          <aside className="explore-aside" aria-label="Filters">
            <div className="filters-head">
              <h2 className="t-title" style={{ fontSize: "28px", lineHeight: "34px" }}>Filters</h2>
              <button
                type="button"
                className="tlink"
                onClick={resetAll}
                disabled={noFilters}
                style={{ opacity: noFilters ? 0.35 : 1, cursor: noFilters ? "default" : "pointer" }}
              >
                <span>Clear all</span>
              </button>
            </div>

            {renderFilterGroups()}
          </aside>

          <section aria-label="Results">
            <div className="results-head">
              <div className="chips">
                {chips.map((ch) => (
                  <span key={`${ch.key}-${ch.val}`} className="chip">
                    {ch.label}
                    <button
                      type="button"
                      aria-label={`Remove filter ${ch.label}`}
                      onClick={() => removeChip(ch.key, ch.val)}
                    >
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18"></path>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <p className="results-count" aria-live="polite">
                Displaying <strong>{results.length}</strong> of {catalogue.length} props
              </p>
            </div>

            {results.length > 0 ? (
              <div className="pgrid">
                {results.map((prop, index) => (
                  <ProductCard key={prop.id} prop={prop} index={index} />
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <div className="empty">
                  <img src="/images/frangipani-flower.svg" alt="" className="empty-flower" />
                  <div className="empty-copy">
                    <p className="eyebrow">Nothing in the frame</p>
                    <h2 className="t-title">No props match your selection</h2>
                    <p className="body-lg measure">
                      Try a different word or loosen your filters. Looking for something specific? Our stylists offer a bespoke sourcing service for pieces not yet in the library.
                    </p>
                    <div className="btn-row">
                      <button type="button" className="btn btn-primary" onClick={resetAll}>
                        Clear search &amp; filters
                        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 6l12 12M18 6 6 18"></path>
                        </svg>
                      </button>
                      <Link href="/contact" className="btn btn-secondary">
                        Talk to a stylist
                        <svg className="ic ic-arrow" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 4. MOBILE FILTERS SHEET */}
      {sheetOpen && (
        <>
          <div className="sheet-scrim" onClick={() => setSheetOpen(false)}></div>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="sheet-head">
              <h2 className="t-title" style={{ fontSize: "26px" }}>Filters</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close filters"
                onClick={() => setSheetOpen(false)}
              >
                <svg className="ic ic-lg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18"></path>
                </svg>
              </button>
            </div>
            <div className="sheet-body">
              {renderFilterGroups()}
            </div>
            <div className="sheet-foot">
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={resetAll}>
                Clear all
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1.4 }} onClick={() => setSheetOpen(false)}>
                Show {results.length} props
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
