"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Plus,
  ArrowRight,
  Home,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default function StockEntriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPurpose, setFilterPurpose] = useState<string>("ALL");

  const [entries] = useState([
    {
      id: "se-mfg-003",
      entryNumber: "MFG-ENTRY-2026-003",
      purpose: "Manufacture",
      date: "2026-02-15",
      time: "18:00:00",
      fromWarehouse: "Work In Progress Floor",
      toWarehouse: "Finished Goods DC",
      totalIncoming: 128250.0,
      totalOutgoing: 115000.0,
      valueDiff: 13250.0,
      status: "SUBMITTED",
      itemSummary: "NextGen AI Enterprise Rack Server 4U (45 units)",
    },
    {
      id: "se-trf-002",
      entryNumber: "MAT-TRF-2026-002",
      purpose: "Material Transfer",
      date: "2026-02-10",
      time: "14:30:00",
      fromWarehouse: "Central Stores - Rack A",
      toWarehouse: "Work In Progress Floor",
      totalIncoming: 6400.0,
      totalOutgoing: 6400.0,
      valueDiff: 0.0,
      status: "SUBMITTED",
      itemSummary: "Core Processor X9 (20 units)",
    },
    {
      id: "se-rec-001",
      entryNumber: "MAT-REC-2026-001",
      purpose: "Material Receipt",
      date: "2026-02-01",
      time: "10:00:00",
      fromWarehouse: "Supplier / External",
      toWarehouse: "Central Stores - Rack A",
      totalIncoming: 48000.0,
      totalOutgoing: 0.0,
      valueDiff: 48000.0,
      status: "SUBMITTED",
      itemSummary: "NextGen Core Processor X9 (150 units)",
    },
  ]);

  const filteredEntries = entries.filter((e) => {
    if (filterPurpose === "ALL") return true;
    return e.purpose.toUpperCase() === filterPurpose.toUpperCase();
  });

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/stock" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">
            Stock Entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Entry</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-2 space-y-3.5">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "Material Receipt", "Material Transfer", "Material Issue", "Manufacture", "Repack"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterPurpose(tab === "ALL" ? "ALL" : tab)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                (filterPurpose === "ALL" && tab === "ALL") || filterPurpose.toLowerCase() === tab.toLowerCase()
                  ? "bg-gray-900 text-white shadow-2xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Entries Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Entry Number</th>
                  <th className="py-2 px-3">Purpose</th>
                  <th className="py-2 px-3">Source & Target Warehouses</th>
                  <th className="py-2 px-3">Items Summary</th>
                  <th className="py-2 px-3 text-right font-mono">Incoming Val</th>
                  <th className="py-2 px-3 text-right font-mono">Outgoing Val</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5">
                      <p className="font-bold text-gray-900 font-mono">{entry.entryNumber}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{entry.id}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                        {entry.purpose}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-gray-500 truncate max-w-[120px]">{entry.fromWarehouse || "—"}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-800 truncate max-w-[120px]">{entry.toWarehouse || "—"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-800 max-w-[200px] truncate">
                      {entry.itemSummary}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-600">
                      {formatCurrency(entry.totalIncoming)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-gray-600">
                      {formatCurrency(entry.totalOutgoing)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="py-2 px-3.5 text-right text-gray-500 font-mono text-[10px]">
                      {entry.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Stock Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-5 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Create Stock Entry</h3>
                <p className="text-xs text-gray-500">Record a stock mutation across warehouses</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Purpose</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium">
                  <option value="MATERIAL_RECEIPT">Material Receipt</option>
                  <option value="MATERIAL_ISSUE">Material Issue</option>
                  <option value="MATERIAL_TRANSFER">Material Transfer</option>
                  <option value="MANUFACTURE">Manufacture</option>
                  <option value="REPACK">Repack</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Posting Date</label>
                <input
                  type="date"
                  defaultValue="2026-02-28"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Source Warehouse (From)</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="">None / External Supplier</option>
                  <option value="wh-main">Central Stores - Rack A</option>
                  <option value="wh-wip">Work In Progress Floor</option>
                  <option value="wh-fg">Finished Goods DC</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Target Warehouse (To)</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="wh-main">Central Stores - Rack A</option>
                  <option value="wh-wip">Work In Progress Floor</option>
                  <option value="wh-fg">Finished Goods DC</option>
                  <option value="wh-quar">Quarantine Bay</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2 text-xs">
              <p className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">Item Details</p>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label className="block text-[10px] text-gray-500">Item SKU</label>
                  <select className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium">
                    <option value="item-cpu-01">ITEM-CPU-X9 — NextGen Core Processor</option>
                    <option value="item-ram-02">ITEM-RAM-DDR5 — 64GB DDR5 Memory</option>
                    <option value="item-serv-04">ITEM-SRV-ENTERPRISE — NextGen Server 4U</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-gray-500">Quantity</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-gray-500">Rate ($)</label>
                  <input
                    type="number"
                    defaultValue="320.00"
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Stock entry submitted & posted to Stock Ledger!");
                  setIsModalOpen(false);
                }}
                className="px-3 py-1.5 rounded text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-2xs"
              >
                Submit & Post SLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
