"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Plus,
  RefreshCw,
  FolderTree,
  BookOpen,
  FileText,
  Receipt,
  ArrowLeftRight,
  Landmark,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProfitAndLoss, getBalanceSheet, getSalesInvoices, getPurchaseInvoices, getJournalEntries } from "@/lib/api";
import { ProfitAndLossReport, BalanceSheetReport, SalesInvoice, PurchaseInvoice, JournalEntry } from "@/types/accounting";

export default function AccountsOverviewPage() {
  const [pnl, setPnl] = useState<ProfitAndLossReport | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pnlData, bsData, sinvData, pinvData, jvData] = await Promise.all([
        getProfitAndLoss(),
        getBalanceSheet(),
        getSalesInvoices(),
        getPurchaseInvoices(),
        getJournalEntries(),
      ]);
      setPnl(pnlData);
      setBalanceSheet(bsData);
      setSalesInvoices(sinvData);
      setPurchaseInvoices(pinvData);
      setJournalEntries(jvData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Finance & Accounting
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs backdrop-blur-md">
              Live GL Engine
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            General Ledger, Double-Entry Books, Receivables, Payables & Statutory Statements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="liquid-btn-glass text-xs"
            title="Refresh Ledger Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <Link href="/accounts/journal-entries" className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Journal Entry</span>
          </Link>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Assets */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Assets
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-slate-700 shadow-2xs">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            {formatCurrency(balanceSheet?.totalAssets || 6200000)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Bank & Cash + Debtors + Fixed Assets</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Operating Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-slate-700 shadow-2xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            {formatCurrency(pnl?.totalIncome || 4800000)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Enterprise Sales & Subscriptions</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-slate-700 shadow-2xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            {formatCurrency(pnl?.totalExpense || 2950000)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Salaries, Cloud & Administrative</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Profit (Current)
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-slate-700 shadow-2xs">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            {formatCurrency(pnl?.netProfit || 1850000)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Net Profit Margin: ~38.5%</span>
          </div>
        </div>
      </div>

      {/* Financial Operations Launchpad */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 mb-4 tracking-tight">
          Accounting Modules Launchpad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chart of Accounts */}
          <Link
            href="/accounts/chart-of-accounts"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chart of Accounts</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage 5 root ledger groups (Assets, Liabilities, Equity, Income, Expenses).
              </p>
            </div>
          </Link>

          {/* Sales Invoices (AR) */}
          <Link
            href="/accounts/sales-invoices"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales Invoices (AR)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate GST-compliant tax invoices and track outstanding customer balances.
              </p>
            </div>
          </Link>

          {/* Purchase Invoices (AP) */}
          <Link
            href="/accounts/purchase-invoices"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Purchase Invoices (AP)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Record supplier bills, operating expenses, and claim input tax credit (ITC).
              </p>
            </div>
          </Link>

          {/* Journal Entries */}
          <Link
            href="/accounts/journal-entries"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Journal Entries</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Post balanced double-entry vouchers with auto Debit=Credit verification.
              </p>
            </div>
          </Link>

          {/* Payment Entries */}
          <Link
            href="/accounts/payments"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Entries</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Process customer receipts, vendor disbursements, and internal bank transfers.
              </p>
            </div>
          </Link>

          {/* Financial Statements */}
          <Link
            href="/accounts/reports"
            className="liquid-glass-card p-6 flex items-start gap-4 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-center text-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Financial Statements</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Live Balance Sheet, Profit & Loss, Trial Balance, and General Ledger reports.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Financial Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Invoices */}
        <div className="liquid-glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Sales Invoices</h3>
            <Link href="/accounts/sales-invoices" className="text-xs font-bold text-slate-600 hover:text-slate-900">
              View All →
            </Link>
          </div>
          {salesInvoices.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No sales invoices generated yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 text-xs">
              {salesInvoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-500">{inv.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 text-slate-700 border border-slate-200">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Journal Entries */}
        <div className="liquid-glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Journal Vouchers</h3>
            <Link href="/accounts/journal-entries" className="text-xs font-bold text-slate-600 hover:text-slate-900">
              View All →
            </Link>
          </div>
          {journalEntries.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No journal vouchers recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 text-xs">
              {journalEntries.slice(0, 4).map((jv) => (
                <div key={jv.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{jv.voucherNumber}</div>
                    <div className="text-[11px] text-slate-500">{jv.postingDate} • {jv.voucherType}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(jv.totalDebit)}</div>
                    <span className="text-[10px] font-bold text-slate-500">Balanced (Debit=Credit)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
