"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Plus,
  Home,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  X,
  Boxes,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Warehouse,
  DollarSign,
  Scale,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface ReconciliationItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  currentQty: number;
  currentValuationRate: number;
  currentStockValue: number;
  physicalQty: number;
  valuationRate: number;
  diffQty: number;
  amountDifference: number;
}

interface StockReconciliation {
  id: string;
  reconciliationNumber: string;
  postingDate: string;
  postingTime: string;
  purpose: string;
  status: "DRAFT" | "SUBMITTED" | "CANCELLED";
  differenceAmount: number;
  expenseAccount: string;
  remarks: string;
  items: ReconciliationItem[];
}

const INITIAL_RECONCILIATIONS: StockReconciliation[] = [
  {
    id: "rec-001",
    reconciliationNumber: "REC-AUDIT-2026-001",
    postingDate: "2026-02-15",
    postingTime: "17:30:00",
    purpose: "Monthly Physical Cycle Count",
    status: "SUBMITTED",
    differenceAmount: -1280.0,
    expenseAccount: "Stock Adjustment - NC",
    remarks: "Warehouse aisle 4 barcode recount revealed minor memory module shrink and processor surplus.",
    items: [
      {
        id: "rci-101",
        itemId: "item-001",
        itemCode: "ITEM-RAM-DDR5",
        itemName: "64GB DDR5 ECC Server Memory Module",
        warehouseId: "wh-001",
        warehouseName: "Central Stores - Rack A",
        currentQty: 100,
        currentValuationRate: 140.0,
        currentStockValue: 14000.0,
        physicalQty: 90,
        valuationRate: 140.0,
        diffQty: -10,
        amountDifference: -1400.0,
      },
      {
        id: "rci-102",
        itemId: "item-002",
        itemCode: "ITEM-CPU-X9",
        itemName: "NextGen Core Processor X9 Octa-Core",
        warehouseId: "wh-001",
        warehouseName: "Central Stores - Rack A",
        currentQty: 150,
        currentValuationRate: 320.0,
        currentStockValue: 48000.0,
        physicalQty: 151,
        valuationRate: 320.0,
        diffQty: 1,
        amountDifference: 320.0,
      },
      {
        id: "rci-103",
        itemId: "item-003",
        itemCode: "ITEM-PWR-2000W",
        itemName: "Titanium Efficiency Power Supply 2000W",
        warehouseId: "wh-002",
        warehouseName: "Work In Progress Floor",
        currentQty: 25,
        currentValuationRate: 340.0,
        currentStockValue: 8500.0,
        physicalQty: 24,
        valuationRate: 340.0,
        diffQty: -1,
        amountDifference: -340.0,
      },
    ],
  },
  {
    id: "rec-002",
    reconciliationNumber: "REC-AUDIT-2026-002",
    postingDate: "2026-01-10",
    postingTime: "11:00:00",
    purpose: "Opening Balance Inventory Migration",
    status: "SUBMITTED",
    differenceAmount: 128250.0,
    expenseAccount: "Temporary Opening Stock Offset - NC",
    remarks: "Initial migration audit for Enterprise Rack Servers in Finished Goods DC.",
    items: [
      {
        id: "rci-104",
        itemId: "item-004",
        itemCode: "ITEM-SRV-ENTERPRISE",
        itemName: "NextGen AI Enterprise Rack Server 4U",
        warehouseId: "wh-003",
        warehouseName: "Finished Goods Distribution Center",
        currentQty: 0,
        currentValuationRate: 2850.0,
        currentStockValue: 0.0,
        physicalQty: 45,
        valuationRate: 2850.0,
        diffQty: 45,
        amountDifference: 128250.0,
      },
    ],
  },
];

