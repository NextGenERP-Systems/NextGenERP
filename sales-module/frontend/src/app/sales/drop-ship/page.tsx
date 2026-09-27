"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  CheckSquare,
  XCircle,
  Building2,
  User,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Home,
  X,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  getPurchaseRequisitions,
  getSalesOrders,
  createDropShipRequisitionFromSalesOrder,
  submitPurchaseRequisition,
  orderPurchaseRequisition,
  confirmPurchaseRequisitionDelivery,
  cancelPurchaseRequisition,
} from "@/lib/api";
import { PurchaseRequisition, SalesOrder } from "@/types/sales";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DropShipPage() {
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Detail Modal
  const [selectedReq, setSelectedReq] = useState<PurchaseRequisition | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Generate From Order Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, soData] = await Promise.all([
        getPurchaseRequisitions(),
        getSalesOrders(),
      ]);
      setRequisitions(reqData || []);
      setSalesOrders(soData || []);
    } catch (err) {
      console.error("Failed to load drop-ship data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert("Please choose a Sales Order to generate drop-ship purchase requisitions.");
      return;
    }
    setGenerating(true);
    try {
      const created = await createDropShipRequisitionFromSalesOrder(selectedOrderId);
      setIsGenerateOpen(false);
      setSelectedOrderId("");
      setActionSuccess(`Generated ${created.length} Drop Ship Requisition(s) successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to generate requisition: " + (err.message || err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (id: string, reqNum: string) => {
    try {
      await submitPurchaseRequisition(id);
      setActionSuccess(`Purchase Requisition ${reqNum} submitted to procurement!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit requisition");
    }
  };

  const handleOrder = async (id: string, reqNum: string) => {
    try {
      await orderPurchaseRequisition(id);
      setActionSuccess(`Drop-ship order confirmed with supplier for ${reqNum}!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to mark ordered");
    }
  };

  const handleConfirmDelivery = async (id: string, reqNum: string) => {
    try {
      await confirmPurchaseRequisitionDelivery(id);
      setActionSuccess(`Supplier direct delivery confirmed for ${reqNum}! Sales Order marked delivered.`);
      setTimeout(() => setActionSuccess(null), 5000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery");
    }
  };

  const handleCancel = async (id: string, reqNum: string) => {
    if (!confirm(`Are you sure you want to cancel ${reqNum}?`)) return;
    try {
      await cancelPurchaseRequisition(id);
      setActionSuccess(`Requisition ${reqNum} cancelled.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel requisition");
    }
  };

  const openDetail = (req: PurchaseRequisition) => {
    setSelectedReq(req);
    setIsDetailOpen(true);
  };

  const filteredRequisitions = requisitions.filter((r) => {
    const matchesSearch =
      r.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.salesOrderNumber && r.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = requisitions.reduce((acc, r) => acc + (Number(r.netTotal) || 0), 0);
  const activeCount = requisitions.filter((r) => r.status !== "DELIVERED" && r.status !== "CANCELLED").length;
  const inTransitCount = requisitions.filter((r) => r.status === "ORDERED").length;
  const deliveredCount = requisitions.filter((r) => r.status === "DELIVERED").length;

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">
            Drop Shipping & Supplier Purchase Requisitions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Generate Drop-Ship PO</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Drop Shipments</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{activeCount}</div>
          <div className="text-[11px] text-slate-500">{requisitions.length} Total Requisitions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">In-Transit from Supplier</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">{inTransitCount}</div>
          <div className="text-[11px] text-blue-600 font-medium">Supplier Dispatched to Customer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direct Delivered</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{deliveredCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Customer Received & Verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Drop Ship Procurement Volume</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium">Total Back-to-Back Purchase Value</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Requisition #, Order #, Customer, Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "DRAFT", "SUBMITTED", "ORDERED", "DELIVERED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Requisition #</th>
                <th className="py-3 px-4">Sales Order & Customer</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4 text-center">Items Qty</th>
                <th className="py-3 px-4 text-right">PO Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading purchase requisitions...</td>
                </tr>
              ) : filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No drop-ship purchase requisitions found.</td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <button onClick={() => openDetail(req)} className="hover:underline flex items-center gap-1">
                        <span>{req.requisitionNumber}</span>
                      </button>
                      <div className="text-[10px] text-slate-400 font-normal">{formatDate(req.transactionDate)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {req.salesOrderNumber ? (
                        <Link
                          href={`/sales/orders/${req.salesOrderNumber}`}
                          className="font-mono text-purple-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>{req.salesOrderNumber}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 font-mono">Direct PR</span>
                      )}
                      <div className="text-slate-900 font-semibold">{req.customerName || "Customer Destination"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{req.supplierName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {req.requiredDate ? formatDate(req.requiredDate) : "Standard"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {req.totalQty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(req.netTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          req.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : req.status === "ORDERED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : req.status === "SUBMITTED"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : req.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === "DRAFT" && (
                          <button
                            onClick={() => handleSubmit(req.id, req.requisitionNumber)}
                            className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Send className="h-3 w-3" />
                            <span>Submit</span>
                          </button>
                        )}
                        {req.status === "SUBMITTED" && (
                          <button
                            onClick={() => handleOrder(req.id, req.requisitionNumber)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Send PO</span>
                          </button>
                        )}
                        {req.status === "ORDERED" && (
                          <button
                            onClick={() => handleConfirmDelivery(req.id, req.requisitionNumber)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <CheckSquare className="h-3 w-3" />
                            <span>Confirm Delivery</span>
                          </button>
                        )}
                        <button
                          onClick={() => openDetail(req)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          View
                        </button>
                        {req.status !== "DELIVERED" && req.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancel(req.id, req.requisitionNumber)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Cancel Requisition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate From Sales Order Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <span>Auto-Generate Drop Ship Requisition</span>
              </h2>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Select a confirmed customer Sales Order containing items flagged for Drop Shipping (`delivered_by_supplier = true`).
              The system will automatically group the items by supplier and generate supplier purchase requisitions forwarding customer delivery addresses.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Sales Order *</label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium"
                >
                  <option value="">Select Sales Order...</option>
                  {salesOrders
                    .filter((so) => so.status !== "CANCELLED")
                    .map((so) => (
                      <option key={so.id} value={so.id}>
                        {so.orderNumber} - {so.customerName} ({formatCurrency(so.grandTotal)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
                  <span>Generate Purchase Requisitions</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requisition Detail Modal */}
      {isDetailOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Purchase Requisition: {selectedReq.requisitionNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedReq.status}
                  </span>
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Created {formatDate(selectedReq.transactionDate)} • Type: {selectedReq.requisitionType}
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Drop Ship Supplier</span>
                <div className="font-bold text-slate-800">{selectedReq.supplierName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination Customer</span>
                <div className="font-bold text-slate-800">{selectedReq.customerName}</div>
                {selectedReq.salesOrderNumber && (
                  <div className="text-[10px] text-purple-600 font-mono">Linked SO: {selectedReq.salesOrderNumber}</div>
                )}
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Customer Delivery Address</span>
                <div className="text-slate-700 font-medium">{selectedReq.shippingAddress || "Main Distribution Hub"}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Item Code & Name</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">PO Rate</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedReq.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-slate-800">{i.itemCode}</div>
                        <div className="text-slate-500 text-[11px]">{i.itemName}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{i.qty} {i.uom}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(i.rate)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(i.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-slate-500 font-medium text-xs">
                Total PO Value: <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedReq.netTotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
