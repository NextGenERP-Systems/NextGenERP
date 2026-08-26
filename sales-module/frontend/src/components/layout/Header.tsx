"use client";

import { useState } from "react";
import { Search, Plus, ShieldCheck, RefreshCw, LogOut, User, KeyRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const roleLabel =
    user?.role === "ROLE_ADMIN"
      ? "Admin"
      : user?.role === "ROLE_SALES_MANAGER"
      ? "Manager"
      : "Sales Rep";

  return (
    <header className="h-16 glass-header sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations, orders, customers, or items (Ctrl+K)..."
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Action Controls & User Meta */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
          </button>
        )}

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>NextGen Corp</span>
        </div>

        <Link
          href="/sales/quotations"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Quotation</span>
        </Link>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.fullName || "Administrator"}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">{roleLabel}</div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-800 truncate">{user?.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                    <KeyRound className="h-2.5 w-2.5" /> {roleLabel}
                  </span>
                </div>
              </div>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Switch User / Role</span>
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
