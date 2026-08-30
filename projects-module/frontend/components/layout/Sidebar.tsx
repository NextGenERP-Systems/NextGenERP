"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FolderKanban,
  Home,
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  Clock,
  FileText,
  Settings,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const STANDARD_ITEMS = [
    { title: "Dashboard", href: "/projects", icon: LayoutDashboard, tab: null },
    { title: "Kanban Board", href: "/projects?tab=tasks", icon: CheckCircle2, tab: "tasks" },
    { title: "Gantt Chart", href: "/projects?tab=gantt", icon: CalendarDays, tab: "gantt" },
    { title: "Timeline", href: "/projects?tab=timeline", icon: Clock, tab: "timeline" },
  ];

  const SETUP_ITEMS = [
    { title: "Project Templates", href: "/projects/templates" },
    { title: "Activity Types", href: "/projects/activity-types" },
    { title: "Project Types", href: "/projects?tab=types" },
    { title: "Task Priorities", href: "/projects?tab=priorities" },
    { title: "Timesheets", href: "/projects?tab=timesheets" },
    { title: "Roles & Permissions", href: "/projects?tab=roles" },
    { title: "Settings", href: "/projects?tab=settings" },
  ];

  return (
    <aside className="w-56 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Banner */}
        <div className="h-12 px-3 border-b border-gray-200 bg-[#f8f8f8] flex items-center">
          <Link href="/projects" className="flex items-center gap-2.5 group w-full">
            <div className="w-7 h-7 rounded bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                Projects
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
              const isItemActive = item.tab ? currentTab === item.tab : (!currentTab && pathname === "/projects");
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
              {SETUP_ITEMS.map((sub) => {
                let isSubActive = false;
                if (sub.href.includes("?tab=")) {
                  isSubActive = currentTab === sub.href.split('tab=')[1];
                } else {
                  isSubActive = pathname === sub.href;
                }
                return (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    className={cn(
                      "block px-2 py-1 rounded transition-colors truncate",
                      isSubActive 
                        ? "text-gray-900 bg-gray-200/90 font-medium" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    )}
                  >
                    {sub.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Bar at bottom */}
      <div className="p-2.5 border-t border-gray-200 bg-[#f8f8f8] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
          AK
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-gray-900 leading-tight truncate">
            Aditya K
          </span>
          <span className="text-[10px] text-gray-500 leading-tight truncate">
            admin@nextgen.erp
          </span>
        </div>
      </div>
    </aside>
  );
}
