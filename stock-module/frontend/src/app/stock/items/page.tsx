"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  Search,
  Home,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [items] = useState([
    {
      id: "item-cpu-01",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9 Octa-Core",
      group: "Electronics & Chips",
      uom: "Nos",
      valuationMethod: "FIFO",
      standardRate: 320.0,
      openingStock: 150,
      safetyStock: 25,
      hasSerial: true,
      hasBatch: false,
      barcode: "890123450001",
    },
    {
      id: "item-ram-02",
      itemCode: "ITEM-RAM-DDR5",
      itemName: "64GB DDR5 ECC Server Memory Module",
      group: "Electronics & Chips",
      uom: "Nos",
      valuationMethod: "FIFO",
      standardRate: 140.0,
      openingStock: 300,
      safetyStock: 50,
      hasSerial: false,
      hasBatch: true,
      barcode: "890123450002",
    },
    {
      id: "item-case-03",
      itemCode: "ITEM-SRV-CHASSIS",
      itemName: "4U Rackmount Server Chassis Aluminum",
      group: "Raw Materials",
      uom: "Nos",
      valuationMethod: "Moving Average",
      standardRate: 210.0,
      openingStock: 80,
      safetyStock: 15,
      hasSerial: false,
      hasBatch: false,
      barcode: "890123450003",
    },
    {
      id: "item-serv-04",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      group: "Finished Goods",
      uom: "Nos",
      valuationMethod: "FIFO",
      standardRate: 2850.0,
      openingStock: 45,
      safetyStock: 10,
      hasSerial: true,
      hasBatch: true,
      barcode: "890123450004",
    },
    {
      id: "item-box-05",
      itemCode: "ITEM-PACK-CORRUGATED",
      itemName: "Heavy Duty Corrugated Shipping Box 4U",
      group: "Consumables",
      uom: "Nos",
      valuationMethod: "Moving Average",
      standardRate: 8.5,
      openingStock: 500,
      safetyStock: 100,
      hasSerial: false,
      hasBatch: false,
      barcode: "890123450005",
    },
    {
      id: "item-cable-06",
      itemCode: "ITEM-SFP-FIBER",
      itemName: "100Gbps SFP28 Fiber Optic Patch Cable 5m",
      group: "Electronics & Chips",
      uom: "Nos",
      valuationMethod: "FIFO",
      standardRate: 45.0,
      openingStock: 220,
      safetyStock: 40,
      hasSerial: false,
      hasBatch: false,
      barcode: "890123450006",
    },
  ]);

  const filteredItems = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(search.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      i.group.toLowerCase().includes(search.toLowerCase())
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
            Items Catalog
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-2 space-y-3.5">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU code, item name, or category..."
              className="w-full bg-gray-50 border border-gray-200 rounded pl-8 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">{filteredItems.length} Items</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Item SKU & Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Stock UOM</th>
                  <th className="py-2 px-3">Valuation Method</th>
                  <th className="py-2 px-3 text-right font-mono">Standard Rate</th>
                  <th className="py-2 px-3 text-right font-mono">Safety Stock</th>
                  <th className="py-2 px-3 text-center">Tracking</th>
                  <th className="py-2 px-3.5 pr-4 text-right font-mono">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-3.5">
                      <p className="font-semibold text-gray-900">{item.itemName}</p>
                      <p className="text-[10px] font-mono text-teal-600 font-medium">{item.itemCode}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                        {item.group}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-600">{item.uom}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={item.valuationMethod} />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-gray-800">
                      {formatCurrency(item.standardRate)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-600">{item.safetyStock}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.hasSerial && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200">
                            SERIAL
                          </span>
                        )}
                        {item.hasBatch && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200">
                            BATCH
                          </span>
                        )}
                        {!item.hasSerial && !item.hasBatch && (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono text-[10px] text-gray-500">
                      {item.barcode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Item Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-xl w-full p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Create New Item SKU</h3>
                <p className="text-xs text-gray-500">Add an inventory product into the NextGen ERP catalog</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Item Code / SKU</label>
                <input
                  type="text"
                  placeholder="e.g. ITEM-GPU-RTX40"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. NVIDIA RTX 4090 GPU"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Category / Group</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option>Electronics & Chips</option>
                  <option>Raw Materials</option>
                  <option>Finished Goods</option>
                  <option>Consumables</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Valuation Method</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="FIFO">FIFO (First-In, First-Out)</option>
                  <option value="MOVING_AVERAGE">Moving Average</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Standard Cost ($)</label>
                <input
                  type="number"
                  placeholder="1500.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Safety Stock</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-100">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Item created successfully!");
                  setIsCreateOpen(false);
                }}
                className="px-3 py-1.5 rounded text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-2xs"
              >
                Save Item SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
