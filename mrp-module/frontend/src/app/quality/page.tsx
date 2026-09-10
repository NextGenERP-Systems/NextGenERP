'use client';

import { ShieldCheck } from 'lucide-react';

export default function QualityPage() {
  const inspections = [
    {
      id: 'QI-2026-001',
      woId: 'WO-2026-0001',
      type: 'In-Process',
      inspector: 'Marcus Vance (EMP-103)',
      qty: 2,
      status: 'PASSED',
      remarks: 'Units 1 and 2 passed wind tunnel hover test cleanly.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Quality Check & Inspection Management
          </h1>
          <p className="text-sm text-gray-500">Quality templates, parameter thresholds, and Work Order completion gating</p>
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quality Inspection Logs</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Target WO</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Inspector</th>
                <th className="py-2.5 px-3">Qty Inspected</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {inspections.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-blue-600 font-bold">{q.id}</td>
                  <td className="py-3 px-3 text-gray-900">{q.woId}</td>
                  <td className="py-3 px-3 text-gray-500">{q.type}</td>
                  <td className="py-3 px-3 font-sans text-gray-900">{q.inspector}</td>
                  <td className="py-3 px-3 text-gray-700">{q.qty} Units</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
