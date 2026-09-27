"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getProcurementMaterialRequests,
  createProcurementMaterialRequest,
} from "@/lib/api";

export default function MaterialRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("Stores - Central");
  const [supplierName, setSupplierName] = useState("");
  const [requisitionType, setRequisitionType] = useState("PURCHASE");
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 864000000).toISOString().split("T")[0]
  );
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("50");
  const [rate, setRate] = useState("2500");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getProcurementMaterialRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.requisitionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || r.requisitionType === filterType;
    return matchesSearch && matchesType;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemCode || !itemName) {
      alert("Please provide Item Code and Name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedQty = parseFloat(qty) || 1;
      const parsedRate = parseFloat(rate) || 0;

      await createProcurementMaterialRequest({
        customerName,
        supplierName: supplierName || "Open Market RFP",
        requisitionType,
        requiredDate,
        notes,
        items: [
          {
            itemCode,
            itemName,
            qty: parsedQty,
            rate: parsedRate,
            amount: parsedQty * parsedRate,
          },
        ],
      });

      setIsModalOpen(false);
      setItemCode("");
      setItemName("");
      setNotes("");
      setSuccessBanner("Material Request created successfully & broadcast for RFQ!");
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create Material Request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Material Requests (Requisitions)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Procurement Inward
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Internal purchase requisitions, manufacturing requirements &amp; stores stock transfers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="liquid-btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Material Request</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by requisition #, supplier, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Requisition Types</option>
            <option value="PURCHASE">Purchase (External Vendor)</option>
            <option value="MANUFACTURE">Manufacture (BOM Assembly)</option>
            <option value="MATERIAL_TRANSFER">Material Transfer</option>
            <option value="DROP_SHIP">Drop Shipping</option>
          </select>

          {(searchTerm || filterType) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Requisitions Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Requisition #</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Department / Stores</th>
              <th className="py-3 px-4">Target Supplier</th>
              <th className="py-3 px-4">Required Date</th>
              <th className="py-3 px-4 text-right">Total Qty</th>
              <th className="py-3 px-4 text-right">Est. Budget</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {req.requisitionNumber}
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {req.requisitionType}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-800">
                  {req.customerName || "Stores - Central"}
                </td>
                <td className="py-3 px-4 text-slate-800 font-semibold">
                  {req.supplierName || "Open Vendor RFP"}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {req.requiredDate || "—"}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  {req.totalQty || 1}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                  {formatCurrency(req.netTotal || 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === "SUBMITTED"
                        ? "bg-blue-100 text-blue-800"
                        : req.status === "ORDERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/sales/buying/quotations?req=${req.requisitionNumber}`}
                    className="px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Compare Quotes</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Create Material Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  New Material Requisition
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requisition Purpose *</label>
                  <select
                    value={requisitionType}
                    onChange={(e) => setRequisitionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="PURCHASE">Purchase (Vendor Inward)</option>
                    <option value="MANUFACTURE">Manufacture (BOM Build)</option>
                    <option value="MATERIAL_TRANSFER">Material Transfer</option>
                    <option value="DROP_SHIP">Customer Drop Ship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required By Date *</label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Stores</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Stores - Central"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Vendor (Optional)</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Apex Microelectronics"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="e.g. ITM-IOT-001"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Description *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. ARM Cortex-M4 Microcontroller IC"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Quantity</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Unit Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Reason for Demand</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Urgent inventory replenishment for Q3 production run"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="liquid-btn-glass text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-btn-primary text-xs"
                >
                  {isSubmitting ? "Creating..." : "Submit Material Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
