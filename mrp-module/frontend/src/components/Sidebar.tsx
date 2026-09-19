'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Factory, 
  Layers, 
  ClipboardList, 
  Timer, 
  Cpu, 
  Wand2, 
  ShieldCheck, 
  Activity, 
  Trash2,
  Workflow
} from 'lucide-react';

const navItems = [
  { name: 'MRP Dashboard', href: '/', icon: Factory },
  { name: 'Bill of Materials (BOM)', href: '/boms', icon: Layers },
  { name: 'Routings & Operations', href: '/routings', icon: Workflow },
  { name: 'Master Schedule (MPS)', href: '/mps', icon: Activity },
  { name: 'Work Orders', href: '/work-orders', icon: ClipboardList },
  { name: 'Job Cards (Tablet UI)', href: '/job-cards', icon: Timer },
  { name: 'Workstations & Gantt', href: '/workstations', icon: Cpu },
  { name: 'MRP Shortage Wizard', href: '/mrp-wizard', icon: Wand2 },
  { name: 'Subcontracting', href: '/subcontracting', icon: ClipboardList },
  { name: 'Quality Inspection', href: '/quality', icon: ShieldCheck },
  { name: 'Sandbox & Security', href: '/sandbox', icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#f8f8f8] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-[#1f272e]">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Banner Header */}
        <div className="h-14 px-4 border-b border-gray-200 bg-[#f8f8f8] flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group w-full">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
              <Factory className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[13px] font-bold text-gray-900 leading-tight truncate">
                Manufacturing (MRP)
              </div>
              <div className="text-[11px] text-gray-500 font-medium leading-tight">
                NextGen ERP
              </div>
            </div>
          </Link>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-[13px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-[13px] font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Sandbox Status Banner */}
      <div className="p-3 border-t border-gray-200 bg-[#f8f8f8]">
        <div className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Isolated Sandbox Mode
          </div>
          <p className="text-[11px] text-gray-500 leading-normal">
            Standalone MRP engine running independently with mock adapters.
          </p>
        </div>
      </div>
    </aside>
  );
}
