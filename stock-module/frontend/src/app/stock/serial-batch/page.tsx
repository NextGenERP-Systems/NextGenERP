"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default function SerialBatchPage() {
  const [activeTab, setActiveTab] = useState<"batches" | "serials">("batches");

  const batches = [
    {
      id: "batch-ram-2026-01",
      batchId: "BATCH-RAM-2026-Q1",
      itemCode: "ITEM-RAM-DDR5",
      itemName: "64GB DDR5 ECC Server Memory Module",
      mfgDate: "2026-01-10",
      expDate: "2029-01-10",
      qty: 300,
      supplierBatch: "MICRON-US-9811",
      status: "ACTIVE",
    },
    {
      id: "batch-srv-2026-01",
      batchId: "BATCH-SRV-PROD-09",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      mfgDate: "2026-02-15",
      expDate: "2031-02-15",
      qty: 45,
      supplierBatch: "NG-PLANT-SF-01",
      status: "ACTIVE",
    },
  ];

  const serials = [
    {
      id: "sn-cpu-1001",
      serialNo: "SN-CPU-99001",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9 Octa-Core",
      warehouse: "Central Stores - Rack A",
      status: "ACTIVE",
      rate: 320.0,
      warranty: "2029-02-28",
    },
    {
      id: "sn-cpu-1002",
      serialNo: "SN-CPU-99002",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9 Octa-Core",
      warehouse: "Central Stores - Rack A",
      status: "ACTIVE",
      rate: 320.0,
      warranty: "2029-02-28",
    },
    {
      id: "sn-srv-2001",
      serialNo: "SN-SRV-AI-5001",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      warehouse: "Finished Goods Distribution Center",
      status: "ACTIVE",
      rate: 2850.0,
      warranty: "2030-01-15",
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
            Serials & Batches
          </span>
        </div>
      </div>

      <div className="px-6 py-2 space-y-3.5">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "batches"
                ? "bg-gray-900 text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Inventory Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab("serials")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "serials"
                ? "bg-gray-900 text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Serial Numbers ({serials.length})
          </button>
        </div>

        {/* Batches Table */}
        {activeTab === "batches" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Batch Number</th>
                  <th className="py-2 px-3">Item SKU & Name</th>
                  <th className="py-2 px-3">Mfg Date</th>
                  <th className="py-2 px-3">Expiry Date</th>
                  <th className="py-2 px-3 text-right font-mono">Batch Qty</th>
                  <th className="py-2 px-3">Supplier Batch</th>
                  <th className="py-2 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5 font-mono font-bold text-gray-900">{b.batchId}</td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-gray-900">{b.itemName}</p>
                      <p className="text-[10px] font-mono text-teal-600">{b.itemCode}</p>
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-600">{b.mfgDate}</td>
                    <td className="py-2 px-3 font-mono font-medium text-amber-700">{b.expDate}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">{b.qty}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{b.supplierBatch}</td>
                    <td className="py-2 px-3.5 text-center">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Serials Table */}
        {activeTab === "serials" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Serial Number</th>
                  <th className="py-2 px-3">Item SKU & Name</th>
                  <th className="py-2 px-3">Warehouse Location</th>
                  <th className="py-2 px-3 text-right font-mono">Unit Cost</th>
                  <th className="py-2 px-3 font-mono">Warranty Expiry</th>
                  <th className="py-2 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serials.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5 font-mono font-bold text-teal-600">{s.serialNo}</td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-gray-900">{s.itemName}</p>
                      <p className="text-[10px] font-mono text-gray-400">{s.itemCode}</p>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-700">{s.warehouse}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-gray-800">
                      {formatCurrency(s.rate)}
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-600">{s.warranty}</td>
                    <td className="py-2 px-3.5 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
