"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function StockReconciliationPage() {
  const [reconciliations] = useState([
    {
      id: "rec-001",
      reconciliationNumber: "REC-AUDIT-2026-01",
      postingDate: "2026-01-31",
      purpose: "Monthly Physical Inventory Audit",
      itemsAdjusted: 3,
      diffAmount: -450.0,
      status: "Submitted",
      expenseAccount: "Stock Adjustment - NC",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <span>Stock Reconciliation & Physical Audits</span>
          </h2>
          <p className="text-xs text-slate-500">
            Reconcile recorded system inventory with physical floor counts and post valuation variance adjustments.
          </p>
        </div>

        <button
          onClick={() => alert("Reconciliation Wizard: Enter physical counts against warehouse bins.")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Audit</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 pl-4">Reconciliation Number</th>
              <th className="py-3.5">Audit Purpose</th>
              <th className="py-3.5">Posting Date</th>
              <th className="py-3.5">Expense Account</th>
              <th className="py-3.5 text-right font-mono">Net Variance</th>
              <th className="py-3.5 pr-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reconciliations.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 pl-4 font-mono font-bold text-slate-900">{r.reconciliationNumber}</td>
                <td className="py-3.5 font-medium text-slate-800">{r.purpose}</td>
                <td className="py-3.5 font-mono text-slate-600">{r.postingDate}</td>
                <td className="py-3.5 text-slate-600">{r.expenseAccount}</td>
                <td className={`py-3.5 text-right font-mono font-bold ${r.diffAmount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {r.diffAmount < 0 ? `-$${Math.abs(r.diffAmount).toFixed(2)}` : `+$${r.diffAmount.toFixed(2)}`}
                </td>
                <td className="py-3.5 pr-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                    {r.status}
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
