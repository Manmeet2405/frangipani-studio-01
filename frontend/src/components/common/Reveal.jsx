"use client";

import React from "react";
import { motion } from "framer-motion";

// Subtle scroll-triggered entrance used across editorial sections.
export const Reveal = ({ children, delay = 0, y = 28, className = "", once = true }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
};
