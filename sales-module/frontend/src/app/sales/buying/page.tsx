"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Boxes,
  Scale,
  Plus,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingDown,
  Building2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getPurchaseOrders,
  getSupplierQuotations,
  getProcurementMaterialRequests,
  PurchaseOrder,
  SupplierQuotation,
} from "@/lib/api";

export default function BuyingDashboardPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pos, quotes, reqs] = await Promise.all([
        getPurchaseOrders(),
        getSupplierQuotations(),
        getProcurementMaterialRequests(),
      ]);
      setPurchaseOrders(pos);
      setQuotations(quotes);
      setMaterialRequests(reqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const totalPoSpend = purchaseOrders.reduce((s, p) => s + (p.grandTotal || 0), 0);
  const openPos = purchaseOrders.filter(
    (p) => p.status === "TO_RECEIVE_AND_BILL" || p.status === "SUBMITTED"
  );
  const completedPos = purchaseOrders.filter((p) => p.status === "COMPLETED");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Buying &amp; Procurement Hub
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              ERPNext Parity
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Material Requisitions, Supplier Quotation Comparison Matrix, Purchase Orders &amp; 3-Way Matching
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <Link
            href="/sales/buying/three-way-match"
            className="liquid-btn-glass text-xs flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>3-Way Match Tool</span>
          </Link>
          <Link
            href="/sales/buying/purchase-orders"
            className="liquid-btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Purchase Order</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="liquid-glass-card p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Procurement Spend
          </span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatCurrency(totalPoSpend)}
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Across {purchaseOrders.length} Purchase Orders
          </p>
        </div>

        <div className="liquid-glass-card p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Open POs (Pending Receipt/Bill)
          </span>
          <div className="text-2xl font-black font-mono text-amber-600">
            {openPos.length} Orders
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            {formatCurrency(openPos.reduce((s, p) => s + (p.grandTotal || 0), 0))} in pipeline
          </p>
        </div>

        <div className="liquid-glass-card p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Material Requisitions
          </span>
          <div className="text-2xl font-black font-mono text-blue-600">
            {materialRequests.length} Active
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            From Engineering &amp; Stores
          </p>
        </div>

        <div className="liquid-glass-card p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            3-Way Match Verification
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            100% Parity
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            PO vs Receipt vs Invoice Audited
          </p>
        </div>
      </div>

      {/* Feature Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/sales/buying/material-requests"
          className="liquid-glass-card p-6 space-y-3 hover:border-slate-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              <span>Material Requests</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Internal demand requisitions for Purchase, Manufacture, or Stores Material Transfer.
            </p>
          </div>
          <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>{materialRequests.length} Requisitions Active</span>
          </div>
        </Link>

        <Link
          href="/sales/buying/quotations"
          className="liquid-glass-card p-6 space-y-3 hover:border-slate-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors flex items-center justify-between">
              <span>Supplier Quotations &amp; Comparison</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Multi-supplier comparative evaluation matrix (rates, lead times, rating) with 1-click PO awarding.
            </p>
          </div>
          <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
            <span>{quotations.length} Quotes in Matrix</span>
          </div>
        </Link>

        <Link
          href="/sales/buying/three-way-match"
          className="liquid-glass-card p-6 space-y-3 hover:border-slate-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              <span>3-Way Matching Auditor</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Automated reconciliation of Purchase Order, Inward Receipt, and Vendor Invoice to prevent overbilling.
            </p>
          </div>
          <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span>Active Financial Defense</span>
          </div>
        </Link>
      </div>

      {/* Recent Purchase Orders Table */}
      <div className="liquid-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-extrabold text-slate-900">
              Active Purchase Orders
            </h2>
          </div>
          <Link
            href="/sales/buying/purchase-orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All ({purchaseOrders.length})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Receipt Status</th>
                <th className="py-3 px-4 text-center">Billing Status</th>
                <th className="py-3 px-4 text-center">PO Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchaseOrders.slice(0, 5).map((po) => (
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
                    <Link
                      href={`/sales/buying/three-way-match?po=${po.poNumber}`}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <Scale className="w-3 h-3" />
                      <span>3-Way Match</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
