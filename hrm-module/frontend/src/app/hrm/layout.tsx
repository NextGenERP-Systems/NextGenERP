"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function HrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dynamic breadcrumb mapping
  const getBreadcrumb = () => {
    if (pathname === "/hrm") {
      return { title: "Workspace", href: "/hrm" };
    }
    if (pathname.startsWith("/hrm/employees")) {
      return { title: "Employees (360)", href: "/hrm/employees" };
    }
    if (pathname.startsWith("/hrm/attendance")) {
      return { title: "Attendance & Shifts", href: "/hrm/attendance" };
    }
    if (pathname.startsWith("/hrm/leaves")) {
      return { title: "Leave Engine", href: "/hrm/leaves" };
    }
    if (pathname.startsWith("/hrm/payroll")) {
      return { title: "Payroll & Slips", href: "/hrm/payroll" };
    }
    if (pathname.startsWith("/hrm/recruitment")) {
      return { title: "Recruitment", href: "/hrm/recruitment" };
    }
    if (pathname.startsWith("/hrm/appraisals")) {
      return { title: "Appraisals & KRAs", href: "/hrm/appraisals" };
    }
    if (pathname.startsWith("/hrm/expense-claims")) {
      return { title: "Expense Claims", href: "/hrm/expense-claims" };
    }
    if (pathname.startsWith("/hrm/reports")) {
      return { title: "Reports & Analytics", href: "/hrm/reports" };
    }
    return { title: "Dashboard", href: "/hrm" };
  };

  const breadcrumb = getBreadcrumb();
  const isDashboard = pathname === "/hrm";

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
        {/* Unified ERPNext Desk Top Navigation Bar for All Tabs */}
        <header className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
            <Link href="/hrm" className="text-gray-500 hover:text-gray-900 flex items-center">
              <Home className="w-3.5 h-3.5 text-gray-500" />
            </Link>
            <span className="text-gray-400 font-light">/</span>
            <Link href="/hrm" className="text-gray-600 hover:text-gray-900 font-normal">
              Human Resources
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

            {!pathname.startsWith("/hrm/employees") && (
              <Link
                href="/hrm/employees"
                className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </Link>
            )}
          </div>
        </header>

        {/* View Content with proper top and horizontal padding across all tabs */}
        <main className="flex-1 overflow-auto bg-white px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
