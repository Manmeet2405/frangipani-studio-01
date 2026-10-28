"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { StudioLogo } from "@/components/common/StudioLogo";

export const MobileNav = ({ open, onClose, links }) => {
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-[86%] max-w-sm border-r border-border bg-background p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Link href="/" onClick={onClose} className="flex items-center">
              <StudioLogo size="sm" />
            </Link>
            <button aria-label="Close menu" onClick={onClose} className="text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-6 py-8">
            {links.map((l, i) => (
              <Link
                key={l.label}
                href={l.to}
                onClick={onClose}
                className={cn(
                  "border-b border-border/60 py-4 font-serif text-3xl transition-colors",
                  !l.hash && pathname === l.to ? "text-accent" : "text-foreground hover:text-accent"
                )}
              >
                <span className="mr-3 font-label text-xs text-muted-foreground">0{i + 1}</span>
                {l.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={onClose}
              className="border-b border-border/60 py-4 font-serif text-3xl text-foreground hover:text-accent"
            >
              <span className="mr-3 font-label text-xs text-muted-foreground">0{links.length + 1}</span>
              Wishlist
            </Link>
          </nav>

          <div className="border-t border-border p-6">
            <Button asChild variant="editorial" size="lg" className="w-full">
              <Link href="/explore" onClick={onClose}>Explore Props</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
