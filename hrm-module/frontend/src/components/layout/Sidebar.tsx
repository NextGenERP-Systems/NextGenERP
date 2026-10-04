"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Home,
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Banknote,
  Briefcase,
  Award,
  Receipt,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  X,
  Building2,
  Clock,
  Sparkles,
  ShoppingBag,
  Landmark,
  FolderKanban,
  Factory,
  Boxes,
  ShoppingCart,
  GitMerge,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface WorkspaceDef {
  id: string;
  name: string;
  category: "core" | "operations" | "finance" | "admin";
  subtitle: string;
  icon: any;
  colorBg: string;
  colorText: string;
  defaultHref: string;
}

const ALL_WORKSPACES: WorkspaceDef[] = [
  {
    id: "hrm",
    name: "Human Resources",
    category: "operations",
    subtitle: "Employees, Attendance & Payroll",
    icon: Users,
    colorBg: "bg-indigo-100/90",
    colorText: "text-indigo-600",
    defaultHref: "/hrm",
  },
  {
    id: "selling",
    name: "Selling",
    category: "core",
    subtitle: "Orders, POS & Quotations",
    icon: ShoppingBag,
    colorBg: "bg-blue-100/90",
    colorText: "text-blue-600",
    defaultHref: "http://localhost:3000/sales",
  },
  {
    id: "workflows",
    name: "Workflow Studio",
    category: "core",
    subtitle: "State Machines & Approvals",
    icon: GitMerge,
    colorBg: "bg-amber-100/90",
    colorText: "text-amber-600",
    defaultHref: "http://localhost:3000/workflows",
  },
  {
    id: "accounts",
    name: "Finance & Accounts",
    category: "finance",
    subtitle: "Chart of Accounts & GL",
    icon: Landmark,
    colorBg: "bg-emerald-100/90",
    colorText: "text-emerald-600",
    defaultHref: "http://localhost:3004/accounts",
  },
  {
    id: "projects",
    name: "Projects & Tasks",
    category: "operations",
    subtitle: "Kanban, Sprints & Timesheets",
    icon: FolderKanban,
    colorBg: "bg-violet-100/90",
    colorText: "text-violet-600",
    defaultHref: "http://localhost:3000/projects",
  },
  {
    id: "mrp",
    name: "Manufacturing MRP",
    category: "operations",
    subtitle: "Work Orders, BOMs & Operations",
    icon: Factory,
    colorBg: "bg-rose-100/90",
    colorText: "text-rose-600",
    defaultHref: "http://localhost:3000/mrp",
  },
  {
    id: "stock",
    name: "Stock & Inventory",
    category: "operations",
    subtitle: "Items, Batches & Warehouse",
    icon: Boxes,
    colorBg: "bg-teal-100/90",
    colorText: "text-teal-600",
    defaultHref: "http://localhost:3000/stock",
  },
  {
    id: "buying",
    name: "Buying & Procurement",
    category: "operations",
    subtitle: "Purchase Orders & 3-Way Match",
    icon: ShoppingCart,
    colorBg: "bg-amber-100/90",
    colorText: "text-amber-700",
    defaultHref: "http://localhost:3000/sales/buying",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Workspace Switcher State
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher on click outside or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSwitcherOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  const currentWorkspace = ALL_WORKSPACES[0];
  const CurrentIcon = currentWorkspace.icon;

  // Filtered workspaces for search
  const filteredWorkspaces = ALL_WORKSPACES.filter(
    (w) =>
      w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
      w.subtitle.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const coreWorkspaces = filteredWorkspaces.filter((w) => w.category === "core");
  const opsWorkspaces = filteredWorkspaces.filter(
    (w) => w.category === "operations" || w.category === "finance"
  );

  const handleWorkspaceClick = (ws: WorkspaceDef) => {
    setIsSwitcherOpen(false);
    if (ws.defaultHref.startsWith("http")) {
      window.location.href = ws.defaultHref;
    } else {
      router.push(ws.defaultHref);
    }
  };

  const HRM_STANDARD_ITEMS = [
    { title: "Dashboard", href: "/hrm", icon: LayoutDashboard },
    { title: "Employees (360)", href: "/hrm/employees", icon: Users },
    { title: "Attendance & Shifts", href: "/hrm/attendance", icon: CalendarCheck },
    { title: "Leaves & Holidays", href: "/hrm/leaves", icon: CalendarDays },
    { title: "Payroll & Benefits", href: "/hrm/payroll", icon: Banknote },
    { title: "Performance & Appraisals", href: "/hrm/appraisals", icon: Award },
    { title: "Recruitment", href: "/hrm/recruitment", icon: Briefcase },
    { title: "Expense Claims", href: "/hrm/expense-claims", icon: Receipt },
    { title: "Reports & Analytics", href: "/hrm/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1 relative" ref={switcherRef}>
        {/* Module Header Banner & Workspace Switcher Trigger */}
        <div className="h-12 px-2.5 border-b border-gray-200 bg-[#f8f8f8] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsSwitcherOpen(!isSwitcherOpen);
              setWorkspaceSearch("");
            }}
            className="flex items-center gap-2 px-1.5 py-1 w-full rounded hover:bg-gray-200/60 transition-colors text-left group"
            title="Switch Workspace / Module"
          >
            <div
              className={`w-7 h-7 rounded ${currentWorkspace.colorBg} flex items-center justify-center ${currentWorkspace.colorText} shadow-2xs flex-shrink-0`}
            >
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                {currentWorkspace.name}
              </div>
              <div className="text-[10px] text-gray-500 font-medium leading-tight truncate">
                {currentWorkspace.subtitle}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 flex-shrink-0",
                isSwitcherOpen && "rotate-180 text-gray-800"
              )}
            />
          </button>
        </div>

        {/* Dropdown Workspace Switcher Popover */}
        {isSwitcherOpen && (
          <div className="absolute top-[49px] left-2 right-2 w-[calc(100%-16px)] bg-white border border-gray-200/90 shadow-xl rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[480px]">
            {/* Search Box */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={workspaceSearch}
                onChange={(e) => setWorkspaceSearch(e.target.value)}
                placeholder="Search Workspaces..."
                className="w-full pl-8 pr-6 py-1.5 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                autoFocus
              />
              {workspaceSearch && (
                <button
                  onClick={() => setWorkspaceSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Scrollable Workspaces List */}
            <div className="overflow-y-auto space-y-2 pr-0.5 flex-1 max-h-[380px]">
              {opsWorkspaces.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    HR & Operations
                  </div>
                  <div className="space-y-0.5">
                    {opsWorkspaces.map((ws) => {
                      const WsIcon = ws.icon;
                      const isActive = ws.id === "hrm";
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => handleWorkspaceClick(ws)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all",
                            isActive
                              ? "bg-gray-100 text-gray-900 font-semibold"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                              ws.colorBg,
                              ws.colorText
                            )}
                          >
                            <WsIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium leading-tight truncate">
                              {ws.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal leading-tight truncate">
                              {ws.subtitle}
                            </div>
                          </div>
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {coreWorkspaces.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Core Workspaces
                  </div>
                  <div className="space-y-0.5">
                    {coreWorkspaces.map((ws) => {
                      const WsIcon = ws.icon;
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => handleWorkspaceClick(ws)}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                              ws.colorBg,
                              ws.colorText
                            )}
                          >
                            <WsIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium leading-tight truncate">
                              {ws.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal leading-tight truncate">
                              {ws.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Switcher Footer */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-2 flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <span>NextGen ERP Desk v15</span>
              <span className="font-mono text-gray-400">Esc to close</span>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 text-[13px]">
          {/* Top Standard Navigation Items */}
          <div className="space-y-0.5">
            {HRM_STANDARD_ITEMS.map((item) => {
              const isItemActive =
                pathname === item.href ||
                (item.href !== "/hrm" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                    isItemActive
                      ? "bg-gray-200/90 text-gray-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </div>

      {/* User Profile Bar at bottom matching ERPNext */}
      <div className="p-2.5 border-t border-gray-200 bg-[#f8f8f8] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
          A
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-gray-900 leading-tight truncate">
            Administrator
          </span>
          <span className="text-[10px] text-gray-500 leading-tight truncate">
            admin@example.com
          </span>
        </div>
      </div>
    </aside>
  );
}
