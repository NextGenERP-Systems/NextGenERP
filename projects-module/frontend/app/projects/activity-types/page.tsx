"use client";

import React, { useState } from "react";
import { Plus, Search, Tag } from "lucide-react";

export default function ActivityTypesPage() {
  const [types, setTypes] = useState<any[]>([
    { id: '1', name: 'Development', defaultBillingRate: 150.00, isActive: true },
    { id: '2', name: 'Consulting', defaultBillingRate: 200.00, isActive: true },
    { id: '3', name: 'Support', defaultBillingRate: 80.00, isActive: true }
  ]);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Types</h1>
          <p className="text-sm text-gray-500 mt-1">Configure standard activity types and billing rates for timesheets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
            <Plus size={16} /> New Activity Type
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white rounded-md px-3 py-1.5 w-64 border border-gray-300 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search activities..." className="bg-transparent border-none outline-none text-sm w-full text-gray-800" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Activity Name</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Default Billing Rate</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {types.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 cursor-pointer">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded"><Tag size={16} /></div>
                  {t.name}
                </td>
                <td className="p-4 text-gray-600">${t.defaultBillingRate.toFixed(2)} / hr</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {t.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
