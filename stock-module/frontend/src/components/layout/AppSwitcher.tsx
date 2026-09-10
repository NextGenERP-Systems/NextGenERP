"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  ShoppingBag,
  Users,
  ChevronDown,
  GitMerge,
  Package,
} from "lucide-react";

interface AppSwitcherProps {
  currentModule?: "sales" | "hrm" | "workflow" | "stock";
}

export function AppSwitcher({ currentModule = "stock" }: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const apps = [
    {
      id: "stock",
      name: "Stock & Inventory 360",
      description: "Double-Entry Ledger, Bins, FIFO/Avg, Serials & Bins",
      icon: Package,
      href: "/stock",
      color: "bg-blue-600",
      badge: "Core Supply",
      active: currentModule === "stock",
    },
    {
      id: "sales",
      name: "Sales & CRM 360",
      description: "Quotations, Orders, Commissions & POS",
      icon: ShoppingBag,
      href: "http://localhost:3000/sales",
      color: "bg-emerald-500",
      badge: "Commercial",
      active: currentModule === "sales",
    },
    {
      id: "workflow",
      name: "Workflow & Doc Automation",
      description: "State Machines, Approvals & Templates",
      icon: GitMerge,
      href: "http://localhost:3000/workflows",
      color: "bg-amber-500",
      badge: "Automation",
      active: currentModule === "workflow",
    },
    {
      id: "hrm",
      name: "HRM & People Ops",
      description: "Employee 360, Payroll Engine & Claims",
      icon: Users,
      href: "http://localhost:3001/hrm",
      color: "bg-indigo-500",
      badge: "People",
      active: currentModule === "hrm",
    },
  ];

  const currentApp = apps.find((app) => app.id === currentModule) || apps[0];
  const CurrentIcon = currentApp.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group shadow-sm bg-white"
      >
        <div className={`w-8 h-8 rounded-lg ${currentApp.color} flex items-center justify-center text-white shadow-sm font-semibold text-sm`}>
          <CurrentIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-800 tracking-tight">{currentApp.name}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {currentApp.badge}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">NextGen Enterprise</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">NextGen ERP Modules</p>
          </div>
          <div className="py-1 space-y-1">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <a
                  key={app.id}
                  href={app.href}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    app.active ? "bg-blue-50/80 border border-blue-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">{app.name}</p>
                      {app.active && <span className="text-[10px] font-medium text-blue-600">Active</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{app.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
