"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LayoutDashboard,
  GitPullRequest,
  Settings,
  ChevronDown,
  FileCheck,
  CheckCircle2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const STANDARD_ITEMS = [
    { title: "Home", href: "/workflows", icon: Home },
    { title: "Dashboard", href: "/workflows?tab=overview", icon: LayoutDashboard },
    { title: "Documents", href: "/workflows?tab=documents", icon: FileText },
    { title: "Approvals", href: "/workflows?tab=approvals", icon: CheckCircle2 },
  ];

  const SETUP_ITEMS = [
    { title: "Workflow States", href: "/workflows?tab=states" },
    { title: "State Transitions", href: "/workflows?tab=transitions" },
    { title: "Workflow Rules", href: "/workflows?tab=rules" },
    { title: "Document Templates", href: "/workflows?tab=templates" },
    { title: "Roles & Permissions", href: "/workflows?tab=roles" },
    { title: "Settings", href: "/workflows?tab=settings" },
  ];

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1">
        {/* ERPNext Header Banner */}
        <div className="h-12 px-3 border-b border-gray-200 bg-[#f8f8f8] flex items-center">
          <Link href="/workflows" className="flex items-center gap-2.5 group w-full">
            <div className="w-7 h-7 rounded bg-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                Workflow
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                NextGenERP
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
                (item.href !== "/workflows" && pathname.startsWith(item.href));
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

          {/* Setup Accordion */}
          <div>
            <div className="w-full flex items-center justify-between px-2.5 py-1 text-[13px] font-medium text-gray-700">
              <span>Setup</span>
            </div>
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
