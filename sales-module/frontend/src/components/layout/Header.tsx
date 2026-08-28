"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { AppSwitcher } from "./AppSwitcher";
import { useAuth } from "@/lib/AuthContext";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations, orders, customers, items (Cmd + K)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <AppSwitcher currentModule="sales" />

        <div className="h-5 w-px bg-slate-200" />

        <button className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute top-1 right-1" />
        </button>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-[11px] text-white shadow-xs">
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : "SL"}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {user?.fullName || "Alexander Wright"}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              {user?.role === "ROLE_ADMIN" ? "Sales Director" : "Account Lead"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
