"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const CategoryCard = ({ category, className = "" }) => {
  return (
    <Link
      href={`/explore?category=${category.slug}`}
      className={`group relative block overflow-hidden bg-muted ${className}`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="editorial-img h-full w-full object-cover transition-transform [transition-duration:900ms] ease-editorial group-hover:scale-[1.06]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
        <div>
          <h3 className="font-serif text-2xl text-charcoal-foreground">{category.name}</h3>
          <p className="mt-1 max-w-[16rem] text-xs text-charcoal-foreground/80 leading-relaxed opacity-0 -translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            {category.description}
          </p>
        </div>
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-charcoal-foreground/40 text-charcoal-foreground transition-colors duration-500 group-hover:bg-charcoal-foreground group-hover:text-charcoal">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};
