"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();

  // Section expand states (default all open or open active section)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pos: false,
    itemsAndPricing: false,
    setup: false,
    reports: false,
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

  // ERPNext Desk Selling Sidebar Structure
  const STANDARD_ITEMS = [
    { title: "Home", href: "/sales", icon: Home },
    { title: "Dashboard", href: "/sales?tab=overview", icon: LayoutDashboard },
    { title: "Quotation", href: "/sales/quotations", icon: FileText },
    { title: "Sales Order", href: "/sales/orders", icon: ShoppingBag },
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
    { title: "Monthly Distribution", href: "/sales/settings" },
    { title: "Terms Template", href: "/sales/settings" },
    { title: "Tax Template", href: "/sales/settings" },
    { title: "Product Bundle", href: "/sales/items" },
    { title: "UTM Source", href: "/sales/crm?tab=utm" },
    { title: "Shipping Rule", href: "/sales/settings" },
  ];

  const REPORTS_ITEMS = [
    { title: "Sales Register", href: "/sales/reports?report=register" },
    { title: "Item-wise Sales Register", href: "/sales/reports?report=item-register" },
    { title: "Sales Analytics", href: "/sales/reports?report=analytics" },
    { title: "Customer Addresses And Contacts", href: "/sales/reports?report=contacts" },
    { title: "Inactive Customers", href: "/sales/reports?report=inactive" },
    { title: "Sales Invoice Trends", href: "/sales/reports?report=invoice-trends" },
    { title: "Customer Credit Balance", href: "/sales/reports?report=credit-balance" },
    { title: "Customers Without Any Sales", href: "/sales/reports?report=no-sales" },
    { title: "Sales Partners Commission", href: "/sales/reports?report=commission" },
    { title: "Available Stock for Packing Items", href: "/sales/reports?report=stock" },
    { title: "Territory Target Variance", href: "/sales/reports?report=territory-variance" },
    { title: "Sales Person Target Variance", href: "/sales/reports?report=salesperson-variance" },
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

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1">
        {/* ERPNext Header Banner */}
        <div className="h-12 px-3 border-b border-gray-200 bg-[#f8f8f8] flex items-center">
          <Link href="/sales" className="flex items-center gap-2.5 group w-full">
            <div className="w-7 h-7 rounded bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                Selling
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                ERPNext
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 ml-auto text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-3 text-[13px]">
          {/* Top Standard Navigation Items */}
          <div className="space-y-0.5">
            {STANDARD_ITEMS.map((item) => {
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


