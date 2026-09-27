"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  Home,
  Truck,
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  FileCheck,
  Percent,
  X,
  ArrowRight,
  ShieldCheck,
  Layers,
  HelpCircle,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface LandedCostItem {
  id: string;
  receiptDocumentType: string;
  receiptDocumentId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
  amount: number;
  applicableCharges: number;
  newRate: number;
}

interface LandedCostTax {
  id: string;
  expenseAccount: string;
  description: string;
  amount: number;
}

interface LandedCostVoucher {
  id: string;
  voucherNumber: string;
  postingDate: string;
  distributeChargesBasedOn: "Amount" | "Qty" | "Distribute Manually";
  totalTaxesAndCharges: number;
  status: "DRAFT" | "SUBMITTED" | "CANCELLED";
  remarks: string;
  items: LandedCostItem[];
  taxes: LandedCostTax[];
}

const INITIAL_VOUCHERS: LandedCostVoucher[] = [
  {
    id: "lcv-001",
    voucherNumber: "LCV-2026-001",
    postingDate: "2026-02-18",
    distributeChargesBasedOn: "Amount",
    totalTaxesAndCharges: 4200.0,
    status: "SUBMITTED",
    remarks: "Air freight & customs duty absorption for European server chassis delivery",
    items: [
      {
        id: "lci-101",
        receiptDocumentType: "Purchase Receipt",
        receiptDocumentId: "PREC-2026-001",
        itemId: "item-001",
        itemCode: "ITEM-SRV-ENTERPRISE",
        itemName: "NextGen AI Enterprise Rack Server 4U",
        qty: 20,
        rate: 2850.0,
        amount: 57000.0,
        applicableCharges: 3185.0,
        newRate: 3009.25,
      },
      {
        id: "lci-102",
        receiptDocumentType: "Purchase Receipt",
        receiptDocumentId: "PREC-2026-001",
        itemId: "item-002",
        itemCode: "ITEM-RAM-DDR5",
        itemName: "64GB DDR5 ECC Server Memory Module",
        qty: 100,
        rate: 140.0,
        amount: 14000.0,
        applicableCharges: 1015.0,
        newRate: 150.15,
      },
    ],
    taxes: [
      {
        id: "lct-201",
        expenseAccount: "Freight & Shipping Charges - NC",
        description: "Express DHL Air Freight from Frankfurt Port",
        amount: 2800.0,
      },
      {
        id: "lct-202",
        expenseAccount: "Customs & Import Duties - NC",
        description: "Federal Import Tariff (Harmonized Code 8471.50)",
        amount: 1400.0,
      },
    ],
  },
  {
    id: "lcv-002",
    voucherNumber: "LCV-2026-002",
    postingDate: "2026-02-14",
    distributeChargesBasedOn: "Qty",
    totalTaxesAndCharges: 1850.0,
    status: "SUBMITTED",
    remarks: "Inland container haulage & dock handling for processor silicon wafers",
    items: [
      {
        id: "lci-103",
        receiptDocumentType: "Purchase Receipt",
        receiptDocumentId: "PREC-2026-002",
        itemId: "item-003",
        itemCode: "ITEM-CPU-X9",
        itemName: "NextGen Core Processor X9 Octa-Core",
        qty: 150,
        rate: 320.0,
        amount: 48000.0,
        applicableCharges: 1850.0,
        newRate: 332.33,
      },
    ],
    taxes: [
      {
        id: "lct-203",
        expenseAccount: "Port Handling & Drayage - NC",
        description: "Port of Long Beach crane offloading & transit insurance",
        amount: 1850.0,
      },
    ],
  },
];

