"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Home,
  LayoutDashboard,
  FileText,
  Receipt,
  Monitor,
  ChevronDown,
  ChevronRight,
  Package,
  Sliders,
  BarChart3,
  User,
  Settings,
  Tag,
  Users,
  MapPin,
  Mail,
  Shield,
  Layers,
  HelpCircle,
  FileCheck,
  CreditCard,
  Building2,
  PieChart,
  Percent,
  GitMerge,
  Search,
  Check,
  ShoppingCart,
  Boxes,
  UserCheck,
  FolderKanban,
  Sparkles,
  ArrowRight,
  X,
  Landmark,
  Factory,
  Truck,
  Wrench,
  Briefcase,
  Target,
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
    id: "selling",
    name: "Selling",
    category: "core",
    subtitle: "Orders, POS & Quotations",
    icon: ShoppingBag,
    colorBg: "bg-blue-100/90",
    colorText: "text-blue-600",
    defaultHref: "/sales",
  },
  {
    id: "workflows",
    name: "Workflow Studio",
    category: "core",
    subtitle: "State Machines & Approvals",
    icon: GitMerge,
    colorBg: "bg-amber-100/90",
    colorText: "text-amber-600",
    defaultHref: "/workflows",
  },
  {
    id: "hrm",
    name: "HRM & People Ops",
    category: "operations",
    subtitle: "Employees & Payroll 360",
    icon: Users,
    colorBg: "bg-indigo-100/90",
    colorText: "text-indigo-600",
    defaultHref: "/hrm",
  },
  {
    id: "accounts",
    name: "Finance & Accounts",
    category: "finance",
    subtitle: "Chart of Accounts & GL",
    icon: Landmark,
    colorBg: "bg-emerald-100/90",
    colorText: "text-emerald-600",
    defaultHref: "/accounts",
  },
  {
    id: "projects",
    name: "Projects & Tasks",
    category: "operations",
    subtitle: "Kanban, Sprints & Timesheets",
    icon: FolderKanban,
    colorBg: "bg-violet-100/90",
    colorText: "text-violet-600",
    defaultHref: "/projects",
  },
  {
    id: "mrp",
    name: "Manufacturing MRP",
    category: "operations",
    subtitle: "Work Orders, BOMs & Operations",
    icon: Factory,
    colorBg: "bg-rose-100/90",
    colorText: "text-rose-600",
    defaultHref: "/mrp",
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

  // Section expand states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pos: false,
    itemsAndPricing: false,
    setup: false,
    reports: false,
    hrmTalent: false,
    hrmClaims: false,
    workflowRules: false,
    stockMgmt: false,
  });

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Determine active workspace from URL
  const determineActiveWorkspace = (): string => {
    if (
      pathname.startsWith("/workflows") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/templates")
    ) {
      return "workflows";
    }
    if (pathname.startsWith("/hrm")) {
      return "hrm";
    }
    if (pathname.startsWith("/accounts")) {
      return "accounts";
    }
    if (pathname.startsWith("/projects")) {
      return "projects";
    }
    if (pathname.startsWith("/mrp")) {
      return "mrp";
    }
    if (pathname.startsWith("/stock")) {
      return "stock";
    }
    if (pathname.startsWith("/sales/crm")) {
      return "crm";
    }
    if (pathname.startsWith("/sales/items")) {
      return "stock";
    }
    if (pathname.startsWith("/sales/blanket-orders")) {
      return "buying";
    }
    return "selling";
  };

  const activeWorkspaceId = determineActiveWorkspace();
  const currentWorkspace =
    ALL_WORKSPACES.find((w) => w.id === activeWorkspaceId) || ALL_WORKSPACES[0];
  const CurrentIcon = currentWorkspace.icon;

  // Filtered workspaces for search
  const filteredWorkspaces = ALL_WORKSPACES.filter(
    (w) =>
      w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
      w.subtitle.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  // Grouped workspaces for dropdown
  const coreWorkspaces = filteredWorkspaces.filter((w) => w.category === "core");
  const opsWorkspaces = filteredWorkspaces.filter(
    (w) => w.category === "operations" || w.category === "finance"
  );
  const adminWorkspaces = filteredWorkspaces.filter((w) => w.category === "admin");

  const handleWorkspaceClick = (ws: WorkspaceDef) => {
    setIsSwitcherOpen(false);
    router.push(ws.defaultHref);
  };

  // ERPNext Desk Selling Sidebar Structure
  const SELLING_STANDARD_ITEMS = [
    { title: "Home", href: "/sales", icon: Home },
    { title: "Dashboard", href: "/sales?tab=overview", icon: LayoutDashboard },
    { title: "CRM Pipeline", href: "/sales/crm", icon: Briefcase },
    { title: "Quotation", href: "/sales/quotations", icon: FileText },
    { title: "Sales Order", href: "/sales/orders", icon: ShoppingBag },
    { title: "Delivery Note", href: "/sales/delivery-notes", icon: Truck },
    { title: "Packing Slip", href: "/sales/packing-slips", icon: Boxes },
    { title: "Drop Shipping", href: "/sales/drop-ship", icon: Package },
    { title: "Maintenance & AMC", href: "/sales/maintenance", icon: Wrench },
    { title: "Payment Terms", href: "/sales/payment-terms", icon: Layers },
    { title: "Sales Targets", href: "/sales/targets", icon: Target },
    { title: "Sales Invoice", href: "/sales/invoices", icon: Receipt },
    { title: "POS", href: "/sales/pos", icon: Monitor },
  ];

  const POS_ITEMS = [
    { title: "POS Profile", href: "/sales/pos" },
    { title: "POS Invoice", href: "/sales/invoices?type=pos" },
    { title: "POS Opening Entry", href: "/sales/pos" },
    { title: "POS Closing Entry", href: "/sales/pos" },
    { title: "POS Invoice Merge Log", href: "/sales/pos" },
    { title: "POS Settings", href: "/sales/pos" },
    { title: "Loyalty Program", href: "/sales/pos" },
    { title: "Loyalty Point Entry", href: "/sales/pos" },
  ];

  const ITEMS_PRICING_ITEMS = [
    { title: "Item", href: "/sales/items?tab=items" },
    { title: "Item Group", href: "/sales/items?tab=groups" },
    { title: "Price List", href: "/sales/items?tab=prices" },
    { title: "Item Price", href: "/sales/items?tab=item-prices" },
    { title: "Pricing Rule", href: "/sales/pricing-rules?tab=rules" },
    { title: "Product Bundle", href: "/sales/items?tab=bundles" },
    { title: "Promotional Scheme", href: "/sales/pricing-rules?tab=promotional" },
    { title: "Coupon Code", href: "/sales/pricing-rules?tab=coupons" },
    { title: "Shipping Rule", href: "/sales/pricing-rules?tab=shipping" },
    { title: "Blanket Order", href: "/sales/blanket-orders" },
  ];

  const SETUP_ITEMS = [
    { title: "Customer", href: "/sales/customers" },
    { title: "Customer Group", href: "/sales/customers?tab=groups" },
    { title: "Address", href: "/sales/customers?tab=address" },
    { title: "Contact", href: "/sales/customers?tab=contacts" },
    { title: "Territory", href: "/sales/crm?tab=territory" },
    { title: "Campaign", href: "/sales/crm?tab=campaign" },
    { title: "Sales Person", href: "/sales/sales-persons" },
    { title: "Sales Partner", href: "/sales/sales-partners" },
    { title: "Sales Target", href: "/sales/targets" },
    { title: "Monthly Distribution", href: "/sales/settings" },
    { title: "Payment Terms Template", href: "/sales/payment-terms" },
    { title: "Tax Template", href: "/sales/settings" },
    { title: "Product Bundle", href: "/sales/items" },
    { title: "UTM Source", href: "/sales/crm?tab=utm" },
    { title: "Shipping Rule", href: "/sales/settings" },
  ];

  const REPORTS_ITEMS = [
    { title: "Sales Register", href: "/sales/reports?report=register" },
    { title: "Item-wise Sales Register", href: "/sales/reports?report=item-register" },
    { title: "Sales Analytics", href: "/sales/reports?report=analytics" },
    { title: "Customer Addresses & Contacts", href: "/sales/reports?report=contacts" },
    { title: "Inactive Customers", href: "/sales/reports?report=inactive" },
    { title: "Sales Invoice Trends", href: "/sales/reports?report=invoice-trends" },
    { title: "Customer Credit Balance", href: "/sales/reports?report=credit-balance" },
    { title: "Customers Without Any Sales", href: "/sales/reports?report=no-sales" },
    { title: "Sales Partners Commission", href: "/sales/reports?report=commission" },
    { title: "Available Stock for Packing Items", href: "/sales/reports?report=stock" },
    { title: "Territory Target Variance", href: "/sales/targets?tab=territories" },
    { title: "Sales Person Target Variance", href: "/sales/targets?tab=reps" },
    { title: "Sales Partner Target Variance", href: "/sales/reports?report=partner-variance" },
    { title: "Pending SO Items For Purchase", href: "/sales/reports?report=pending-so" },
    { title: "Sales Funnel", href: "/sales/reports?report=funnel" },
    { title: "Sales Order Analysis", href: "/sales/reports?report=order-analysis" },
    { title: "Customer Acquisition and Loyalty", href: "/sales/reports?report=acquisition" },
    { title: "Quotation Trends", href: "/sales/reports?report=quotation-trends" },
    { title: "Sales Order Trends", href: "/sales/reports?report=order-trends" },
    { title: "Item-wise Sales History", href: "/sales/reports?report=item-history" },
    { title: "Sales Person Transaction Summary", href: "/sales/reports?report=person-summary" },
  ];

  // Workflow Specific Menu Items
  const WORKFLOW_ITEMS = [
    { title: "Overview", href: "/workflows?tab=overview", icon: Home },
    { title: "Workflows & States", href: "/workflows?tab=workflows", icon: GitMerge },
    { title: "Documents & Records", href: "/workflows?tab=documents", icon: FileText },
    { title: "Approval Queue", href: "/workflows?tab=approvals", icon: FileCheck },
    { title: "Doc Templates", href: "/workflows?tab=templates", icon: Layers },
    { title: "AI OCR Extractor", href: "/workflows?tab=ai", icon: Sliders },
    { title: "Workflow Settings", href: "/workflows?tab=settings", icon: Settings },
  ];



  // CRM Menu Items
  const CRM_ITEMS = [
    { title: "CRM Dashboard", href: "/sales/crm", icon: LayoutDashboard },
    { title: "Leads & Prospects", href: "/sales/crm", icon: Users },
    { title: "Opportunities", href: "/sales/crm?tab=opportunities", icon: Tag },
    { title: "Customers", href: "/sales/customers", icon: User },
    { title: "Campaigns", href: "/sales/crm?tab=campaign", icon: Layers },
    { title: "Territory Management", href: "/sales/crm?tab=territory", icon: MapPin },
  ];

  // Stock Menu Items
  const STOCK_ITEMS = [
    { title: "Stock Overview", href: "/sales/items", icon: LayoutDashboard },
    { title: "Item Master", href: "/sales/items?tab=items", icon: Package },
    { title: "Item Groups", href: "/sales/items?tab=groups", icon: Layers },
    { title: "Price Lists", href: "/sales/items?tab=prices", icon: Tag },
    { title: "Item Prices", href: "/sales/items?tab=item-prices", icon: Percent },
    { title: "Product Bundles", href: "/sales/items?tab=bundles", icon: Boxes },
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
                      const isActive = ws.id === activeWorkspaceId;
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
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
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
                      const isActive = ws.id === activeWorkspaceId;
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
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin & Settings */}
              {adminWorkspaces.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    System Masters
                  </div>
                  <div className="space-y-0.5">
                    {adminWorkspaces.map((ws) => {
                      const WsIcon = ws.icon;
                      const isActive = ws.id === activeWorkspaceId;
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
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredWorkspaces.length === 0 && (
                <div className="py-4 text-center text-xs text-gray-400">
                  No workspaces found
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
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 text-[13px]">
          {/* WORKFLOW STUDIO WORKSPACE */}
          {activeWorkspaceId === "workflows" && (
            <div className="space-y-0.5">
              <div className="px-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Automation
              </div>
              {WORKFLOW_ITEMS.map((item) => {
                const isItemActive =
                  pathname.startsWith(item.href.split("?")[0]) &&
                  (!item.href.includes("tab=") || pathname.includes(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                      isItemActive
                        ? "bg-amber-100/80 text-amber-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}

              <div className="h-[1px] bg-gray-200/70 mx-1 my-2" />
              <div className="px-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Quick Jump
              </div>
              <Link
                href="/sales"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-200/60 hover:text-gray-900 transition-colors text-[13px]"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Selling Workspace</span>
              </Link>

            </div>
          )}



          {/* CRM WORKSPACE */}
          {activeWorkspaceId === "crm" && (
            <div className="space-y-0.5">
              <div className="px-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Sales Pipeline
              </div>
              {CRM_ITEMS.map((item) => {
                const isItemActive =
                  pathname === item.href ||
                  (item.href !== "/sales/crm" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                      isItemActive
                        ? "bg-rose-100/80 text-rose-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
              <div className="h-[1px] bg-gray-200/70 mx-1 my-2" />
              <Link
                href="/sales"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-200/60 hover:text-gray-900 transition-colors text-[13px]"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Selling Workspace</span>
              </Link>
            </div>
          )}

          {/* STOCK & INVENTORY WORKSPACE */}
          {activeWorkspaceId === "stock" && (
            <div className="space-y-0.5">
              <div className="px-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Stock Masters
              </div>
              {STOCK_ITEMS.map((item) => {
                const isItemActive =
                  pathname === item.href ||
                  (item.href !== "/sales/items" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px]",
                      isItemActive
                        ? "bg-teal-100/80 text-teal-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
              <div className="h-[1px] bg-gray-200/70 mx-1 my-2" />
              <Link
                href="/sales"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-200/60 hover:text-gray-900 transition-colors text-[13px]"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Selling Workspace</span>
              </Link>
            </div>
          )}

          {/* SELLING WORKSPACE (DEFAULT ERPNEXT DESK) */}
          {activeWorkspaceId === "selling" && (
            <>
              {/* Top Standard Navigation Items */}
              <div className="space-y-0.5">
                {SELLING_STANDARD_ITEMS.map((item) => {
                  const isItemActive =
                    pathname === item.href ||
                    (item.href !== "/sales" && pathname.startsWith(item.href));
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

              <div className="h-[1px] bg-gray-200/70 mx-1" />

              {/* POS Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("pos")}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
                >
                  <span>POS</span>
                  {openSections.pos ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openSections.pos && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                    {POS_ITEMS.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        className="block px-2 py-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 truncate"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

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
                    {ITEMS_PRICING_ITEMS.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        className="block px-2 py-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 truncate"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Setup Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("setup")}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
                >
                  <span>Setup</span>
                  {openSections.setup ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openSections.setup && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                    {SETUP_ITEMS.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        className="block px-2 py-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 truncate"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("reports")}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
                >
                  <span>Reports</span>
                  {openSections.reports ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {openSections.reports && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 text-[12px]">
                    {REPORTS_ITEMS.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        className="block px-2 py-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 truncate"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <Link
                href="/sales?tab=settings"
                className="flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:text-gray-900 rounded hover:bg-gray-200/50"
              >
                <span>Settings</span>
              </Link>
            </>
          )}
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



