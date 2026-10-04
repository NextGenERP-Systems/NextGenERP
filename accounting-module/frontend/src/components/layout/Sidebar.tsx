"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Building2,
  Laptop,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Search,
  Users,
  ShoppingBag,
  GitMerge,
  Package,
  Boxes,
  Factory,
  Check,
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
  defaultHref: string;
}

const ALL_WORKSPACES: WorkspaceDef[] = [
  {
    id: "accounts",
    name: "Finance & Accounts",
    category: "finance",
    subtitle: "Chart of Accounts & GL",
    icon: Landmark,
    defaultHref: "/accounts",
  },
  {
    id: "hrm",
    name: "Human Resources",
    category: "operations",
    subtitle: "Employees, Attendance & Payroll",
    icon: Users,
    defaultHref: "http://localhost:3001/hrm",
  },
  {
    id: "selling",
    name: "Selling",
    category: "core",
    subtitle: "Orders, POS & Quotations",
    icon: ShoppingBag,
    defaultHref: "http://localhost:3000/sales",
  },
  {
    id: "workflows",
    name: "Workflow Studio",
    category: "core",
    subtitle: "State Machines & Approvals",
    icon: GitMerge,
    defaultHref: "http://localhost:3000/workflows",
  },
  {
    id: "projects",
    name: "Projects & Tasks",
    category: "operations",
    subtitle: "Timesheets & Sprints",
    icon: Package,
    defaultHref: "http://localhost:3000/projects",
  },
  {
    id: "buying",
    name: "Purchasing & Supply",
    category: "operations",
    subtitle: "Purchase Orders & Vendors",
    icon: Receipt,
    defaultHref: "http://localhost:3000/purchasing",
  },
  {
    id: "stock",
    name: "Inventory & Stock",
    category: "operations",
    subtitle: "Warehouses & Valuation",
    icon: Boxes,
    defaultHref: "http://localhost:3000/inventory",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    category: "operations",
    subtitle: "BOM, Work Orders & Routing",
    icon: Factory,
    defaultHref: "http://localhost:3000/manufacturing",
  },
  {
    id: "settings",
    name: "Desk Settings",
    category: "admin",
    subtitle: "Users, Roles & Domain",
    icon: Settings,
    defaultHref: "http://localhost:3000/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
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

  const handleWorkspaceClick = (ws: WorkspaceDef) => {
    setIsSwitcherOpen(false);
    if (ws.defaultHref.startsWith("http")) {
      window.location.href = ws.defaultHref;
    } else {
      router.push(ws.defaultHref);
    }
  };

  const ACCOUNTS_NAV_ITEMS = [
    { title: "Dashboard", href: "/accounts", icon: LayoutDashboard },
    { title: "Chart of Accounts", href: "/accounts/chart-of-accounts", icon: FolderTree },
    { title: "General Ledger", href: "/accounts/general-ledger", icon: Layers },
    { title: "Journal Entries", href: "/accounts/journal-entries", icon: BookOpen },
    { title: "Sales Invoices (AR)", href: "/accounts/sales-invoices", icon: FileText },
    { title: "Purchase Invoices (AP)", href: "/accounts/purchase-invoices", icon: Receipt },
    { title: "Payment Entries", href: "/accounts/payments", icon: ArrowLeftRight },
    { title: "Banking & Cash", href: "/accounts/banking", icon: Landmark },
    { title: "Fixed Assets", href: "/accounts/assets", icon: Laptop },
    { title: "Tax & GST Filing", href: "/accounts/taxes", icon: FileSpreadsheet },
    { title: "Cost Centers", href: "/accounts/cost-centers", icon: Building2 },
    { title: "Financial Statements", href: "/accounts/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1 relative" ref={switcherRef}>
        {/* Module Header Banner & Workspace Switcher Trigger */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="w-full flex items-center justify-between text-left p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
                <CurrentIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[13px] text-gray-900 leading-tight truncate">
                  {currentWorkspace.name}
                </span>
                <span className="text-[11px] text-gray-500 leading-tight truncate">
                  Enterprise Ledger
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-150 flex-shrink-0",
                isSwitcherOpen && "transform rotate-180 text-gray-700"
              )}
            />
          </button>
        </div>

        {/* Global Workspace Dropdown Switcher */}
        {isSwitcherOpen && (
          <div className="absolute top-[57px] left-2 right-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[460px] animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Switch workspace..."
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  autoFocus
                />
              </div>
            </div>

            {/* Workspaces List */}
            <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-gray-50">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 block">
                  All Systems
                </span>
                {filteredWorkspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isCurrent = ws.id === currentWorkspace.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleWorkspaceClick(ws)}
                      className={cn(
                        "w-full flex items-center justify-between p-1.5 rounded-md text-left transition-colors",
                        isCurrent
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate">{ws.name}</span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {ws.subtitle}
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-3.5 h-3.5 text-zinc-900 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Sidebar Items */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          <div className="space-y-0.5">
            {ACCOUNTS_NAV_ITEMS.map((item) => {
              const isItemActive =
                pathname === item.href ||
                (item.href !== "/accounts" && pathname.startsWith(item.href));
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

      {/* User Profile Bar at bottom matching ERPNext Desk */}
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
