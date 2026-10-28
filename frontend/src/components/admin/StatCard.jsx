import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const StatCard = ({ label, value, delta, trend, sub, icon: Icon, highlight = false }) => {
  const up = trend === "up";
  return (
    <div
      className={cn(
        "card flex flex-col p-6 transition-all duration-200",
        highlight
          ? "border-[#FED508] bg-[#FED508] text-[#050505] shadow-sm"
          : "border border-[#DAD8CF] bg-white text-[#050505]"
      )}
      style={highlight ? { background: "#FED508", borderColor: "#FED508" } : undefined}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "meta-cat text-xs uppercase tracking-wider font-semibold",
            highlight ? "text-[#050505]" : "text-[#65645E]"
          )}
        >
          {label}
        </span>
        {Icon && (
          <Icon
            className={cn("h-4 w-4", highlight ? "text-[#050505]" : "text-[#050505]")}
            strokeWidth={1.8}
          />
        )}
      </div>
      <div
        className="kpi-n mt-4 font-serif text-4xl text-[#050505]"
        style={{ fontFamily: "var(--serif, 'Source Serif 4', serif)" }}
      >
        {value}
      </div>
      <div className="kpi-d mt-auto flex items-center gap-2 pt-4">
        {delta && (
          <span
            className={cn(
              "delta inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold",
              highlight
                ? "bg-[#050505] text-[#FED508]"
                : up
                ? "bg-[#FFF4BE] text-[#050505]"
                : "bg-red-100 text-red-800"
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
        {sub && (
          <span
            className={cn(
              "text-xs",
              highlight ? "text-[#050505]/80 font-medium" : "text-[#65645E]"
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
};
