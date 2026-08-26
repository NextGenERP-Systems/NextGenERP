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
  CircleDot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ModuleNav {
  title: string;
  href: string;
  icon: any;
  active: boolean;
  badge?: string;
  subItems?: { title: string; tab: string }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [salesExpanded, setSalesExpanded] = useState(true);

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  const ERP_MODULES: ModuleNav[] = [
    {
      title: "Sales (Selling)",
      href: "/sales",
      icon: TrendingUp,
      active: true,
      subItems: [
        { title: "Overview & KPIs", tab: "overview" },
        { title: "Quotations", tab: "quotations" },
        { title: "Sales Orders", tab: "orders" },
        { title: "Customer 360", tab: "customers" },
        { title: "Commissions", tab: "analytics" },
      ],
    },
    {
      title: "Buying (Purchase)",
      href: "#",
      icon: ShoppingBag,
      active: false,
      badge: "Upcoming",
    },
    {
      title: "Stock (Inventory)",
      href: "#",
      icon: Package,
      active: false,
      badge: "Upcoming",
    },
    {
      title: "Accounts (Finance)",
      href: "#",
      icon: Landmark,
      active: false,
      badge: "Upcoming",
    },
    {
      title: "Manufacturing",
      href: "#",
      icon: Factory,
      active: false,
      badge: "Upcoming",
    },
    {
      title: "HR & Payroll",
      href: "#",
      icon: UserCheck,
      active: false,
      badge: "Upcoming",
    },
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
        <div className="px-2 py-3">
          <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase px-2 mb-2">
            Modules
          </div>

          <nav className="space-y-1">
            {ERP_MODULES.map((mod) => {
              const isSales = mod.title.startsWith("Sales");
              const isModuleActive = pathname.startsWith("/sales") && isSales;
              const Icon = mod.icon;

              if (isSales) {
                return (
                  <div key={mod.title} className="space-y-0.5">
                    <Link
                      href="/sales"
                      onClick={() => setSalesExpanded(!salesExpanded)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm font-medium transition-all duration-150 group",
                        isModuleActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isModuleActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span>{mod.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-300 transition-transform duration-200",
                          salesExpanded ? "rotate-180 text-blue-400" : ""
                        )}
                      />
                    </Link>

                    {salesExpanded && (
                      <div className="ml-6 pl-3 border-l border-slate-200 space-y-0.5 mt-0.5">
                        {mod.subItems?.map((sub) => (
                          <Link
                            key={sub.tab}
                            href={`/sales?tab=${sub.tab}`}
                            className="block px-2 py-1.5 rounded text-xs text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={mod.title}
                  className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-slate-400 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    <span className="text-sm text-slate-400">{mod.title}</span>
                  </div>
                  {mod.badge && (
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                      {mod.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
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

