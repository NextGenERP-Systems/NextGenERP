"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Landmark,
  Factory,
  UserCheck,
  Layers,
  ChevronDown,
  Truck,
  Receipt,
  CreditCard,
  Target,
  Tag,
  BarChart3,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [salesExpanded, setSalesExpanded] = useState(true);

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  const SELLING_SUB_NAV = [
    { title: "Dashboard & KPIs", href: "/sales", icon: TrendingUp },
    { title: "Quotations", href: "/sales/quotations", icon: FileText },
    { title: "Sales Orders", href: "/sales/orders", icon: ShoppingBag },
    { title: "Customer 360", href: "/sales/customers", icon: Users },
    { title: "Delivery Notes", href: "/sales/delivery-notes", icon: Truck },
    { title: "Sales Invoices", href: "/sales/invoices", icon: Receipt },
    { title: "Payments & Receipts", href: "/sales/payments", icon: CreditCard },
    { title: "CRM & Pipeline", href: "/sales/crm", icon: Target },
    { title: "Pricing & Coupons", href: "/sales/pricing-rules", icon: Tag },
    { title: "Reports & Analysis", href: "/sales/reports", icon: BarChart3 },
  ];

  const OTHER_MODULES = [
    { title: "Buying (Purchase)", icon: ShoppingBag, badge: "Upcoming" },
    { title: "Stock (Inventory)", icon: Package, badge: "Upcoming" },
    { title: "Accounts & GL", icon: Landmark, badge: "Upcoming" },
    { title: "Manufacturing", icon: Factory, badge: "Upcoming" },
    { title: "HR & Payroll", icon: UserCheck, badge: "Upcoming" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm">
      <div>
        {/* Brand Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200 gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              NextGen ERP
              <span className="text-[9px] font-medium uppercase bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100">v2</span>
            </div>
            <div className="text-[11px] text-slate-400">Modular ERP Suite</div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-2 py-3 overflow-y-auto max-h-[calc(100vh-140px)] space-y-4">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase px-2 mb-2">
              Core Modules
            </div>

            {/* Sales Parent Accordion Tab */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSalesExpanded(!salesExpanded)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group",
                  pathname.startsWith("/sales")
                    ? "bg-blue-50/80 text-blue-700 font-bold border border-blue-100/60"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1 rounded-md",
                    pathname.startsWith("/sales") ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                  )}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs">Sales (Selling Suite)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                    10
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                      salesExpanded && "transform rotate-180 text-blue-600"
                    )}
                  />
                </div>
              </button>

              {/* Sub-tabs under Sales */}
              {salesExpanded && (
                <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-blue-100 ml-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  {SELLING_SUB_NAV.map((item) => {
                    const isItemActive = pathname === item.href || (item.href !== "/sales" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all group",
                          isItemActive
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-3 w-3 flex-shrink-0",
                            isItemActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Other Modules */}
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase px-2 mb-2">
              Other ERP Modules
            </div>

            <nav className="space-y-0.5">
              {OTHER_MODULES.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.title}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-400 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                      <span>{mod.title}</span>
                    </div>
                    {mod.badge && (
                      <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="p-3 m-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            PostgreSQL 16
          </span>
          <span className="text-[10px] text-slate-500 font-medium">GCP Free</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Spring Boot multi-module backend
        </div>
      </div>
    </aside>
  );
}

