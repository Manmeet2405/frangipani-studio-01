"use client";

import React from "react";
import { STUDIO_CONFIG } from "@/config/detailsConfig";

export const StudioLogo = ({ dark = false, size = "md", className = "" }) => {
  const fontSizes = {
    sm: "16px",
    md: "19px",
    lg: "23px",
  };

  const dotSizes = {
    sm: "5px",
    md: "7px",
    lg: "8px",
  };

  return (
    <span
      className={`inline-flex items-center select-none whitespace-nowrap transition-opacity hover:opacity-90 ${className}`}
      style={{ gap: "8px" }}
    >
      <span
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontSize: fontSizes[size] || fontSizes.md,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: dark ? "#FFFFFF" : "#050505",
          lineHeight: 1,
          display: "inline-block",
        }}
      >
        {STUDIO_CONFIG.name}
      </span>
      <span
        style={{
          display: "inline-block",
          width: dotSizes[size] || dotSizes.md,
          height: dotSizes[size] || dotSizes.md,
          borderRadius: "50%",
          backgroundColor: "#FED508",
          flexShrink: 0,
          marginBottom: "1px",
        }}
        aria-hidden="true"
      />
    </span>
  );
};
