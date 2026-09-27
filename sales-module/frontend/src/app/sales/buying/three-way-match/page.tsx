"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShoppingCart,
  Boxes,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getPurchaseOrders,
  runThreeWayMatching,
  PurchaseOrder,
  ThreeWayMatchResult,
} from "@/lib/api";

function ThreeWayMatchContent() {
  const searchParams = useSearchParams();
  const initialPoNumber = searchParams?.get("po") || "";

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPoNumber, setSelectedPoNumber] = useState(initialPoNumber);
  const [auditResult, setAuditResult] = useState<ThreeWayMatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatingDiscrepancy, setSimulatingDiscrepancy] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedPoNumber) {
      loadAudit(selectedPoNumber);
    }
  }, [selectedPoNumber]);

  async function loadOrders() {
    setLoading(true);
    try {
      const pos = await getPurchaseOrders();
      setPurchaseOrders(pos);
      if (!selectedPoNumber && pos.length > 0) {
        setSelectedPoNumber(pos[0].poNumber);
      } else if (selectedPoNumber) {
        await loadAudit(selectedPoNumber);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAudit(poNum: string) {
    setLoading(true);
    try {
      const res = await runThreeWayMatching({ poNumber: poNum });
      setAuditResult(res);
      setSimulatingDiscrepancy(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSimulateDiscrepancy() {
    if (!auditResult) return;
    setSimulatingDiscrepancy(true);
    // Artificially inject an over-billing discrepancy to demonstrate automated financial defense
    const modifiedLines = auditResult.lineItems.map((line, idx) => {
      if (idx === 0) {
        const billed = line.receivedQty + 20; // 20 units over-billed
        const billedRate = line.orderedRate + 250; // ₹250 price inflation
        return {
          ...line,
          billedQty: billed,
          billedRate: billedRate,
          qtyVariance: 20,
          rateVariance: 250,
          amountVariance: 20 * billedRate + line.receivedQty * 250,
          lineStatus: "OVER_BILLED" as any,
          isToleranceExceeded: true,
        };
      }
      return line;
    });

    setAuditResult({
      ...auditResult,
      matchStatus: "BLOCKED_OVERBILLED",
      isApprovedForPayment: false,
      auditSummary:
        "CRITICAL AUDIT EXCEPTION: Vendor invoice charges for 100 units at ₹4,550/ea, but warehouse only received 80 units at contracted ₹4,300/ea. AP Payment BLOCKED.",
      lineItems: modifiedLines,
    });

    setActionSuccess("Injected Simulated Over-Billing to demonstrate automated AP Payment Hold!");
    setTimeout(() => setActionSuccess(null), 6000);
  }

  function handleApprovePayment() {
    setActionSuccess("AP Voucher released for disbursement. Transmitted to General Ledger!");
    setTimeout(() => setActionSuccess(null), 5000);
  }

  function handleIssueDebitNote() {
    setActionSuccess("Automated Vendor Debit Note generated for ₹106,000 variance!");
    setTimeout(() => setActionSuccess(null), 5000);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              3-Way Matching Auditor
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Accounts Payable Defense
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Reconciliation engine verifying Purchase Order $\leftrightarrow$ Inward Warehouse Receipt $\leftrightarrow$ Vendor Bill
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAudit(selectedPoNumber)}
            className="liquid-btn-glass text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Re-verify</span>
          </button>
          {!simulatingDiscrepancy ? (
            <button
              onClick={handleSimulateDiscrepancy}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Over-Billing Discrepancy</span>
            </button>
          ) : (
            <button
              onClick={() => loadAudit(selectedPoNumber)}
              className="liquid-btn-glass text-xs"
            >
              <span>Reset to Clean Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* PO Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-bold text-slate-700">Select Purchase Order:</label>
          <select
            value={selectedPoNumber}
            onChange={(e) => setSelectedPoNumber(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.poNumber}>
                {po.poNumber} — {po.supplierName} ({formatCurrency(po.grandTotal)})
              </option>
            ))}
          </select>
        </div>

        {auditResult && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Supplier: <strong className="text-slate-800">{auditResult.supplierName}</strong>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Order Date: <strong className="text-slate-800 font-mono">{auditResult.poDate}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3 Pillars Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: PO */}
        <div className="liquid-glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Pillar 1: Purchase Order
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Contract
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Document Ref:</span>
              <span className="font-mono font-bold text-slate-900">{auditResult?.poNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contract Total:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(auditResult?.poGrandTotal || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Legal Agreement:</span>
              <span className="font-semibold text-slate-700">Fixed Rate Schedule</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Purchase Receipt */}
        <div className="liquid-glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Pillar 2: Inward Receipt
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Physical Inward
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Document Ref:</span>
              <span className="font-mono font-bold text-slate-900">
                PR-2026-REC-01
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">QC Inspection:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Passed Tolerances
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Physical Custody:</span>
              <span className="font-semibold text-slate-700">Stores Warehouse</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Purchase Invoice */}
        <div className="liquid-glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Pillar 3: Vendor Invoice
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
              Accounts Payable
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Document Ref:</span>
              <span className="font-mono font-bold text-slate-900">
                PINV-VND-9921
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span
                className={`font-semibold ${
                  auditResult?.isApprovedForPayment
                    ? "text-emerald-600"
                    : "text-rose-600 font-bold"
                }`}
              >
                {auditResult?.isApprovedForPayment ? "Approved for Release" : "HELD BY AUDIT"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Disbursement Account:</span>
              <span className="font-semibold text-slate-700">HDFC Operating A/c</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Banner */}
      {auditResult && (
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            auditResult.isApprovedForPayment
              ? "bg-emerald-50/80 border-emerald-300"
              : "bg-rose-50/80 border-rose-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                auditResult.isApprovedForPayment
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {auditResult.isApprovedForPayment ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    auditResult.isApprovedForPayment
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-rose-200 text-rose-900"
                  }`}
                >
                  {auditResult.matchStatus}
                </span>
                <h3
                  className={`text-base font-extrabold ${
                    auditResult.isApprovedForPayment ? "text-emerald-900" : "text-rose-900"
                  }`}
                >
                  {auditResult.isApprovedForPayment
                    ? "3-Way Match Verification Approved"
                    : "Payment Hold Triggered (Discrepancy Detected)"}
                </h3>
              </div>
              <p
                className={`text-xs font-medium mt-1 ${
                  auditResult.isApprovedForPayment ? "text-emerald-800" : "text-rose-800"
                }`}
              >
                {auditResult.auditSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {auditResult.isApprovedForPayment ? (
              <button
                onClick={handleApprovePayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Authorize AP Payment</span>
              </button>
            ) : (
              <button
                onClick={handleIssueDebitNote}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Issue Vendor Debit Note</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discrepancy Breakdown Table */}
      <div className="liquid-glass-card p-6 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          Line-Item 3-Way Reconciliation Audit Grid
        </h3>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Code &amp; Name</th>
                <th className="py-3 px-4 text-right">PO Qty</th>
                <th className="py-3 px-4 text-right">Receipt Qty</th>
                <th className="py-3 px-4 text-right">Invoice Qty</th>
                <th className="py-3 px-4 text-right">PO Rate</th>
                <th className="py-3 px-4 text-right">Invoice Rate</th>
                <th className="py-3 px-4 text-right">Qty Variance</th>
                <th className="py-3 px-4 text-right">Price Variance</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {auditResult?.lineItems.map((line, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    line.isToleranceExceeded ? "bg-rose-50/40" : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{line.itemName}</div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {line.itemCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {line.orderedQty}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                    {line.receivedQty}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      line.billedQty > line.receivedQty ? "text-rose-600" : "text-slate-800"
                    }`}
                  >
                    {line.billedQty}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                    {formatCurrency(line.orderedRate)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      line.billedRate > line.orderedRate ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    {formatCurrency(line.billedRate)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {line.qtyVariance > 0 ? (
                      <span className="text-rose-600">+{line.qtyVariance} (Over)</span>
                    ) : (
                      <span className="text-emerald-600">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {line.rateVariance > 0 ? (
                      <span className="text-rose-600">+{formatCurrency(line.rateVariance)}</span>
                    ) : (
                      <span className="text-emerald-600">₹0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        line.lineStatus === "MATCHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {line.lineStatus}
                    </span>
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

export default function ThreeWayMatchPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading 3-Way Match Auditor...</div>}>
      <ThreeWayMatchContent />
    </React.Suspense>
  );
}
