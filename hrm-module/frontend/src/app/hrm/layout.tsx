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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen flex bg-slate-100 text-slate-900 antialiased">
      {/* Apple iOS Frosted Liquid Glass Sidebar */}
      <aside className="w-64 border-r border-white/60 bg-white/70 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[4px_0_24px_-4px_rgba(15,23,42,0.04)] z-30 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 border-b border-white/60 flex items-center px-6 gap-3">
          <div className="w-9 h-9 rounded-2xl liquid-btn-primary flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm text-slate-900">
              NextGen ERP
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/60 text-indigo-700 border border-white shadow-2xs">
                HRM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">People & Payroll Core</p>
          </div>
        </div>

        {/* Nav Links (Liquid Glass Capsule Pills) */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Domain Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/hrm" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all duration-200 group relative",
                  isActive
                    ? "liquid-nav-active"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-semibold"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indigo-700" : "text-slate-400 group-hover:text-slate-700")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
              </Link>
            );
          })}
        </nav>

        {/* System Health / Footer */}
        <div className="p-4 border-t border-white/60 bg-white/30">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
              HR Engine Live
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-bold">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Apple iOS Frosted Liquid Glass Top Header Bar */}
        <header className="h-16 border-b border-white/60 bg-white/60 backdrop-blur-2xl px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees, designations, slip IDs..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white/70 border border-white/80 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-inner transition-all backdrop-blur-md font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="liquid-btn-glass p-2.5 rounded-full text-slate-600 hover:text-slate-900 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white absolute top-1 right-1" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl liquid-btn-primary flex items-center justify-center font-bold text-xs text-white shadow-xs">
                HR
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900">HR Administrator</div>
                <div className="text-[11px] text-slate-500 font-semibold">NextGen Enterprise HQ</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page View */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
