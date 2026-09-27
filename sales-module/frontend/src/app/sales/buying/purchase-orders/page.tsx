"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  Scale,
  Calendar,
  Building2,
  Eye,
  Clock,
  Check,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  PurchaseOrder,
} from "@/lib/api";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Form State
  const [supplierName, setSupplierName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [itemCode, setItemCode] = useState("ITM-IOT-001");
  const [itemName, setItemName] = useState("ARM Cortex-M4 Microcontroller IC");
  const [qty, setQty] = useState("100");
  const [rate, setRate] = useState("4300");
  const [targetWarehouse, setTargetWarehouse] = useState("Stores - Primary");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierName) {
      alert("Please provide Supplier Name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedQty = parseFloat(qty) || 1;
      const parsedRate = parseFloat(rate) || 0;

      await createPurchaseOrder({
        supplierName,
        deliveryDate,
        targetWarehouse,
        paymentTerms,
        notes,
        items: [
          {
            itemCode,
            itemName,
            qty: parsedQty,
            receivedQty: 0,
            billedQty: 0,
            uom: "Nos",
            rate: parsedRate,
            amount: parsedQty * parsedRate,
            targetWarehouse,
          },
        ],
      });

      setIsModalOpen(false);
      setSupplierName("");
      setNotes("");
      setSuccessBanner("Purchase Order created and issued to vendor successfully!");
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create Purchase Order.");
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
              Purchase Orders (PO)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
              Procurement Core
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Vendor contracts, delivery schedules, fulfillment receipt tracking &amp; 3-way matching
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
            <span>Create Purchase Order</span>
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
            placeholder="Search by PO #, supplier, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All PO Statuses</option>
            <option value="TO_RECEIVE_AND_BILL">To Receive &amp; Bill</option>
            <option value="TO_RECEIVE">To Receive (Pending Goods)</option>
            <option value="TO_BILL">To Bill (Pending Invoice)</option>
            <option value="COMPLETED">Completed</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* PO Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">PO Number</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4">Delivery Date</th>
              <th className="py-3 px-4 text-right">Grand Total (₹)</th>
              <th className="py-3 px-4 text-center">Receipt Status</th>
              <th className="py-3 px-4 text-center">Billing Status</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredOrders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {po.poNumber}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-800">{po.supplierName}</div>
                  <span className="text-[10px] text-slate-400">
                    Warehouse: {po.targetWarehouse || "Stores"}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {po.transactionDate}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {po.deliveryDate || "—"}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(po.grandTotal)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      po.receiptStatus === "Fully Received"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : po.receiptStatus === "Partly Received"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {po.receiptStatus || "Not Received"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      po.billingStatus === "Fully Billed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : po.billingStatus === "Partly Billed"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {po.billingStatus || "Not Billed"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      po.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : po.status === "TO_RECEIVE_AND_BILL"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {po.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedPo(po)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/sales/buying/three-way-match?po=${po.poNumber}`}
                      className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                      title="Run 3-Way Match Verification"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Match</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View PO Details Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-slate-800" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Purchase Order: {selectedPo.poNumber}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedPo.supplierName} • {selectedPo.transactionDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Warehouse</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPo.targetWarehouse || "Stores - Primary"}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Payment Terms</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPo.paymentTerms}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Delivery Expected</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPo.deliveryDate || "Standard"}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-2">Order Line Items:</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3 text-right">Ordered</th>
                        <th className="py-2 px-3 text-right">Received</th>
                        <th className="py-2 px-3 text-right">Billed</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPo.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-900">{it.itemName}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{it.qty}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-600">{it.receivedQty || 0}</td>
                          <td className="py-2 px-3 text-right font-mono text-blue-600">{it.billedQty || 0}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.rate)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{formatCurrency(it.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-slate-500">Includes 18% GST (₹{formatCurrency(selectedPo.taxAmount)})</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Grand Total</span>
                  <span className="text-lg font-black font-mono text-slate-900">{formatCurrency(selectedPo.grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  href={`/sales/buying/three-way-match?po=${selectedPo.poNumber}`}
                  className="liquid-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Verify 3-Way Match Audit</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Purchase Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">
                  New Purchase Order
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
                  <label className="block font-bold text-slate-700 mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Vanguard Component Supply"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Description</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agreed Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Stores Warehouse</label>
                  <input
                    type="text"
                    value={targetWarehouse}
                    onChange={(e) => setTargetWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Subject to physical inspection upon inward warehouse arrival"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                  {isSubmitting ? "Creating..." : "Issue Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
