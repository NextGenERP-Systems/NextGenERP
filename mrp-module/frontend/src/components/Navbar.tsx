'use client';

import { useState } from 'react';
import { Shield, Bell, Database } from 'lucide-react';

export default function Navbar() {
  const [role, setRole] = useState<'mrp_production_manager' | 'mrp_shop_floor_worker'>('mrp_production_manager');

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">Shop Floor Control & MRP Core</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Database className="w-3 h-3" />
          PostgreSQL CTE Engine Active
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1">
          <Shield className="w-4 h-4 text-indigo-600" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="bg-transparent text-xs text-gray-800 focus:outline-none font-medium cursor-pointer"
          >
            <option value="mrp_production_manager">Role: Production Manager (Full RLS)</option>
            <option value="mrp_shop_floor_worker">Role: Shop Floor Worker (Restricted RLS)</option>
          </select>
        </div>

        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-gray-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
            AW
          </div>
          <div className="text-xs">
            <div className="font-semibold text-gray-900 leading-tight">Alexander Wright</div>
            <div className="text-gray-500 text-[11px]">Senior Machinist</div>
          </div>
        </div>
      </div>
    </header>
  );
}
