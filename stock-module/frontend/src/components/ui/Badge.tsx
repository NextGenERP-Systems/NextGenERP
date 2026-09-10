import * as React from "react";
import { cn } from "@/lib/utils";

// ERPNext-style indicator: colored dot + plain text, no background pill
const STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  DRAFT:              { dot: "bg-slate-400",   text: "text-slate-600",  label: "Draft" },
  SUBMITTED:          { dot: "bg-green-500",   text: "text-green-700",  label: "Submitted" },
  CANCELLED:          { dot: "bg-red-400",     text: "text-red-600",    label: "Cancelled" },
  ACCEPTED:           { dot: "bg-green-500",   text: "text-green-700",  label: "Accepted" },
  REJECTED:           { dot: "bg-red-500",     text: "text-red-700",    label: "Rejected" },
  ACTIVE:             { dot: "bg-blue-500",    text: "text-blue-700",   label: "Active" },
  EXPIRED:            { dot: "bg-amber-500",   text: "text-amber-700",  label: "Expired" },
  FIFO:               { dot: "bg-indigo-500",  text: "text-indigo-700", label: "FIFO" },
  MOVING_AVERAGE:     { dot: "bg-emerald-500", text: "text-emerald-700",label: "Moving Avg" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status.toUpperCase()] ?? {
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

export function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60", className)}
      {...props}
    >
      {children}
    </span>
  );
}
