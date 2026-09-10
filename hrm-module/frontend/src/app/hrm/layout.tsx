"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  Briefcase,
  Award,
  Receipt,
  BarChart3,
  LayoutDashboard,
  Building2,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSwitcher } from "@/components/layout/AppSwitcher";

const NAV_ITEMS = [
  { label: "Overview", href: "/hrm", icon: LayoutDashboard },
  { label: "Employees (360)", href: "/hrm/employees", icon: Users },
  { label: "Attendance & Shifts", href: "/hrm/attendance", icon: CalendarCheck },
  { label: "Leave Engine", href: "/hrm/leaves", icon: CalendarDays },
  { label: "Payroll & Slips", href: "/hrm/payroll", icon: Banknote },
  { label: "Recruitment", href: "/hrm/recruitment", icon: Briefcase },
  { label: "Appraisals & KRAs", href: "/hrm/appraisals", icon: Award },
  { label: "Expense Claims", href: "/hrm/expense-claims", icon: Receipt },
  { label: "Reports & Analytics", href: "/hrm/reports", icon: BarChart3 },
];

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-100/90 text-slate-900 antialiased">
      {/* Translucent Liquid Glass Sidebar (ERPNext Style) */}
      <aside className="w-64 border-r border-white/50 bg-white/40 backdrop-blur-2xl flex flex-col flex-shrink-0 z-30 sticky top-0 h-screen shadow-[4px_0_24px_-4px_rgba(15,23,42,0.03)]">
        {/* Brand Header: Matches reference layout */}
        <div className="p-4 border-b border-white/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-slate-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
                Human Resources
              </div>
              <p className="text-xs text-slate-500 font-medium">ERPNext</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/hrm" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 text-xs transition-all duration-150",
                  isActive
                    ? "liquid-nav-active"
                    : "liquid-nav-inactive"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Health / Footer */}
        <div className="p-4 border-t border-white/40 bg-white/20">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
              HR Engine Live
            </span>
            <span className="text-[11px] text-slate-400 font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/50 bg-white/40 backdrop-blur-2xl px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees, designations, slip IDs..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white/50 border border-white/70 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 backdrop-blur-md font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AppSwitcher currentModule="hrm" />

            <div className="h-5 w-px bg-slate-300/60" />

            <button className="liquid-btn-glass p-2 rounded-full text-slate-600 hover:text-slate-900 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 absolute top-1 right-1" />
            </button>

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center font-bold text-xs text-slate-800">
                HR
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">HR Administrator</div>
                <div className="text-[10px] text-slate-500 font-medium">NextGen Enterprise HQ</div>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
