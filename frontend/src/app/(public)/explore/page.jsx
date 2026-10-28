"use client";

import { Suspense } from "react";
import Explore from "@/views/Explore";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-[72px]" />}>
      <Explore />
    </Suspense>
  );
}
