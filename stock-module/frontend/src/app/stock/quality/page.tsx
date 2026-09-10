"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export default function QualityInspectionsPage() {
  const [inspections] = useState([
    {
      id: "qi-001",
      inspectionNumber: "QI-INWARD-2026-001",
      type: "INCOMING",
      referenceType: "Purchase Receipt",
      referenceId: "PR-2026-0089",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9",
      sampleSize: 5,
      date: "2026-02-01",
      inspector: "QA Engineer John",
      status: "ACCEPTED",
    },
    {
      id: "qi-002",
      inspectionNumber: "QI-OUTWARD-2026-002",
      type: "OUTGOING",
      referenceType: "Delivery Note",
      referenceId: "DN-2026-0145",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      sampleSize: 2,
      date: "2026-02-16",
      inspector: "QA Lead Sarah",
      status: "ACCEPTED",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <span>Quality Inspections (QA / QC)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Verify parameters and specifications before accepting inbound vendor stock or dispatching customer deliveries.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 pl-4">Inspection No</th>
              <th className="py-3.5">Type</th>
              <th className="py-3.5">Reference Document</th>
              <th className="py-3.5">Item SKU & Name</th>
              <th className="py-3.5 text-center">Sample Size</th>
              <th className="py-3.5">Inspector</th>
              <th className="py-3.5 pr-4 text-center">QC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 pl-4 font-mono font-bold text-slate-900">{q.inspectionNumber}</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                    {q.type}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="font-mono text-blue-600 font-medium">{q.referenceId}</span>
                  <p className="text-[10px] text-slate-400">{q.referenceType}</p>
                </td>
                <td className="py-3.5">
                  <p className="font-semibold text-slate-900">{q.itemName}</p>
                  <p className="text-[10px] font-mono text-slate-400">{q.itemCode}</p>
                </td>
                <td className="py-3.5 text-center font-mono font-semibold text-slate-800">{q.sampleSize}</td>
                <td className="py-3.5 text-slate-600">{q.inspector}</td>
                <td className="py-3.5 pr-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                    {q.status}
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
