import React from "react";
import { cn } from "@/lib/utils";

export const EmptyState = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-20 px-6", className)}>
      {Icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
          <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
};
