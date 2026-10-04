"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dynamic breadcrumb mapping
  const getBreadcrumb = () => {
    if (pathname === "/accounts") {
      return { title: "Overview", href: "/accounts" };
    }
    if (pathname.startsWith("/accounts/chart-of-accounts")) {
      return { title: "Chart of Accounts", href: "/accounts/chart-of-accounts" };
    }
    if (pathname.startsWith("/accounts/general-ledger")) {
      return { title: "General Ledger", href: "/accounts/general-ledger" };
    }
    if (pathname.startsWith("/accounts/journal-entries")) {
      return { title: "Journal Entries", href: "/accounts/journal-entries" };
    }
    if (pathname.startsWith("/accounts/sales-invoices")) {
      return { title: "Sales Invoices (AR)", href: "/accounts/sales-invoices" };
    }
    if (pathname.startsWith("/accounts/purchase-invoices")) {
      return { title: "Purchase Invoices (AP)", href: "/accounts/purchase-invoices" };
    }
    if (pathname.startsWith("/accounts/payments")) {
      return { title: "Payment Entries", href: "/accounts/payments" };
    }
    if (pathname.startsWith("/accounts/banking")) {
      return { title: "Banking & Cash", href: "/accounts/banking" };
    }
    if (pathname.startsWith("/accounts/assets")) {
      return { title: "Fixed Assets", href: "/accounts/assets" };
    }
    if (pathname.startsWith("/accounts/taxes")) {
      return { title: "Tax & GST Filing", href: "/accounts/taxes" };
    }
    if (pathname.startsWith("/accounts/cost-centers")) {
      return { title: "Cost Centers", href: "/accounts/cost-centers" };
    }
    if (pathname.startsWith("/accounts/reports")) {
      return { title: "Financial Statements", href: "/accounts/reports" };
    }
    return { title: "Accounting", href: "/accounts" };
  };

  const breadcrumb = getBreadcrumb();

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex w-full min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Unified ERPNext Desk Top Navigation Bar for All Accounting Views */}
        <header className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
            <Link href="/accounts" className="text-gray-500 hover:text-gray-900 flex items-center">
              <Home className="w-3.5 h-3.5 text-gray-500" />
            </Link>
            <span className="text-gray-400 font-light">/</span>
            <Link href="/accounts" className="text-gray-600 hover:text-gray-900 font-normal">
              Finance & Accounts
            </Link>
            <span className="text-gray-400 font-light">/</span>
            <span className="font-bold text-gray-900">
              {breadcrumb.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentDateStr}</span>
            </div>

            {!pathname.startsWith("/accounts/journal-entries") && (
              <Link
                href="/accounts/journal-entries"
                className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Journal Entry</span>
              </Link>
            )}
          </div>
        </header>

        {/* View Content with proper padding */}
        <main className="flex-1 overflow-auto bg-white px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
