import * as React from "react";
import { cn } from "@/lib/utils";

// ERPNext-style indicator: colored dot + plain text, no background pill
const STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  DRAFT:              { dot: "bg-slate-400",   text: "text-slate-600",  label: "Draft" },
  OPEN:               { dot: "bg-cyan-500",    text: "text-cyan-700",   label: "Open" },
  REPLIED:            { dot: "bg-cyan-500",    text: "text-cyan-700",   label: "Replied" },
  ORDERED:            { dot: "bg-green-500",   text: "text-green-700",  label: "Ordered" },
  TO_DELIVER_AND_BILL:{ dot: "bg-orange-400",  text: "text-orange-700", label: "To Deliver & Bill" },
  TO_DELIVER:         { dot: "bg-orange-400",  text: "text-orange-700", label: "To Deliver" },
  TO_BILL:            { dot: "bg-yellow-500",  text: "text-yellow-700", label: "To Bill" },
  COMPLETED:          { dot: "bg-green-500",   text: "text-green-700",  label: "Completed" },
  CANCELLED:          { dot: "bg-red-400",     text: "text-red-600",    label: "Cancelled" },
  LOST:               { dot: "bg-red-400",     text: "text-red-600",    label: "Lost" },
  EXPIRED:            { dot: "bg-slate-400",   text: "text-slate-500",  label: "Expired" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    dot: "bg-slate-300",
    text: "text-slate-500",
    label: status,
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// Generic badge kept for any other uses
export function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs font-medium text-slate-600", className)}
      {...props}
    >
      {children}
    </span>
  );
}

