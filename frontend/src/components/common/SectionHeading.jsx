import React from "react";
import { cn } from "@/lib/utils";

// Editorial section heading: eyebrow micro-label + large serif title + optional lede.
export const SectionHeading = ({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
  titleClassName,
  as: Tag = "h2",
}) => {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="eyebrow text-accent block mb-4">{eyebrow}</span>
      )}
      <Tag
        className={cn(
          "font-serif text-4xl sm:text-5xl leading-[1.05] text-foreground",
          titleClassName
        )}
      >
        {title}
      </Tag>
      {lede && (
        <p className="mt-5 text-muted-foreground text-base leading-relaxed max-w-xl">
          {lede}
        </p>
      )}
    </div>
  );
};
