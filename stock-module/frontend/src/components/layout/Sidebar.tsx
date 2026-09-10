"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Warehouse,
  ArrowLeftRight,
  BookOpenCheck,
  QrCode,
  ClipboardCheck,
  RefreshCw,
  TrendingUp,
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  ShoppingBag,
  GitMerge,
  Users,
  Building2,
  FileText,
  Sliders,
  FolderKanban,
  Sparkles,
  Tag,
  Percent,
  X,
  Home,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface WorkspaceDef {
  id: string;
  name: string;
  category: "core" | "operations";
  subtitle: string;
  icon: any;
  colorBg: string;
  colorText: string;
  defaultHref: string;
}

const ALL_WORKSPACES: WorkspaceDef[] = [
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
    id: "stock",
    name: "Stock & Inventory",
    category: "operations",
    subtitle: "Items, Batches & Warehouse",
    icon: Boxes,
    colorBg: "bg-teal-100/90",
    colorText: "text-teal-600",
    defaultHref: "/stock",
  },
  {
    id: "hrm",
    name: "HRM & People Ops",
    category: "operations",
    subtitle: "Employees & Payroll 360",
    icon: Users,
    colorBg: "bg-indigo-100/90",
    colorText: "text-indigo-600",
    defaultHref: "http://localhost:3001/hrm",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const switcherRef = useRef<HTMLDivElement>(null);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    itemsAndPricing: true,
    stockTransactions: true,
    warehouses: false,
    qualityTraceability: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentWorkspace = ALL_WORKSPACES.find((w) => w.id === "stock") || ALL_WORKSPACES[2];
  const CurrentIcon = currentWorkspace.icon;

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

  const filteredWorkspaces = ALL_WORKSPACES.filter(
    (w) =>
      w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
      w.subtitle.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const coreWorkspaces = filteredWorkspaces.filter((w) => w.category === "core");
  const opsWorkspaces = filteredWorkspaces.filter((w) => w.category === "operations");

  const ITEMS_PRICING_SUBITEMS = [
    { title: "Stock Items & Bins", href: "/stock/items" },
    { title: "Sales Catalog & Prices", href: "http://localhost:3000/sales/items" },
    { title: "Item Groups & Hierarchy", href: "http://localhost:3000/sales/items?tab=groups" },
    { title: "Price Lists", href: "http://localhost:3000/sales/items?tab=prices" },
    { title: "Product Bundles", href: "http://localhost:3000/sales/items?tab=bundles" },
  ];

  const TRANSACTIONS_SUBITEMS = [
    { title: "Stock Entries (Universal)", href: "/stock/entries" },
    { title: "Stock Ledger Entries (SLE)", href: "/stock/ledger" },
    { title: "Delivery Notes (Sales)", href: "http://localhost:3000/sales/delivery-notes" },
  ];

  const WAREHOUSE_SUBITEMS = [
    { title: "Warehouses Tree", href: "/stock/warehouses" },
    { title: "Real-time Bins Cache", href: "/stock/warehouses" },
  ];

  const QUALITY_SUBITEMS = [
    { title: "Serials & Batches", href: "/stock/serial-batch" },
    { title: "Quality Inspections", href: "/stock/quality" },
    { title: "Stock Reconciliation", href: "/stock/reconciliation" },
  ];

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e] font-sans">
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
                ERPNext
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

        {/* ERPNext Dropdown Workspace Switcher Popover */}
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
                className="w-full pl-8 pr-6 py-1.5 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
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
              {/* Core Workspaces */}
              {coreWorkspaces.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Core Workspaces
                  </div>
                  <div className="space-y-0.5">
                    {coreWorkspaces.map((ws) => {
                      const WsIcon = ws.icon;
                      const isActive = ws.id === "stock";
                      return (
                        <a
                          key={ws.id}
                          href={ws.defaultHref}
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
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operations & Finance */}
              {opsWorkspaces.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Operations & Finance
                  </div>
                  <div className="space-y-0.5">
                    {opsWorkspaces.map((ws) => {
                      const WsIcon = ws.icon;
                      const isActive = ws.id === "stock";
                      return (
                        <a
                          key={ws.id}
                          href={ws.defaultHref}
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
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Switcher Footer */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-2 flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <span>ERPNext Desk v15</span>
              <span className="font-mono text-gray-400">Esc to close</span>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 text-[13px]">
          {/* Top Standard Navigation Items */}
          <div className="space-y-0.5">
            <Link
              href="/stock"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                pathname === "/stock"
                  ? "bg-gray-200/90 text-gray-900 font-semibold"
                  : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
              )}
            >
              <Home className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">Stock Home</span>
            </Link>

            <Link
              href="/stock/ledger"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                pathname === "/stock/ledger"
                  ? "bg-gray-200/90 text-gray-900 font-semibold"
                  : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
              )}
            >
              <BookOpenCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span className="truncate">Stock Ledger (SLE)</span>
            </Link>
          </div>

          <div className="h-[1px] bg-gray-200/70 mx-1" />

          {/* Items & Pricing Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("itemsAndPricing")}
              className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
            >
              <span>Items & Pricing</span>
              {openSections.itemsAndPricing ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {openSections.itemsAndPricing && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                {ITEMS_PRICING_SUBITEMS.map((sub) => (
                  <a
                    key={sub.title}
                    href={sub.href}
                    className={cn(
                      "block px-2 py-1 rounded transition-colors truncate",
                      pathname === sub.href
                        ? "bg-teal-100/80 text-teal-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    )}
                  >
                    {sub.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stock Transactions Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("stockTransactions")}
              className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
            >
              <span>Stock Transactions</span>
              {openSections.stockTransactions ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {openSections.stockTransactions && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                {TRANSACTIONS_SUBITEMS.map((sub) => (
                  <a
                    key={sub.title}
                    href={sub.href}
                    className={cn(
                      "block px-2 py-1 rounded transition-colors truncate",
                      pathname === sub.href
                        ? "bg-teal-100/80 text-teal-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    )}
                  >
                    {sub.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Warehouses & Bins Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("warehouses")}
              className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
            >
              <span>Warehouses & Bins</span>
              {openSections.warehouses ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {openSections.warehouses && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                {WAREHOUSE_SUBITEMS.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    className={cn(
                      "block px-2 py-1 rounded transition-colors truncate",
                      pathname === sub.href
                        ? "bg-teal-100/80 text-teal-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    )}
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quality & Traceability Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("qualityTraceability")}
              className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
            >
              <span>Quality & Traceability</span>
              {openSections.qualityTraceability ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {openSections.qualityTraceability && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                {QUALITY_SUBITEMS.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    className={cn(
                      "block px-2 py-1 rounded transition-colors truncate",
                      pathname === sub.href
                        ? "bg-teal-100/80 text-teal-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    )}
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-gray-200/70 mx-1 my-1.5" />
          <div className="px-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Quick Jump
          </div>
          <a
            href="http://localhost:3000/sales"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-200/60 hover:text-gray-900 transition-colors text-[13px]"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">Selling Workspace</span>
          </a>
          <a
            href="http://localhost:3000/workflows"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-200/60 hover:text-gray-900 transition-colors text-[13px]"
          >
            <GitMerge className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="truncate">Workflow Studio</span>
          </a>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-2 border-t border-gray-200 bg-[#f8f8f8] flex items-center justify-between text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5 px-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-gray-700">Stock Perpetual Engine</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400 font-semibold">v15.2</span>
      </div>
    </aside>
  );
}
