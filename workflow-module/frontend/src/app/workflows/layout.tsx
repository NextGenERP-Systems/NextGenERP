"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, Search, Plus, Home, ArrowRight, CheckCircle, Clock, User, 
  Settings, Layers, ListTree, Repeat 
} from "lucide-react";

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/workflows/dashboard" },
    { name: "My Documents", href: "/workflows/documents" },
    { name: "Approvals", href: "/workflows/approvals" },
    { name: "Workflows", href: "/workflows/definitions" },
    { name: "Templates", href: "/workflows/templates" },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
        <div className="flex items-center text-sm text-slate-500">
          <span>Workflows</span>
          <ArrowRight className="w-3 h-3 mx-2 opacity-50" />
          <span className="font-medium text-slate-800">
            {navItems.find(i => pathname.startsWith(i.href))?.name || "Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none w-64"
            />
          </div>
        </div>
      </header>

      {/* Scrollable Page Content */}
      <div className="flex-1 overflow-auto p-8 relative">
        {children}
      </div>
    </div>
  );
}
