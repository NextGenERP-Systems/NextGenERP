"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Plus,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Home,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default function StockDashboard() {
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  const metrics = {
    totalValue: 249200,
    totalItems: 6,
    totalWarehouses: 7,
    lowStockCount: 1,
    activeBatches: 2,
    activeSerials: 5,
  };

  const warehouseChartData = [
    { name: "Central Stores", value: 120950 },
    { name: "Finished Goods", value: 128250 },
    { name: "WIP Floor", value: 0 },
    { name: "Transit Fleet", value: 0 },
  ];

  const recentLedger = [
    {
      id: "sle-003",
      time: "18:00 Today",
      item: "NextGen AI Enterprise Rack Server 4U",
      code: "ITEM-SRV-ENTERPRISE",
      warehouse: "Finished Goods Distribution Center",
      type: "Manufacture Inward",
      qty: 45,
      valRate: 2850.0,
      totalDiff: 128250.0,
      status: "SUBMITTED",
    },
    {
      id: "sle-002",
      time: "14:30 Today",
      item: "64GB DDR5 ECC Server Memory Module",
      code: "ITEM-RAM-DDR5",
      warehouse: "Central Stores - Rack A",
      type: "Material Transfer",
      qty: -20,
      valRate: 140.0,
      totalDiff: -2800.0,
      status: "SUBMITTED",
    },
    {
      id: "sle-001",
      time: "10:00 Today",
      item: "NextGen Core Processor X9 Octa-Core",
      code: "ITEM-CPU-X9",
      warehouse: "Central Stores - Rack A",
      type: "Material Receipt",
      qty: 150,
      valRate: 320.0,
      totalDiff: 48000.0,
      status: "SUBMITTED",
    },
  ];

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
            Stock Workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickEntryOpen(true)}
            className="px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Entry</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-2 space-y-4">
        {/* KPI Stats Cards - Matching exact Sales ratio & sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Valuation */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Stock Value</span>
              <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
              {formatCurrency(metrics.totalValue)}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Perpetual GL Valuation Active</span>
            </p>
          </div>

          {/* Active Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Active SKUs</span>
              <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
                <Boxes className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">{metrics.totalItems} Items</div>
            <p className="text-[10px] text-gray-400 mt-1">Across 4 item categories</p>
          </div>

          {/* Warehouses */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Warehouses</span>
              <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Warehouse className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">{metrics.totalWarehouses} Nodes</div>
            <p className="text-[10px] text-gray-400 mt-1">Stores, WIP, Finished Goods, Transit</p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Low Stock Reorders</span>
              <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-bold text-amber-600 font-mono mt-0.5">{metrics.lowStockCount} SKU</div>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Reorder threshold reached</p>
          </div>
        </div>

        {/* Analytics & Traceability Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Warehouse Valuation Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xs text-gray-900">Inventory Valuation by Warehouse</h3>
                <p className="text-[11px] text-gray-500">Asset distribution across distribution centers and stores</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono font-medium">USD ($)</span>
            </div>
            <div className="h-52 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value), "Valuation"]}
                    contentStyle={{ borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traceability Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="pb-2.5 border-b border-gray-100">
                <h3 className="font-bold text-xs text-gray-900">Traceability & Audits</h3>
                <p className="text-[11px] text-gray-500">Unit-level identification and quality inspections</p>
              </div>
              <div className="space-y-2.5 mt-3">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-teal-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Tracked Batches</p>
                      <p className="text-[10px] text-gray-400">Expiry dates & QA lots</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900">{metrics.activeBatches} Batches</span>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Tracked Serials</p>
                      <p className="text-[10px] text-gray-400">High-value enterprise items</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900">{metrics.activeSerials} Serials</span>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Stock Reconciliation</p>
                      <p className="text-[10px] text-gray-400">Physical vs System Count</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    100% Synced
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Stock Ledger Entries Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-gray-900">Recent Stock Ledger Entries (SLE)</h3>
              <p className="text-[11px] text-gray-500">Immutable double-entry log of all inventory receipts, transfers, and issues</p>
            </div>
            <Link href="/stock/ledger" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3.5">Voucher & ID</th>
                  <th className="py-2.5 px-3">Item Name & SKU</th>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3 text-right">Qty Change</th>
                  <th className="py-2.5 px-3 text-right font-mono">Valuation Rate</th>
                  <th className="py-2.5 px-3 text-right font-mono">Stock Value Impact</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5">
                      <p className="font-mono font-semibold text-gray-800">{row.id}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{row.time}</p>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-gray-800">{row.item}</p>
                      <p className="text-[10px] font-mono text-gray-400">{row.code}</p>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{row.warehouse}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                        {row.type}
                      </span>
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${row.qty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {row.qty > 0 ? `+${row.qty}` : row.qty}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-600">
                      {formatCurrency(row.valRate)}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${row.totalDiff > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {row.totalDiff > 0 ? `+${formatCurrency(row.totalDiff)}` : formatCurrency(row.totalDiff)}
                    </td>
                    <td className="py-2 px-3.5 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stock Entry Modal */}
      {isQuickEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">New Stock Entry</h3>
                <p className="text-xs text-gray-500">Record an instant receipt, issue or transfer</p>
              </div>
              <button
                onClick={() => setIsQuickEntryOpen(false)}
                className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Purpose</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="MATERIAL_RECEIPT">Material Receipt (Inward Procurement)</option>
                  <option value="MATERIAL_ISSUE">Material Issue (Internal Use / Scrap)</option>
                  <option value="MATERIAL_TRANSFER">Material Transfer (Warehouse A to B)</option>
                  <option value="MANUFACTURE">Manufacture (BOM Production)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Select Item</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="item-cpu-01">ITEM-CPU-X9 — NextGen Core Processor X9 ($320.00)</option>
                  <option value="item-ram-02">ITEM-RAM-DDR5 — 64GB DDR5 ECC Server Memory ($140.00)</option>
                  <option value="item-case-03">ITEM-SRV-CHASSIS — 4U Rackmount Server Chassis ($210.00)</option>
                  <option value="item-serv-04">ITEM-SRV-ENTERPRISE — NextGen AI Rack Server ($2,850.00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Target Warehouse</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option value="wh-main">Central Stores - Rack A</option>
                    <option value="wh-wip">Work In Progress Floor</option>
                    <option value="wh-fg">Finished Goods DC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-100">
              <button
                onClick={() => setIsQuickEntryOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Stock entry submitted! Stock Ledger & Bin balances updated.");
                  setIsQuickEntryOpen(false);
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
