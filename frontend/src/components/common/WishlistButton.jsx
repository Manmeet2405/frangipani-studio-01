"use client";

import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

export const WishlistButton = ({ prop, className, variant = "floating" }) => {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(prop.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(prop.id);
    toast(active ? "Removed from wishlist" : "Saved to wishlist", {
      description: prop.name,
    });
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.86 }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={handleClick}
      className={cn(
        "group/wish inline-flex items-center justify-center transition-colors duration-300",
        variant === "floating" &&
          "h-9 w-9 rounded-full bg-background/85 backdrop-blur-sm border border-border hover:bg-background",
        variant === "inline" && "h-11 w-11 rounded-sm border border-input hover:bg-secondary",
        className
      )}
    >
      <motion.span
        key={active ? "on" : "off"}
        initial={active ? { scale: 0.6 } : false}
        animate={active ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            active ? "fill-burgundy text-burgundy" : "text-foreground group-hover/wish:text-accent"
          )}
        />
      </motion.span>
    </motion.button>
  );
};
