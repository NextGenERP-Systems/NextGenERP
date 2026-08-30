"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";

export default function ProjectTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([
    { id: '1', name: 'Software Development', type: 'Internal', taskCount: 15 },
    { id: '2', name: 'ERP Implementation', type: 'External', taskCount: 42 }
  ]);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage standardized project blueprints and predefined task lists.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white rounded-md px-3 py-1.5 w-64 border border-gray-300 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search templates..." className="bg-transparent border-none outline-none text-sm w-full text-gray-800" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Template Name</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Project Type</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tasks Defined</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {templates.map(tmpl => (
              <tr key={tmpl.id} className="hover:bg-gray-50/50 cursor-pointer">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><FileText size={16} /></div>
                  {tmpl.name}
                </td>
                <td className="p-4 text-gray-600">{tmpl.type}</td>
                <td className="p-4 text-gray-600">{tmpl.taskCount} tasks</td>
                <td className="p-4 text-gray-400 hover:text-gray-900">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
