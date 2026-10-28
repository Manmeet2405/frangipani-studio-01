import React from "react";
import { cn } from "@/lib/utils";

const config = {
  available: { label: "Available", dot: "bg-accent", text: "text-accent" },
  reserved: { label: "Reserved", dot: "bg-gold", text: "text-gold" },
  rented: { label: "On Rent", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export const AvailabilityBadge = ({ status = "available", className }) => {
  const c = config[status] || config.available;
  return (
    <span className={cn("inline-flex items-center gap-2 font-label text-[0.62rem] tracking-[0.18em]", c.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
};
