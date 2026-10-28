"use client";

import React, { useMemo } from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  catalogue, filterCategoriesList, priceBands, colourOptions, colourSwatch,
  styleOptions, shootTypeOptions, availabilityOptions,
} from "@/data/firangi";

const CheckRow = ({ checked, onChange, label, count }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 py-[7px] text-sm text-foreground">
    <span className="flex items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className={cn(checked && "text-accent")}>{label}</span>
    </span>
    {count != null && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
  </label>
);

const Group = ({ value, title, active, children }) => (
  <AccordionItem value={value} className="border-border">
    <AccordionTrigger className="py-4 hover:no-underline">
      <span className="flex items-center gap-2">
        <span className="eyebrow text-foreground">{title}</span>
        {active > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.58rem] font-medium text-accent-foreground">{active}</span>
        )}
      </span>
    </AccordionTrigger>
    <AccordionContent className="pb-5">{children}</AccordionContent>
  </AccordionItem>
);

export const FilterControls = ({ filters, setFilters, onReset }) => {
  const toggle = (key, value) =>
    setFilters((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });

  // Static counts from the full catalogue for helpful context.
  const counts = useMemo(() => {
    const c = { categories: {}, prices: {}, colours: {}, styles: {}, shootTypes: {}, availability: {} };
    catalogue.forEach((p) => {
      p.filterCategories.forEach((x) => (c.categories[x] = (c.categories[x] || 0) + 1));
      p.colourTags.forEach((x) => (c.colours[x] = (c.colours[x] || 0) + 1));
      c.styles[p.styleTag] = (c.styles[p.styleTag] || 0) + 1;
      p.shootTags.forEach((x) => (c.shootTypes[x] = (c.shootTypes[x] || 0) + 1));
      c.availability[p.availabilityGroup] = (c.availability[p.availabilityGroup] || 0) + 1;
      priceBands.forEach((b) => {
        if (p.pricePerDay >= b.min && p.pricePerDay <= b.max) c.prices[b.id] = (c.prices[b.id] || 0) + 1;
      });
    });
    return c;
  }, []);

  const totalActive = Object.values(filters).reduce((s, a) => s + a.length, 0);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="font-serif text-2xl text-foreground">Filters</h3>
        {totalActive > 0 && (
          <button onClick={onReset} className="font-label text-[0.66rem] tracking-[0.14em] text-accent hover:underline">
            CLEAR ALL
          </button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "colour", "style", "shoot", "availability"]}>
        <Group value="category" title="Category" active={filters.categories.length}>
          <div className="space-y-0">
            {filterCategoriesList.map((c) => (
              <CheckRow key={c} label={c} count={counts.categories[c] || 0}
                checked={filters.categories.includes(c)} onChange={() => toggle("categories", c)} />
            ))}
          </div>
        </Group>

        <Group value="price" title="Price" active={filters.prices.length}>
          <div className="space-y-0">
            {priceBands.map((b) => (
              <CheckRow key={b.id} label={b.label} count={counts.prices[b.id] || 0}
                checked={filters.prices.includes(b.id)} onChange={() => toggle("prices", b.id)} />
            ))}
          </div>
        </Group>

        <Group value="colour" title="Colour" active={filters.colours.length}>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {colourOptions.map((c) => {
              const selected = filters.colours.includes(c);
              return (
                <button key={c} type="button" onClick={() => toggle("colours", c)}
                  className={cn(
                    "flex items-center gap-2 border px-2.5 py-2 text-left text-xs transition-colors",
                    selected ? "border-accent bg-accent/8 text-accent" : "border-border text-foreground hover:border-foreground/40"
                  )}>
                  <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-border/60" style={{ backgroundColor: colourSwatch[c] }} />
                  <span className="truncate">{c}</span>
                </button>
              );
            })}
          </div>
        </Group>

        <Group value="style" title="Style" active={filters.styles.length}>
          <div className="space-y-0">
            {styleOptions.map((s) => (
              <CheckRow key={s} label={s} count={counts.styles[s] || 0}
                checked={filters.styles.includes(s)} onChange={() => toggle("styles", s)} />
            ))}
          </div>
        </Group>

        <Group value="shoot" title="Shoot Type" active={filters.shootTypes.length}>
          <div className="space-y-0">
            {shootTypeOptions.map((s) => (
              <CheckRow key={s} label={s} count={counts.shootTypes[s] || 0}
                checked={filters.shootTypes.includes(s)} onChange={() => toggle("shootTypes", s)} />
            ))}
          </div>
        </Group>

        <Group value="availability" title="Availability" active={filters.availability.length}>
          <div className="space-y-0">
            {availabilityOptions.map((a) => (
              <CheckRow key={a} label={a} count={counts.availability[a] || 0}
                checked={filters.availability.includes(a)} onChange={() => toggle("availability", a)} />
            ))}
          </div>
        </Group>
      </Accordion>
    </div>
  );
};
