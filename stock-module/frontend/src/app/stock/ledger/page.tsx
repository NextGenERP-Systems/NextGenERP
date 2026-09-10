"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Search,
  Home,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StockLedgerPage() {
  const [search, setSearch] = useState("");

  const ledgerEntries = [
    {
      id: "sle-003",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      warehouseName: "Finished Goods Distribution Center",
      postingDate: "2026-02-15",
      postingTime: "18:00:00",
      voucherType: "Stock Entry",
      voucherNo: "MFG-ENTRY-2026-003",
      actualQty: 45.0,
      qtyAfter: 45.0,
      incomingRate: 2850.0,
      valuationRate: 2850.0,
      stockValue: 128250.0,
      stockValueDiff: 128250.0,
      fiscalYear: "2026-2027",
    },
    {
      id: "sle-002",
      itemCode: "ITEM-RAM-DDR5",
      itemName: "64GB DDR5 ECC Server Memory Module",
      warehouseName: "Central Stores - Rack A",
      postingDate: "2026-02-02",
      postingTime: "11:15:00",
      voucherType: "Stock Entry",
      voucherNo: "MAT-REC-2026-002",
      actualQty: 300.0,
      qtyAfter: 300.0,
      incomingRate: 140.0,
      valuationRate: 140.0,
      stockValue: 42000.0,
      stockValueDiff: 42000.0,
      fiscalYear: "2026-2027",
    },
    {
      id: "sle-001",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9 Octa-Core",
      warehouseName: "Central Stores - Rack A",
      postingDate: "2026-02-01",
      postingTime: "10:00:00",
      voucherType: "Stock Entry",
      voucherNo: "MAT-REC-2026-001",
      actualQty: 150.0,
      qtyAfter: 150.0,
      incomingRate: 320.0,
      valuationRate: 320.0,
      stockValue: 48000.0,
      stockValueDiff: 48000.0,
      fiscalYear: "2026-2027",
    },
  ];

  const filtered = ledgerEntries.filter(
    (e) =>
      e.itemName.toLowerCase().includes(search.toLowerCase()) ||
      e.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
      e.warehouseName.toLowerCase().includes(search.toLowerCase())
  );

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
            Stock Ledger Entries (SLE)
          </span>
        </div>
      </div>

      <div className="px-6 py-2 space-y-3.5">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Voucher No, or Warehouse..."
              className="w-full bg-gray-50 border border-gray-200 rounded pl-8 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Posting Date & Time</th>
                  <th className="py-2 px-3">Voucher Reference</th>
                  <th className="py-2 px-3">Item SKU & Name</th>
                  <th className="py-2 px-3">Warehouse</th>
                  <th className="py-2 px-3 text-right">Qty Change</th>
                  <th className="py-2 px-3 text-right">Qty Balance</th>
                  <th className="py-2 px-3 text-right font-mono">Incoming Rate</th>
                  <th className="py-2 px-3 text-right font-mono">Valuation Rate</th>
                  <th className="py-2 px-3 text-right font-mono">Stock Value Impact</th>
                  <th className="py-2 px-3.5 text-right font-mono">Balance Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5">
                      <p className="font-medium text-gray-900 font-mono">{entry.postingDate}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{entry.postingTime}</p>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-teal-600 font-mono">{entry.voucherNo}</p>
                      <p className="text-[10px] text-gray-400">{entry.voucherType}</p>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-gray-900">{entry.itemName}</p>
                      <p className="text-[10px] font-mono text-gray-400">{entry.itemCode}</p>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-700">{entry.warehouseName}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                      +{entry.actualQty}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-gray-900">
                      {entry.qtyAfter}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-600">
                      {formatCurrency(entry.incomingRate)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-600">
                      {formatCurrency(entry.valuationRate)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                      +{formatCurrency(entry.stockValueDiff)}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(entry.stockValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
