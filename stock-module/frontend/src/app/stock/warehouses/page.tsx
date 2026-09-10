"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Warehouse,
  Building2,
  Home,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WarehousesPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  const warehouses = [
    { id: "wh-main", name: "Central Stores - Rack A", type: "Stores", city: "San Francisco", totalVal: 120950, itemsCount: 5 },
    { id: "wh-wip", name: "Work In Progress Floor", type: "Work In Progress", city: "San Francisco", totalVal: 0, itemsCount: 0 },
    { id: "wh-fg", name: "Finished Goods Distribution Center", type: "Finished Goods", city: "San Jose", totalVal: 128250, itemsCount: 1 },
    { id: "wh-quar", name: "Quarantine & QC Inspection Bay", type: "Quarantine", city: "San Francisco", totalVal: 0, itemsCount: 0 },
    { id: "wh-transit", name: "In-Transit Fleet Warehouse", type: "Transit", city: "Oakland", totalVal: 0, itemsCount: 0 },
    { id: "wh-scrap", name: "Scrap & Defective Store", type: "Scrap", city: "San Francisco", totalVal: 0, itemsCount: 0 },
  ];

  const bins = [
    {
      id: "bin-1",
      itemCode: "ITEM-CPU-X9",
      itemName: "NextGen Core Processor X9 Octa-Core",
      warehouseName: "Central Stores - Rack A",
      actualQty: 150,
      orderedQty: 50,
      reservedQty: 20,
      projectedQty: 180,
      valRate: 320.0,
      stockValue: 48000.0,
    },
    {
      id: "bin-2",
      itemCode: "ITEM-RAM-DDR5",
      itemName: "64GB DDR5 ECC Server Memory Module",
      warehouseName: "Central Stores - Rack A",
      actualQty: 300,
      orderedQty: 100,
      reservedQty: 40,
      projectedQty: 360,
      valRate: 140.0,
      stockValue: 42000.0,
    },
    {
      id: "bin-3",
      itemCode: "ITEM-SRV-CHASSIS",
      itemName: "4U Rackmount Server Chassis Aluminum",
      warehouseName: "Central Stores - Rack A",
      actualQty: 80,
      orderedQty: 20,
      reservedQty: 10,
      projectedQty: 90,
      valRate: 210.0,
      stockValue: 16800.0,
    },
    {
      id: "bin-4",
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      warehouseName: "Finished Goods Distribution Center",
      actualQty: 45,
      orderedQty: 0,
      reservedQty: 12,
      projectedQty: 58,
      valRate: 2850.0,
      stockValue: 128250.0,
    },
    {
      id: "bin-5",
      itemCode: "ITEM-PACK-CORRUGATED",
      itemName: "Heavy Duty Corrugated Shipping Box 4U",
      warehouseName: "Central Stores - Rack A",
      actualQty: 500,
      orderedQty: 200,
      reservedQty: 50,
      projectedQty: 650,
      valRate: 8.5,
      stockValue: 4250.0,
    },
    {
      id: "bin-6",
      itemCode: "ITEM-SFP-FIBER",
      itemName: "100Gbps SFP28 Fiber Optic Patch Cable 5m",
      warehouseName: "Central Stores - Rack A",
      actualQty: 220,
      orderedQty: 50,
      reservedQty: 30,
      projectedQty: 240,
      valRate: 45.0,
      stockValue: 9900.0,
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
            Warehouses & Bins
          </span>
        </div>
      </div>

      <div className="px-6 py-2 space-y-4">
        {/* Warehouse Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouse(wh.name)}
              className={`bg-white border rounded-lg p-3.5 shadow-2xs cursor-pointer transition-all ${
                selectedWarehouse === wh.name
                  ? "ring-2 ring-gray-900 border-gray-900 bg-gray-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{wh.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{wh.city}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                  {wh.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400">Total Valuation</span>
                  <p className="font-mono font-bold text-gray-800">{formatCurrency(wh.totalVal)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Unique SKUs</span>
                  <p className="font-mono font-bold text-gray-800">{wh.itemsCount} Items</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Bins Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-gray-900">
                {selectedWarehouse ? `Bins in ${selectedWarehouse}` : "All Warehouse Bins (Real-time Cache)"}
              </h3>
              <p className="text-[11px] text-gray-500">
                Projected Qty = Actual + Ordered + Planned - Reserved
              </p>
            </div>
            {selectedWarehouse && (
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="text-xs text-teal-600 hover:underline font-semibold"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3.5">Item SKU & Name</th>
                  <th className="py-2 px-3">Warehouse</th>
                  <th className="py-2 px-3 text-right font-bold text-gray-800">Actual Qty</th>
                  <th className="py-2 px-3 text-right text-gray-400">Ordered Qty</th>
                  <th className="py-2 px-3 text-right text-amber-600">Reserved Qty</th>
                  <th className="py-2 px-3 text-right font-bold text-teal-700">Projected Qty</th>
                  <th className="py-2 px-3 text-right font-mono">Valuation Rate</th>
                  <th className="py-2 px-3.5 text-right font-mono">Total Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bins
                  .filter((b) => !selectedWarehouse || b.warehouseName === selectedWarehouse)
                  .map((bin) => (
                    <tr key={bin.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2 px-3.5">
                        <p className="font-semibold text-gray-900">{bin.itemName}</p>
                        <p className="text-[10px] font-mono text-teal-600">{bin.itemCode}</p>
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-700">{bin.warehouseName}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">{bin.actualQty}</td>
                      <td className="py-2 px-3 text-right font-mono text-gray-500">+{bin.orderedQty}</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-600">-{bin.reservedQty}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-teal-700 bg-teal-50/30">
                        {bin.projectedQty}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-600">{formatCurrency(bin.valRate)}</td>
                      <td className="py-2 px-3.5 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(bin.stockValue)}
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
