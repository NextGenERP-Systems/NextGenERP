"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Plus,
  Search,
  QrCode,
  Boxes,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  X,
  Warehouse,
  DollarSign,
  Tag,
  Clock,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface BatchItem {
  id: string;
  batchId: string;
  itemCode: string;
  itemName: string;
  mfgDate: string;
  expDate: string;
  qty: number;
  supplierBatch: string;
  status: "ACTIVE" | "EXPIRED" | "RECALLED";
}

interface SerialItem {
  id: string;
  serialNo: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  status: "ACTIVE" | "DELIVERED" | "EXPIRED" | "DEFECTIVE";
  rate: number;
  warranty: string;
}

const INITIAL_BATCHES: BatchItem[] = [
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
  {
    id: "batch-cpu-2026-02",
    batchId: "BATCH-CPU-X9-WAF2",
    itemCode: "ITEM-CPU-X9",
    itemName: "NextGen Core Processor X9 Octa-Core",
    mfgDate: "2026-01-20",
    expDate: "2029-01-20",
    qty: 150,
    supplierBatch: "TSMC-N3E-4402",
    status: "ACTIVE",
  },
];

const INITIAL_SERIALS: SerialItem[] = [
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
  {
    id: "sn-gpu-8001",
    serialNo: "SN-GPU-H100-001",
    itemCode: "ITEM-GPU-H100",
    itemName: "NextGen High-Density GPU Accelerator 80GB",
    warehouse: "Central Stores - Rack A",
    status: "ACTIVE",
    rate: 11500.0,
    warranty: "2029-06-30",
  },
];

