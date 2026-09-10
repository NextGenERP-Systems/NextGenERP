"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  FileText,
  Receipt,
  ArrowLeftRight,
  Landmark,
  PieChart,
  BarChart3,
  ChevronDown,
  Building2,
  Laptop,
  FileSpreadsheet,
} from "lucide-react";
import { AppSwitcher } from "@/components/layout/AppSwitcher";

const navItems = [
  { name: "Overview", href: "/accounts", icon: LayoutDashboard },
  { name: "Chart of Accounts", href: "/accounts/chart-of-accounts", icon: FolderTree },
  { name: "Journal Entries", href: "/accounts/journal-entries", icon: BookOpen },
  { name: "Sales Invoices (AR)", href: "/accounts/sales-invoices", icon: FileText },
  { name: "Purchase Invoices (AP)", href: "/accounts/purchase-invoices", icon: Receipt },
  { name: "Payment Entries", href: "/accounts/payments", icon: ArrowLeftRight },
  { name: "Banking & Accounts", href: "/accounts/banking", icon: Landmark },
  { name: "Fixed Assets", href: "/accounts/assets", icon: Laptop },
  { name: "Tax & GST Filing", href: "/accounts/taxes", icon: FileSpreadsheet },
  { name: "Cost Centers", href: "/accounts/cost-centers", icon: Building2 },
  { name: "Financial Statements", href: "/accounts/reports", icon: BarChart3 },
];

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      {/* ERPNext Reference Translucent Sidebar */}
      <aside className="w-64 border-r border-slate-200/80 bg-white/60 backdrop-blur-2xl p-4 flex flex-col justify-between fixed inset-y-0 z-30 shadow-xs">
        <div>
          {/* Header matching ERPNext Reference */}
          <div className="flex items-center justify-between px-3 py-3 rounded-2xl mb-4 bg-white/40 border border-white/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/70 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 backdrop-blur-md">
                <PieChart className="w-5 h-5 text-slate-800" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                  Accounting
                </span>
                <span className="text-[11px] font-bold text-slate-500 mt-0.5">ERPNext</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "liquid-nav-active shadow-xs"
                      : "liquid-nav-inactive"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Unified App Switcher at Sidebar Footer */}
        <div className="pt-3 border-t border-slate-200/80">
          <AppSwitcher currentModule="accounting" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen p-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
