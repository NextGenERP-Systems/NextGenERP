"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  Briefcase,
  GitPullRequest,
  ChevronDown,
  ExternalLink,
  Check,
  Sparkles,
} from "lucide-react";

interface AppSwitcherProps {
  currentModule: "sales" | "hrm" | "accounting" | "projects" | "workflow";
}

export function AppSwitcher({ currentModule }: AppSwitcherProps) {
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
      id: "accounting",
      name: "Finance & Accounts",
      description: "Chart of Accounts, General Ledger, Invoices & Statements",
      icon: CreditCard,
      href: currentModule === "accounting" ? "/accounts" : "http://localhost:3004/accounts",
      color: "bg-amber-600",
      badge: "Core Finance",
      active: currentModule === "accounting",
    },
    {
      id: "sales",
      name: "Sales & CRM 360",
      description: "Quotations, Sales Orders, Commissions & POS",
      icon: ShoppingBag,
      href: currentModule === "sales" ? "/sales" : "http://localhost:3000/sales",
      color: "bg-emerald-500",
      badge: "Commercial",
      active: currentModule === "sales",
    },
    {
      id: "hrm",
      name: "HRM & People Ops",
      description: "Employee 360, Payroll Engine, Appraisals & Claims",
      icon: Users,
      href: currentModule === "hrm" ? "/hrm" : "http://localhost:3001/hrm",
      color: "bg-indigo-500",
      badge: "Enterprise HR",
      active: currentModule === "hrm",
    },
    {
      id: "projects",
      name: "Projects & Agile",
      description: "Sprint Planning, Gantt, Milestones & Timesheets",
      icon: Briefcase,
      href: currentModule === "projects" ? "/projects" : "http://localhost:3003/projects",
      color: "bg-purple-500",
      badge: "Delivery",
      active: currentModule === "projects",
    },
    {
      id: "workflow",
      name: "Workflow & Approvals",
      description: "BPMN Process Engines, Form Builders & Automations",
      icon: GitPullRequest,
      href: currentModule === "workflow" ? "/workflow" : "http://localhost:3002/workflow",
      color: "bg-cyan-500",
      badge: "Automation",
      active: currentModule === "workflow",
    },
  ];

  const activeApp = apps.find((a) => a.active) || apps[0];
  const Icon = activeApp.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="liquid-btn-glass text-xs font-bold text-slate-800 gap-2 px-3 py-1.5"
      >
        <div className={`w-5 h-5 rounded-md ${activeApp.color} flex items-center justify-center text-white shadow-xs`}>
          <Icon className="w-3 h-3" />
        </div>
        <span className="font-bold tracking-tight text-slate-900">{activeApp.name}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 text-amber-800 border border-amber-200">
          {activeApp.badge}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white/90 border border-white/60 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              <span>NextGen ERP Modules</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <Sparkles className="w-2.5 h-2.5" /> Integrated Suite
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {apps.map((app) => {
              const AppIcon = app.icon;
              return (
                <a
                  key={app.id}
                  href={app.href}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    app.active
                      ? "bg-amber-50/70 border border-amber-200/80 shadow-2xs"
                      : "hover:bg-slate-50/80 text-slate-700 hover:text-slate-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`w-8 h-8 rounded-xl ${app.color} flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-0.5`}>
                    <AppIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{app.name}</span>
                      {app.active ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                      {app.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60 rounded-b-xl text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Unified Master & Live GL Sync</span>
            <span className="font-mono text-[10px] text-slate-400 font-bold">ERP Core v2.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