export default function StockReconciliationPage() {
  const [reconciliations, setReconciliations] = useState<StockReconciliation[]>(INITIAL_RECONCILIATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<StockReconciliation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [purpose, setPurpose] = useState("Physical Cycle Count");
  const [expenseAccount, setExpenseAccount] = useState("Stock Adjustment - NC");
  const [remarks, setRemarks] = useState("");

  const [auditLines, setAuditLines] = useState([
    {
      itemCode: "ITEM-SRV-ENTERPRISE",
      itemName: "NextGen AI Enterprise Rack Server 4U",
      warehouseName: "Finished Goods Distribution Center",
      warehouseId: "wh-003",
      currentQty: 45,
      valuationRate: 2850.0,
      physicalQty: 44,
    },
    {
      itemCode: "ITEM-GPU-H100",
      itemName: "NextGen High-Density GPU Accelerator 80GB",
      warehouseName: "Central Stores - Rack A",
      warehouseId: "wh-001",
      currentQty: 10,
      valuationRate: 11500.0,
      physicalQty: 10,
    },
    {
      itemCode: "ITEM-RAM-DDR5",
      itemName: "64GB DDR5 ECC Server Memory Module",
      warehouseName: "Central Stores - Rack A",
      warehouseId: "wh-001",
      currentQty: 90,
      valuationRate: 140.0,
      physicalQty: 92,
    },
  ]);

  // Derived calculations for Modal
  const previewLines = auditLines.map((line) => {
    const diffQty = line.physicalQty - line.currentQty;
    const amountDiff = diffQty * line.valuationRate;
    return { ...line, diffQty, amountDiff };
  });

  const totalNetAdjustment = previewLines.reduce((acc, l) => acc + l.amountDiff, 0);

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAudit: StockReconciliation = {
      id: `rec-${Date.now()}`,
      reconciliationNumber: `REC-AUDIT-2026-${String(reconciliations.length + 1).padStart(3, "0")}`,
      postingDate: new Date().toISOString().split("T")[0],
      postingTime: new Date().toTimeString().split(" ")[0],
      purpose,
      status: "SUBMITTED",
      differenceAmount: totalNetAdjustment,
      expenseAccount,
      remarks: remarks || "Floor cycle count reconciliation adjustment",
      items: previewLines.map((pl, idx) => ({
        id: `rci-${Date.now()}-${idx}`,
        itemId: `item-gen-${idx}`,
        itemCode: pl.itemCode,
        itemName: pl.itemName,
        warehouseId: pl.warehouseId,
        warehouseName: pl.warehouseName,
        currentQty: pl.currentQty,
        currentValuationRate: pl.valuationRate,
        currentStockValue: pl.currentQty * pl.valuationRate,
        physicalQty: pl.physicalQty,
        valuationRate: pl.valuationRate,
        diffQty: pl.diffQty,
        amountDifference: pl.amountDiff,
      })),
    };

    setReconciliations([newAudit, ...reconciliations]);
    setIsModalOpen(false);
    setSelectedAudit(newAudit);
  };

  const filteredReconciliations = reconciliations.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.reconciliationNumber.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q) ||
      r.remarks.toLowerCase().includes(q)
    );
  });

  // Top Metrics
  const totalAudits = reconciliations.length;
  const netVarianceSum = reconciliations.reduce((acc, r) => acc + r.differenceAmount, 0);
  const totalAdjustedBins = reconciliations.reduce((acc, r) => acc + r.items.length, 0);

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top Breadcrumb Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/stock" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/stock" className="text-gray-500 hover:text-gray-900">
            Stock Workspace
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">Stock Reconciliation & Physical Audits</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Stock Reconciliation</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Module Header Description */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-600" />
              Stock Reconciliation & Cycle Count Auditing
            </h1>
            <p className="text-gray-500 text-xs mt-1 max-w-3xl">
              Align physical warehouse floor counts with perpetual inventory ledger records. Post surplus receipts or
              shortage write-offs directly to the general ledger and realign real-time bin valuations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-200">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              Perpetual Balance Calibration
            </Badge>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Total Audits</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{totalAudits} Audits</div>
            <div className="text-[11px] text-gray-400 mt-1">Submitted & posted to GL</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Net Valuation Adjustment</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div
              className={`text-xl font-bold ${
                netVarianceSum >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {netVarianceSum >= 0 ? `+${formatCurrency(netVarianceSum)}` : formatCurrency(netVarianceSum)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Charged to Stock Adjustment</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Reconciled Bin Locations</span>
              <Warehouse className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{totalAdjustedBins} Bin Entries</div>
            <div className="text-[11px] text-gray-400 mt-1">Physical vs system verification</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Audit Integrity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">Double-Entry Verified</div>
            <div className="text-[11px] text-gray-400 mt-1">Immutable SLE records logged</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit #, purpose, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredReconciliations.length}</span> audit records
          </div>
        </div>

        {/* Reconciliations Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Audit Number</th>
                <th className="py-2.5 px-4">Audit Purpose</th>
                <th className="py-2.5 px-4">Posting Date & Time</th>
                <th className="py-2.5 px-4">Expense Account</th>
                <th className="py-2.5 px-4 text-right">Net Value Adjustment</th>
                <th className="py-2.5 px-4 text-center">Items Audited</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
              {filteredReconciliations.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedAudit(rec)}
                >
                  <td className="py-3 px-4 font-bold text-teal-700 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{rec.reconciliationNumber}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{rec.purpose}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {rec.postingDate} <span className="text-[11px] text-gray-400">{rec.postingTime}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{rec.expenseAccount}</td>
                  <td
                    className={`py-3 px-4 text-right font-bold font-mono ${
                      rec.differenceAmount < 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {rec.differenceAmount < 0
                      ? `-${formatCurrency(Math.abs(rec.differenceAmount))}`
                      : `+${formatCurrency(rec.differenceAmount)}`}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">
                    {rec.items.length} items
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedAudit(rec)}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                    >
                      View Discrepancies
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReconciliations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No Stock Reconciliation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal / Drawer */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {selectedAudit.reconciliationNumber}
                    <StatusBadge status={selectedAudit.status} />
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedAudit.purpose} | Posting Date: {selectedAudit.postingDate} | Expense Account:{" "}
                    {selectedAudit.expenseAccount}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Remarks */}
              {selectedAudit.remarks && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-700">
                  <span className="font-semibold text-gray-900">Audit Notes: </span>
                  {selectedAudit.remarks}
                </div>
              )}

              {/* Discrepancy Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-teal-600" />
                  Physical Count vs System Inventory Balances
                </h4>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Item Code & Name</th>
                        <th className="py-2.5 px-3">Warehouse Location</th>
                        <th className="py-2.5 px-3 text-right">System Qty</th>
                        <th className="py-2.5 px-3 text-right font-bold text-gray-900">Physical Count</th>
                        <th className="py-2.5 px-3 text-center">Variance Qty</th>
                        <th className="py-2.5 px-3 text-right">Valuation Rate</th>
                        <th className="py-2.5 px-3 text-right">Net Adjustment ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {selectedAudit.items.map((it) => (
                        <tr key={it.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-gray-900">{it.itemCode}</div>
                            <div className="text-[11px] text-gray-500">{it.itemName}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-700">{it.warehouseName}</td>
                          <td className="py-2.5 px-3 text-right text-gray-600">{it.currentQty}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">{it.physicalQty}</td>
                          <td className="py-2.5 px-3 text-center">
                            {it.diffQty === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                                0 Match
                              </span>
                            ) : it.diffQty > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                +{it.diffQty} Surplus
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                {it.diffQty} Shortage
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-600">
                            {formatCurrency(it.valuationRate)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              it.amountDifference < 0
                                ? "text-rose-600"
                                : it.amountDifference > 0
                                ? "text-emerald-600"
                                : "text-gray-500"
                            }`}
                          >
                            {it.amountDifference < 0
                              ? `-${formatCurrency(Math.abs(it.amountDifference))}`
                              : `+${formatCurrency(it.amountDifference)}`}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-gray-200">
                        <td colSpan={6} className="py-2.5 px-3 text-right text-gray-700">
                          Total Valuation Adjustment Charged to GL:
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono ${
                            selectedAudit.differenceAmount < 0 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {selectedAudit.differenceAmount < 0
                            ? `-${formatCurrency(Math.abs(selectedAudit.differenceAmount))}`
                            : `+${formatCurrency(selectedAudit.differenceAmount)}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Double-entry entries have been written to `tabStock Ledger Entry` and realigned in `tabBin`.
              </span>
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Stock Reconciliation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-900 text-sm">Create New Stock Reconciliation Audit</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Header Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Reconciliation Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                    >
                      <option value="Physical Cycle Count">Physical Cycle Count</option>
                      <option value="Annual Physical Audit">Annual Physical Inventory Count</option>
                      <option value="Opening Stock Migration">Opening Stock Balance Setup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Expense Account (Variance)</label>
                    <input
                      type="text"
                      value={expenseAccount}
                      onChange={(e) => setExpenseAccount(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Audit Remarks / Justification</label>
                  <input
                    type="text"
                    placeholder="e.g. End of month physical recount for Central Stores aisle 2"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white"
                  />
                </div>

                {/* Items Physical Recount Input Sheet */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-teal-600" />
                      Physical Count Entry & Live Variance Verification
                    </h4>
                    <span className="font-bold text-gray-700">
                      Net Adjustment:{" "}
                      <span className={totalNetAdjustment < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {totalNetAdjustment < 0
                          ? `-${formatCurrency(Math.abs(totalNetAdjustment))}`
                          : `+${formatCurrency(totalNetAdjustment)}`}
                      </span>
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                          <th className="py-2 px-3">Item SKU & Name</th>
                          <th className="py-2 px-3">Warehouse Location</th>
                          <th className="py-2 px-3 text-right">System Qty</th>
                          <th className="py-2 px-3 text-right font-bold text-gray-900">Physical Actual Count</th>
                          <th className="py-2 px-3 text-center">Variance Qty</th>
                          <th className="py-2 px-3 text-right">Net Difference ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewLines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-gray-900">{line.itemCode}</div>
                              <div className="text-[11px] text-gray-500">{line.itemName}</div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-700">{line.warehouseName}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-gray-600">{line.currentQty}</td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={line.physicalQty}
                                onChange={(e) => {
                                  const updated = [...auditLines];
                                  updated[idx].physicalQty = parseInt(e.target.value) || 0;
                                  setAuditLines(updated);
                                }}
                                className="w-24 p-1 border border-gray-200 rounded text-right font-bold text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {line.diffQty === 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                                  Match
                                </span>
                              ) : line.diffQty > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  +{line.diffQty} Surplus
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  {line.diffQty} Shortage
                                </span>
                              )}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono font-bold ${
                                line.amountDiff < 0
                                  ? "text-rose-600"
                                  : line.amountDiff > 0
                                  ? "text-emerald-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {line.amountDiff < 0
                                ? `-${formatCurrency(Math.abs(line.amountDiff))}`
                                : `+${formatCurrency(line.amountDiff)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  Submitting will create immutable Stock Ledger entries adjusting the bin balances to match physical counts.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded font-semibold text-xs shadow-xs transition-colors"
                  >
                    Submit Reconciliation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
