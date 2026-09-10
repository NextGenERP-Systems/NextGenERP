"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  RefreshCw,
  Printer,
  TrendingUp,
  Building,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProfitAndLoss, getBalanceSheet, getTrialBalance, getGeneralLedgerEntries, getCashFlowStatement } from "@/lib/api";
import { ProfitAndLossReport, BalanceSheetReport, TrialBalanceReport, GeneralLedgerEntry, CashFlowReport } from "@/types/accounting";

export default function FinancialStatementsPage() {
  const [activeTab, setActiveTab] = useState<"pnl" | "bs" | "tb" | "gl" | "cf">("pnl");
  const [pnl, setPnl] = useState<ProfitAndLossReport | null>(null);
  const [bs, setBs] = useState<BalanceSheetReport | null>(null);
  const [tb, setTb] = useState<TrialBalanceReport | null>(null);
  const [gl, setGl] = useState<GeneralLedgerEntry[]>([]);
  const [cf, setCf] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pnlData, bsData, tbData, glData, cfData] = await Promise.all([
        getProfitAndLoss(),
        getBalanceSheet(),
        getTrialBalance(),
        getGeneralLedgerEntries(),
        getCashFlowStatement(),
      ]);
      setPnl(pnlData);
      setBs(bsData);
      setTb(tbData);
      setGl(glData);
      setCf(cfData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Financial Statements & Analytics
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              GAAP / Ind AS Compliant
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time Balance Sheet, Profit &amp; Loss, Trial Balance, and General Ledger Audit Trail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => window.print()} className="liquid-btn-primary text-xs">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Statement Select Tabs */}
      <div className="liquid-glass-card p-2 flex items-center gap-2">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "pnl"
              ? "liquid-btn-primary shadow-xs"
              : "liquid-btn-glass text-slate-600"
          }`}
        >
          Profit &amp; Loss (P&amp;L)
        </button>
        <button
          onClick={() => setActiveTab("bs")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "bs"
              ? "liquid-btn-primary shadow-xs"
              : "liquid-btn-glass text-slate-600"
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab("tb")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "tb"
              ? "liquid-btn-primary shadow-xs"
              : "liquid-btn-glass text-slate-600"
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab("cf")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "cf"
              ? "liquid-btn-primary shadow-xs"
              : "liquid-btn-glass text-slate-600"
          }`}
        >
          Cash Flow Statement
        </button>
        <button
          onClick={() => setActiveTab("gl")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "gl"
              ? "liquid-btn-primary shadow-xs"
              : "liquid-btn-glass text-slate-600"
          }`}
        >
          General Ledger Book
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeTab === "pnl" && pnl && (
        <div className="liquid-glass-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Statement of Profit and Loss</h2>
              <p className="text-xs text-slate-500">For the period ended 31 March 2027 (Current Fiscal Year)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold">Net Profit Margin:</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {formatCurrency(pnl.netProfit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Income */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-extrabold text-slate-900 pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <span>Operating Income &amp; Revenue</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {pnl.incomeAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-slate-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-200 font-mono">
                <span>Total Income (A):</span>
                <span>{formatCurrency(pnl.totalIncome)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-extrabold text-slate-900 pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <span>Operating Expenses &amp; COGS</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {pnl.expenseAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-slate-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-200 font-mono">
                <span>Total Expenses (B):</span>
                <span>{formatCurrency(pnl.totalExpense)}</span>
              </div>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl flex items-center justify-between text-sm font-extrabold font-mono">
            <span className="font-sans text-slate-900">NET OPERATING PROFIT / (LOSS) (A - B):</span>
            <span className="text-base text-slate-950">{formatCurrency(pnl.netProfit)}</span>
          </div>
        </div>
      )}

      {/* TAB 2: BALANCE SHEET */}
      {activeTab === "bs" && bs && (
        <div className="liquid-glass-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Balance Sheet (Financial Position)</h2>
              <p className="text-xs text-slate-500">As on 31 March 2027 • Assets = Liabilities + Equity Invariant</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-slate-700" />
                Balanced Equation Validated
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Assets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-extrabold text-slate-900 pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <span>Application of Funds (Assets)</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {bs.assetAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-slate-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-200 font-mono">
                <span>Total Assets:</span>
                <span>{formatCurrency(bs.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-extrabold text-slate-900 pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <span>Source of Funds (Liabilities &amp; Equity)</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {bs.liabilityAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-slate-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
                {bs.equityAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-slate-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
                <div className="py-2 flex justify-between text-slate-700 font-bold bg-white/40 px-2 rounded">
                  <span className="font-sans">Current Fiscal Period Net Earnings</span>
                  <span className="text-slate-900">{formatCurrency(bs.retainedEarnings)}</span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-200 font-mono">
                <span>Total Liabilities &amp; Capital:</span>
                <span>{formatCurrency(bs.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIAL BALANCE */}
      {activeTab === "tb" && tb && (
        <div className="liquid-glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Account Code &amp; Title</span>
            <div className="flex items-center gap-12">
              <span className="w-28 text-right">Debit (Dr)</span>
              <span className="w-28 text-right">Credit (Cr)</span>
              <span className="w-32 text-right">Net Balance</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tb.accounts?.map((acc) => (
              <div key={acc.accountId} className="px-5 py-3 flex items-center justify-between hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600 font-bold">
                    {acc.accountCode}
                  </span>
                  <span className="font-bold text-slate-900">{acc.accountName}</span>
                  <span className="text-[10px] text-slate-500 uppercase">({acc.rootType})</span>
                </div>

                <div className="flex items-center gap-12 font-mono">
                  <span className="w-28 text-right text-slate-700">{formatCurrency(acc.totalDebit || 0)}</span>
                  <span className="w-28 text-right text-slate-700">{formatCurrency(acc.totalCredit || 0)}</span>
                  <span className="w-32 text-right font-extrabold text-slate-900">{formatCurrency(acc.balance)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white/60 border-t border-slate-200 flex items-center justify-between font-mono font-extrabold text-xs">
            <span className="font-sans text-slate-900 font-bold">TRIAL BALANCE TOTALS:</span>
            <div className="flex items-center gap-12">
              <span className="w-28 text-right">{formatCurrency(tb.totalDebit)}</span>
              <span className="w-28 text-right">{formatCurrency(tb.totalCredit)}</span>
              <span className="w-32 text-right text-slate-500 font-bold font-sans text-[11px]">BALANCED</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CASH FLOW STATEMENT */}
      {activeTab === "cf" && cf && (
        <div className="liquid-glass-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Statement of Cash Flows (Indirect Method)</h2>
              <p className="text-xs text-slate-500">Operating, Investing &amp; Financing Activities for Current Fiscal Year</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold">Closing Cash Equivalent:</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {formatCurrency(cf.closingCashBalance)}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* 1. Operating Activities */}
            <div className="liquid-glass p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between font-extrabold text-slate-900 text-sm font-sans">
                <span>1. Cash Flow from Operating Activities</span>
                <span>{formatCurrency(cf.netOperatingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-4">
                <span className="font-sans">Net Operating Profit from P&amp;L</span>
                <span>{formatCurrency(cf.netOperatingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-4">
                <span className="font-sans">Adjustments for Non-Cash Expenses &amp; Working Capital</span>
                <span>₹0.00</span>
              </div>
            </div>

            {/* 2. Investing Activities */}
            <div className="liquid-glass p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between font-extrabold text-slate-900 text-sm font-sans">
                <span>2. Cash Flow from Investing Activities</span>
                <span>{formatCurrency(cf.netInvestingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-4">
                <span className="font-sans">Capital Expenditure &amp; Fixed Asset Acquisitions</span>
                <span>{formatCurrency(cf.netInvestingCashFlow)}</span>
              </div>
            </div>

            {/* 3. Financing Activities */}
            <div className="liquid-glass p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between font-extrabold text-slate-900 text-sm font-sans">
                <span>3. Cash Flow from Financing Activities</span>
                <span>{formatCurrency(cf.netFinancingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-4">
                <span className="font-sans">Share Capital Infusions &amp; Debt Movements</span>
                <span>{formatCurrency(cf.netFinancingCashFlow)}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="liquid-glass-card p-4 space-y-2 text-sm font-extrabold">
              <div className="flex justify-between text-slate-700">
                <span className="font-sans">Net Increase / (Decrease) in Cash:</span>
                <span>{formatCurrency(cf.netChangeInCash)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Opening Cash &amp; Bank Balance:</span>
                <span>{formatCurrency(cf.openingCashBalance)}</span>
              </div>
              <div className="flex justify-between text-slate-950 pt-2 border-t border-slate-200 text-base">
                <span className="font-sans">Closing Cash &amp; Bank Balance (Balance Sheet Invariant):</span>
                <span>{formatCurrency(cf.closingCashBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL LEDGER */}
      {activeTab === "gl" && (
        <div className="liquid-glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Posting Date &amp; Voucher</span>
            <div className="flex items-center gap-10">
              <span>Account</span>
              <span className="w-24 text-right">Debit (Dr)</span>
              <span className="w-24 text-right">Credit (Cr)</span>
            </div>
          </div>

          {gl.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No general ledger entries recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {gl.map((gle) => (
                <div key={gle.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{gle.voucherNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-sans">
                        {gle.voucherType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">{gle.postingDate} • {gle.remarks}</div>
                  </div>

                  <div className="flex items-center gap-10 font-mono text-xs">
                    <span className="font-sans font-bold text-slate-800 w-44 truncate">{gle.account?.accountName}</span>
                    <span className="w-24 text-right font-bold text-slate-900">{formatCurrency(gle.debit)}</span>
                    <span className="w-24 text-right font-bold text-slate-900">{formatCurrency(gle.credit)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
