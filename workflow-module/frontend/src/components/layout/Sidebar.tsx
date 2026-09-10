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
  Users,
  Layers,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser, isLoading } = useAuth();

  const STANDARD_ITEMS = [
    { title: "Dashboard", href: "/workflows/dashboard", icon: LayoutDashboard },
    { title: "Documents", href: "/workflows/documents", icon: FileText },
    { title: "Kanban Board", href: "/workflows/kanban", icon: Layers },
    { title: "Approvals", href: "/workflows/approvals", icon: CheckCircle2 },
    { title: "Audit Trail", href: "/workflows/audit", icon: History },
  ];

  const SETUP_ITEMS = [
    { title: "Workflows", href: "/workflows/definitions" },
    { title: "Workflow States", href: "/workflows/setup/states" },
    { title: "State Transitions", href: "/workflows/setup/transitions" },
    { title: "Document Templates", href: "/workflows/templates" },
    { title: "Roles & Permissions", href: "/workflows/setup/roles" },
    { title: "Settings", href: "/workflows/setup/settings" },
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
      <div className="p-2.5 border-t border-gray-200 bg-[#f8f8f8]">
        {isLoading ? (
          <div className="text-xs text-slate-500">Loading user...</div>
        ) : currentUser ? (
          <div className="relative group/user">
            <div className="flex items-center gap-2.5 cursor-pointer rounded hover:bg-gray-200/50 p-1 -mx-1">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[12px] font-medium text-gray-900 leading-tight truncate">
                  {currentUser.username}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight truncate">
                  {currentUser.roles.map(r => r.roleName).join(', ')}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            
            {/* Dropdown Menu (Hover to open) */}
            <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all">
              <div className="p-1 text-[11px] font-medium text-gray-500 uppercase px-2 pt-2">Switch User (Mock)</div>
              <div className="py-1">
                {users.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {u.username} <span className="text-[10px] text-gray-400">({u.roles[0]?.roleName})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
