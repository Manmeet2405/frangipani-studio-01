import React from "react";
import { cn } from "@/lib/utils";

const tones = {
  muted: "bg-[#F1F3F4] text-[#5F6368]",
  pending: "bg-[#FFF4BE] text-[#5C4B00]",
  confirmed: "bg-[#E6F4EA] text-[#137333]",
  active: "bg-[#E8F0FE] text-[#1A73E8]",
  returned: "bg-[#F1F3F4] text-[#5F6368]",
  accent: "bg-[#FFF4BE] text-[#050505]",
  gold: "bg-[#FFF4BE] text-[#5C4B00]",
  success: "bg-[#E6F4EA] text-[#137333]",
  destructive: "bg-red-100 text-red-800",
};

export const StatusBadge = ({ tone = "muted", children, className }) => {
  const normTone = tone?.toLowerCase();
  return (
    <span
      className={cn(
        "badge inline-flex items-center gap-1.5 rounded-sm px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em]",
        tones[normTone] || tones.muted,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