export default function LandedCostVouchersPage() {
  const [vouchers, setVouchers] = useState<LandedCostVoucher[]>(INITIAL_VOUCHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<LandedCostVoucher | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Voucher Form State
  const [distributeBasis, setDistributeBasis] = useState<"Amount" | "Qty" | "Distribute Manually">("Amount");
  const [remarks, setRemarks] = useState("");
  const [receiptDocType, setReceiptDocType] = useState("Purchase Receipt");
  const [receiptDocId, setReceiptDocId] = useState("PREC-2026-003");

  const [formItems, setFormItems] = useState<
    Array<{ itemCode: string; itemName: string; qty: number; rate: number; applicableCharges?: number }>
  >([
    {
      itemCode: "ITEM-GPU-H100",
      itemName: "NextGen High-Density GPU Accelerator 80GB",
      qty: 10,
      rate: 11500.0,
      applicableCharges: 0,
    },
    {
      itemCode: "ITEM-PWR-2000W",
      itemName: "Titanium Efficiency Redundant Power Supply 2000W",
      qty: 40,
      rate: 340.0,
      applicableCharges: 0,
    },
  ]);

  const [formTaxes, setFormTaxes] = useState<Array<{ expenseAccount: string; description: string; amount: number }>>([
    {
      expenseAccount: "Freight & Shipping Charges - NC",
      description: "Air Cargo expedited shipping",
      amount: 3500.0,
    },
    {
      expenseAccount: "Customs & Import Duties - NC",
      description: "Port Import Tariff Clearance",
      amount: 1750.0,
    },
  ]);

  // Aggregate Metrics
  const totalChargesAbsorbed = vouchers.reduce((acc, v) => acc + v.totalTaxesAndCharges, 0);
  const totalValuatedItems = vouchers.reduce((acc, v) => acc + v.items.length, 0);

  // Calculation preview for New Voucher
  const newTotalTaxes = formTaxes.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const newTotalItemAmount = formItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const newTotalItemQty = formItems.reduce((acc, item) => acc + item.qty, 0);

  const previewItems = formItems.map((item) => {
    const itemAmount = item.qty * item.rate;
    let charges = 0;
    if (distributeBasis === "Qty" && newTotalItemQty > 0) {
      charges = Math.round(((newTotalTaxes * item.qty) / newTotalItemQty) * 100) / 100;
    } else if (distributeBasis === "Distribute Manually") {
      charges = Number(item.applicableCharges) || 0;
    } else if (newTotalItemAmount > 0) {
      // Default: "Amount"
      charges = Math.round(((newTotalTaxes * itemAmount) / newTotalItemAmount) * 100) / 100;
    }
    const newRate = item.qty > 0 ? Math.round(((itemAmount + charges) / item.qty) * 100) / 100 : item.rate;
    const markupPct = item.rate > 0 ? Math.round(((newRate - item.rate) / item.rate) * 1000) / 10 : 0;
    return { ...item, itemAmount, charges, newRate, markupPct };
  });

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher: LandedCostVoucher = {
      id: `lcv-${Date.now()}`,
      voucherNumber: `LCV-2026-${String(vouchers.length + 1).padStart(3, "0")}`,
      postingDate: new Date().toISOString().split("T")[0],
      distributeChargesBasedOn: distributeBasis,
      totalTaxesAndCharges: newTotalTaxes,
      status: "SUBMITTED",
      remarks: remarks || "Landed Cost cost absorption allocation",
      items: previewItems.map((pi, idx) => ({
        id: `lci-${Date.now()}-${idx}`,
        receiptDocumentType: receiptDocType,
        receiptDocumentId: receiptDocId,
        itemId: `item-gen-${idx}`,
        itemCode: pi.itemCode,
        itemName: pi.itemName,
        qty: pi.qty,
        rate: pi.rate,
        amount: pi.itemAmount,
        applicableCharges: pi.charges,
        newRate: pi.newRate,
      })),
      taxes: formTaxes.map((pt, idx) => ({
        id: `lct-${Date.now()}-${idx}`,
        expenseAccount: pt.expenseAccount,
        description: pt.description,
        amount: Number(pt.amount) || 0,
      })),
    };

    setVouchers([newVoucher, ...vouchers]);
    setIsCreateOpen(false);
    setSelectedVoucher(newVoucher);
  };

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.voucherNumber.toLowerCase().includes(q) ||
      v.remarks.toLowerCase().includes(q) ||
      v.items.some((i) => i.itemCode.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q))
    );
  });

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
          <span className="font-bold text-gray-900">Landed Cost Vouchers (LCV)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Landed Cost Voucher</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Module Header Description */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600" />
              Landed Cost Voucher (Cost Absorption Engine)
            </h1>
            <p className="text-gray-500 text-xs mt-1 max-w-3xl">
              Absorb extra freight, customs duties, port handling, and container drayage charges into inventory asset
              valuation without inflating supplier accounts payable. Automatically realigns moving average and FIFO queue rates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Perpetual Inventory Standard
            </Badge>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Total Charges Absorbed</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalChargesAbsorbed)}</div>
            <div className="text-[11px] text-gray-400 mt-1">Capitalized into asset inventory</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Submitted Vouchers</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{vouchers.length} Vouchers</div>
            <div className="text-[11px] text-blue-600 mt-1">100% GL & SLE Synchronized</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Valuated Item Lines</span>
              <Boxes className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{totalValuatedItems} Receipt Lines</div>
            <div className="text-[11px] text-gray-400 mt-1">Across Purchase Receipts & Entries</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Distribution Modes</span>
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">Amount / Qty / Manual</div>
            <div className="text-[11px] text-gray-400 mt-1">Proportional allocation rules</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search voucher #, item code, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredVouchers.length}</span> landed cost records
          </div>
        </div>

        {/* Landed Cost Vouchers Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Voucher No</th>
                <th className="py-2.5 px-4">Posting Date</th>
                <th className="py-2.5 px-4">Distribution Basis</th>
                <th className="py-2.5 px-4 text-right">Total Charges Absorbed</th>
                <th className="py-2.5 px-4">Items Valuated</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
              {filteredVouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedVoucher(voucher)}
                >
                  <td className="py-3 px-4 font-bold text-teal-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{voucher.voucherNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{voucher.postingDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      Based on {voucher.distributeChargesBasedOn}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 text-right">
                    {formatCurrency(voucher.totalTaxesAndCharges)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{voucher.items.length} items</span>
                      <span className="text-[11px] text-gray-400 truncate max-w-xs">
                        {voucher.items.map((i) => i.itemCode).join(", ")}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={voucher.status} />
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedVoucher(voucher)}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                    >
                      View Breakdown
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No Landed Cost Vouchers found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Detail Modal / Drawer */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {selectedVoucher.voucherNumber}
                    <StatusBadge status={selectedVoucher.status} />
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Posting Date: {selectedVoucher.postingDate} | Distribution: Based on{" "}
                    {selectedVoucher.distributeChargesBasedOn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Remarks Box */}
              {selectedVoucher.remarks && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                  <span className="font-semibold">Allocation Purpose: </span>
                  {selectedVoucher.remarks}
                </div>
              )}

              {/* Items Cost Absorption Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-teal-600" />
                  Inventory Inward Receipts & Re-valuated Item Rates
                </h4>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                        <th className="py-2 px-3">Receipt Ref</th>
                        <th className="py-2 px-3">Item Code & Name</th>
                        <th className="py-2 px-3 text-right">Received Qty</th>
                        <th className="py-2 px-3 text-right">Original Rate</th>
                        <th className="py-2 px-3 text-right">Base Amount</th>
                        <th className="py-2 px-3 text-right text-teal-700">Absorbed Charges</th>
                        <th className="py-2 px-3 text-right text-emerald-700 font-bold">New Valuation Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {selectedVoucher.items.map((item) => {
                        const markup = Math.round(((item.newRate - item.rate) / item.rate) * 1000) / 10;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-medium text-gray-700">{item.receiptDocumentId}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-gray-900">{item.itemCode}</div>
                              <div className="text-[11px] text-gray-500">{item.itemName}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium">{item.qty}</td>
                            <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                            <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(item.amount)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-teal-700">
                              +{formatCurrency(item.applicableCharges)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/50">
                              {formatCurrency(item.newRate)}
                              <span className="text-[10px] text-emerald-600 ml-1 font-normal">(+{markup}%)</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Taxes & Charges Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-teal-600" />
                  Freight, Customs & Drayage Charges Absorbed
                </h4>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                        <th className="py-2 px-3">Expense Account</th>
                        <th className="py-2 px-3">Charge Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {selectedVoucher.taxes.map((tax) => (
                        <tr key={tax.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-gray-800">{tax.expenseAccount}</td>
                          <td className="py-2.5 px-3 text-gray-600">{tax.description}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                            {formatCurrency(tax.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-gray-200">
                        <td colSpan={2} className="py-2.5 px-3 text-right text-gray-700">
                          Total Taxes & Charges Allocated:
                        </td>
                        <td className="py-2.5 px-3 text-right text-teal-700">
                          {formatCurrency(selectedVoucher.totalTaxesAndCharges)}
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
                Immutable Ledger: Re-valuation entries have been written to `tabStock Ledger Entry` and `tabBin`.
              </span>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Landed Cost Voucher Creator Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-900 text-sm">Create New Landed Cost Voucher</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Header Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Receipt Document Type</label>
                    <select
                      value={receiptDocType}
                      onChange={(e) => setReceiptDocType(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                    >
                      <option value="Purchase Receipt">Purchase Receipt</option>
                      <option value="Stock Entry">Stock Entry (Material Receipt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Receipt Document No</label>
                    <input
                      type="text"
                      value={receiptDocId}
                      onChange={(e) => setReceiptDocId(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Distribute Charges Based On</label>
                    <select
                      value={distributeBasis}
                      onChange={(e) => setDistributeBasis(e.target.value as any)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-bold text-teal-700"
                    >
                      <option value="Amount">Total Amount (Proportional Value)</option>
                      <option value="Qty">Total Quantity (Proportional Weight/Count)</option>
                      <option value="Distribute Manually">Distribute Manually (Explicit Override)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Remarks & Allocation Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Ocean freight container surcharge + customs import fee allocation"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white"
                  />
                </div>

                {/* Taxes & Charges Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-teal-600" />
                      Landed Charges & Taxes (To Be Absorbed)
                    </h4>
                    <span className="font-bold text-teal-700">Total Charges: {formatCurrency(newTotalTaxes)}</span>
                  </div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                          <th className="py-2 px-3">Expense Account</th>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3 text-right">Amount ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formTaxes.map((tax, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={tax.expenseAccount}
                                onChange={(e) => {
                                  const updated = [...formTaxes];
                                  updated[idx].expenseAccount = e.target.value;
                                  setFormTaxes(updated);
                                }}
                                className="w-full p-1 border border-gray-200 rounded text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={tax.description}
                                onChange={(e) => {
                                  const updated = [...formTaxes];
                                  updated[idx].description = e.target.value;
                                  setFormTaxes(updated);
                                }}
                                className="w-full p-1 border border-gray-200 rounded text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={tax.amount}
                                onChange={(e) => {
                                  const updated = [...formTaxes];
                                  updated[idx].amount = parseFloat(e.target.value) || 0;
                                  setFormTaxes(updated);
                                }}
                                className="w-28 p-1 border border-gray-200 rounded text-right font-bold text-xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Items & Live Proportional Absorption Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-teal-600" />
                      Live Absorption Calculation Preview
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      Based on {distributeBasis} | Total Base Amount: {formatCurrency(newTotalItemAmount)}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                          <th className="py-2 px-3">Item Code</th>
                          <th className="py-2 px-3 text-right">Qty</th>
                          <th className="py-2 px-3 text-right">Original Rate</th>
                          <th className="py-2 px-3 text-right">Base Amount</th>
                          <th className="py-2 px-3 text-right text-teal-700">Absorbed Charge</th>
                          <th className="py-2 px-3 text-right text-emerald-700 font-bold">New Landed Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewItems.map((pi, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-gray-900">{pi.itemCode}</div>
                              <div className="text-[11px] text-gray-500">{pi.itemName}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium">{pi.qty}</td>
                            <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(pi.rate)}</td>
                            <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(pi.itemAmount)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-teal-700">
                              +{formatCurrency(pi.charges)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/50">
                              {formatCurrency(pi.newRate)}
                              <span className="text-[10px] text-emerald-600 ml-1 font-normal">
                                (+{pi.markupPct}%)
                              </span>
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
                  Submitting will lock the voucher and post valuation adjustments to the stock ledger.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded font-semibold text-xs shadow-xs transition-colors"
                  >
                    Submit & Post Valuation
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
