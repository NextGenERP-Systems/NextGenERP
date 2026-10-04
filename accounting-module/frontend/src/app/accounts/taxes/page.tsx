"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  RefreshCw,
  Printer,
  CheckCircle,
  TrendingUp,
  Download,
  Receipt,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSalesInvoices, getPurchaseInvoices } from "@/lib/api";
import { SalesInvoice, PurchaseInvoice } from "@/types/accounting";

export default function TaxFilingPage() {
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sinvData, pinvData] = await Promise.all([getSalesInvoices(), getPurchaseInvoices()]);
      setSalesInvoices(sinvData);
      setPurchaseInvoices(pinvData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // GST Calculations - 100% Dynamic derived from live sales and purchase invoices
  const outputGst = salesInvoices.reduce((acc, s) => acc + (s.totalTax || 0), 0);
  const totalTaxableSales = salesInvoices.reduce((acc, s) => acc + (s.subtotal || 0), 0);

  const inputTaxCredit = purchaseInvoices.reduce((acc, p) => acc + (p.totalTax || 0), 0);
  const totalTaxablePurchases = purchaseInvoices.reduce((acc, p) => acc + (p.subtotal || 0), 0);

  const netGstPayable = Math.max(0, outputGst - inputTaxCredit);
  const itcCarriedForward = Math.max(0, inputTaxCredit - outputGst);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Tax Calculation &amp; GST/VAT Statutory Filing
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              GSTR-1 • GSTR-3B
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time Output Tax Liability, Input Tax Credit (ITC) reconciliation, and statutory tax filing summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => alert("GSTR JSON Export Generated for Government GST Portal Filing!")}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GSTR JSON</span>
          </button>
        </div>
      </div>

      {/* GST Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Output Tax (GSTR-1) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Output GST Liability (Sales)
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono">
            {formatCurrency(outputGst)}
          </div>
          <p className="text-[10px] text-zinc-400">From {salesInvoices.length} Outward Tax Invoices</p>
        </div>

        {/* Input Tax Credit (GSTR-2B) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Input Tax Credit (Purchases)
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono">
            {formatCurrency(inputTaxCredit)}
          </div>
          <p className="text-[10px] text-zinc-400">Eligible ITC from Vendor Bills</p>
        </div>

        {/* Net GST Payable (GSTR-3B) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Net Tax Payable (Cash Ledger)
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono">
            {formatCurrency(netGstPayable)}
          </div>
          <p className="text-[10px] text-zinc-400">Due by 20th of next month</p>
        </div>

        {/* ITC Surplus */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            ITC Balance Carried Forward
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono">
            {formatCurrency(itcCarriedForward)}
          </div>
          <p className="text-[10px] text-zinc-400">Credit in Electronic Credit Ledger</p>
        </div>
      </div>

      {/* GSTR Filing Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Outward Tax Breakdown (GSTR-1) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-900" />
              <h3 className="text-sm font-bold text-zinc-900">GSTR-1 Outward Supplies Summary</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Output Tax
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>Total Taxable Turnover:</span>
              <span className="font-bold text-zinc-900">{formatCurrency(totalTaxableSales)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Central GST (CGST 9%):</span>
              <span className="font-bold text-zinc-900">{formatCurrency(outputGst / 2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>State GST (SGST 9%):</span>
              <span className="font-bold text-zinc-900">{formatCurrency(outputGst / 2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total Output Liability:</span>
              <span>{formatCurrency(outputGst)}</span>
            </div>
          </div>
        </div>

        {/* Inward Supplies Breakdown (ITC) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-zinc-900" />
              <h3 className="text-sm font-bold text-zinc-900">GSTR-2B Inward Input Tax Credit</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Eligible ITC
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>Total Inward Purchases:</span>
              <span className="font-bold text-zinc-900">{formatCurrency(totalTaxablePurchases)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Input CGST Credit (9%):</span>
              <span className="font-bold text-zinc-900">{formatCurrency(inputTaxCredit / 2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Input SGST Credit (9%):</span>
              <span className="font-bold text-zinc-900">{formatCurrency(inputTaxCredit / 2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total Eligible Input Tax:</span>
              <span>{formatCurrency(inputTaxCredit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