export default function SerialBatchPage() {
  const [activeTab, setActiveTab] = useState<"batches" | "serials">("batches");
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [serials, setSerials] = useState<SerialItem[]>(INITIAL_SERIALS);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isNewSerialOpen, setIsNewSerialOpen] = useState(false);

  // New Batch Form State
  const [batchIdInput, setBatchIdInput] = useState("");
  const [batchItemCode, setBatchItemCode] = useState("ITEM-RAM-DDR5");
  const [batchItemName, setBatchItemName] = useState("64GB DDR5 ECC Server Memory Module");
  const [batchQty, setBatchQty] = useState(100);
  const [mfgDate, setMfgDate] = useState("2026-02-01");
  const [expDate, setExpDate] = useState("2029-02-01");
  const [supplierBatch, setSupplierBatch] = useState("MICRON-2026-B9");

  // New Serial Form State
  const [serialNoInput, setSerialNoInput] = useState("");
  const [serialItemCode, setSerialItemCode] = useState("ITEM-SRV-ENTERPRISE");
  const [serialItemName, setSerialItemName] = useState("NextGen AI Enterprise Rack Server 4U");
  const [serialWarehouse, setSerialWarehouse] = useState("Finished Goods Distribution Center");
  const [serialRate, setSerialRate] = useState(2850.0);
  const [warrantyDate, setWarrantyDate] = useState("2029-12-31");

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: BatchItem = {
      id: `batch-${Date.now()}`,
      batchId: batchIdInput || `BATCH-${Date.now().toString().slice(-6)}`,
      itemCode: batchItemCode,
      itemName: batchItemName,
      mfgDate,
      expDate,
      qty: batchQty,
      supplierBatch,
      status: "ACTIVE",
    };
    setBatches([newB, ...batches]);
    setIsNewBatchOpen(false);
    setBatchIdInput("");
  };

  const handleCreateSerial = (e: React.FormEvent) => {
    e.preventDefault();
    const newS: SerialItem = {
      id: `sn-${Date.now()}`,
      serialNo: serialNoInput || `SN-${Date.now().toString().slice(-6)}`,
      itemCode: serialItemCode,
      itemName: serialItemName,
      warehouse: serialWarehouse,
      rate: serialRate,
      warranty: warrantyDate,
      status: "ACTIVE",
    };
    setSerials([newS, ...serials]);
    setIsNewSerialOpen(false);
    setSerialNoInput("");
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.batchId.toLowerCase().includes(q) ||
      b.itemCode.toLowerCase().includes(q) ||
      b.supplierBatch.toLowerCase().includes(q)
    );
  });

  const filteredSerials = serials.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.serialNo.toLowerCase().includes(q) ||
      s.itemCode.toLowerCase().includes(q) ||
      s.warehouse.toLowerCase().includes(q)
    );
  });

  const totalBatchQty = batches.reduce((acc, b) => acc + b.qty, 0);

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
          <span className="font-bold text-gray-900">Serials & Batches</span>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "batches" ? (
            <button
              onClick={() => setIsNewBatchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Batch</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewSerialOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Serial No</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Module Header Description */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              Serial Numbers & Batch Lifecycle Traceability
            </h1>
            <p className="text-gray-500 text-xs mt-1 max-w-3xl">
              Track discrete assets by unique serial numbers or lot groups by batch numbers. Monitor manufacturing
              dates, expiry dates, supplier vendor lots, and warranty coverage across warehouse transactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Full Traceability Matrix
            </Badge>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Active Batches</span>
              <Boxes className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{batches.length} Batches</div>
            <div className="text-[11px] text-gray-400 mt-1">{totalBatchQty} total batch units tracked</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Active Serial Nos</span>
              <QrCode className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{serials.length} Tracked Units</div>
            <div className="text-[11px] text-teal-600 mt-1">100% Unique hardware IDs</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Warranty Protected</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-700">100% Coverage</div>
            <div className="text-[11px] text-gray-400 mt-1">Direct linkage to maintenance AMC</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium">Expiration Status</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">0 Expired</div>
            <div className="text-[11px] text-gray-400 mt-1">All lots within shelf-life</div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("batches")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeTab === "batches"
                  ? "bg-[#1f272e] text-white shadow-2xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Inventory Batches ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab("serials")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeTab === "serials"
                  ? "bg-[#1f272e] text-white shadow-2xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Serial Numbers ({serials.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "batches" ? "batch ID or item..." : "serial no or warehouse..."}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Batches Table */}
        {activeTab === "batches" && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Batch Number</th>
                  <th className="py-2.5 px-4">Item SKU & Name</th>
                  <th className="py-2.5 px-4">Manufacturing Date</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4 text-right">Available Qty</th>
                  <th className="py-2.5 px-4">Supplier Lot Ref</th>
                  <th className="py-2.5 px-4 text-center">Batch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{b.batchId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{b.itemCode}</div>
                      <div className="text-[11px] text-gray-500">{b.itemName}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{b.mfgDate}</td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-700">{b.expDate}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-gray-900">{b.qty}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{b.supplierBatch}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No inventory batches match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Serials Table */}
        {activeTab === "serials" && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Serial Number</th>
                  <th className="py-2.5 px-4">Item SKU & Name</th>
                  <th className="py-2.5 px-4">Warehouse Location</th>
                  <th className="py-2.5 px-4 text-right">Purchase Unit Cost</th>
                  <th className="py-2.5 px-4">Warranty Expiry</th>
                  <th className="py-2.5 px-4 text-center">Asset Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredSerials.map((s) => (
                  <tr key={s.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{s.serialNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{s.itemCode}</div>
                      <div className="text-[11px] text-gray-500">{s.itemName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">{s.warehouse}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(s.rate)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{s.warranty}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
                {filteredSerials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No serial numbers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Batch Modal */}
      {isNewBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" />
                Create New Inventory Batch
              </h3>
              <button
                onClick={() => setIsNewBatchOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Batch Identification Number</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-RAM-2026-Q2"
                  value={batchIdInput}
                  onChange={(e) => setBatchIdInput(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded font-mono font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Item Code</label>
                  <input
                    type="text"
                    value={batchItemCode}
                    onChange={(e) => setBatchItemCode(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Batch Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={batchQty}
                    onChange={(e) => setBatchQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-gray-200 rounded text-right font-bold"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Supplier Lot / Vendor Batch Reference</label>
                <input
                  type="text"
                  value={supplierBatch}
                  onChange={(e) => setSupplierBatch(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded font-mono"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewBatchOpen(false)}
                  className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded font-semibold text-xs shadow-xs transition-colors"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Serial Modal */}
      {isNewSerialOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-teal-600" />
                Register New Serial Number
              </h3>
              <button
                onClick={() => setIsNewSerialOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSerial} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Serial Number (Hardware Barcode)</label>
                <input
                  type="text"
                  placeholder="e.g. SN-SRV-AI-5002"
                  value={serialNoInput}
                  onChange={(e) => setSerialNoInput(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded font-mono font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Item Code</label>
                  <input
                    type="text"
                    value={serialItemCode}
                    onChange={(e) => setSerialItemCode(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Unit Valuation Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serialRate}
                    onChange={(e) => setSerialRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-200 rounded text-right font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Storage Warehouse Location</label>
                <input
                  type="text"
                  value={serialWarehouse}
                  onChange={(e) => setSerialWarehouse(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Warranty Expiry Date</label>
                <input
                  type="date"
                  value={warrantyDate}
                  onChange={(e) => setWarrantyDate(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded"
                  required
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewSerialOpen(false)}
                  className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1f272e] hover:bg-black text-white rounded font-semibold text-xs shadow-xs transition-colors"
                >
                  Register Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
