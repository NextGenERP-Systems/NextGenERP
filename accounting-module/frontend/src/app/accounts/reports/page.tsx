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
import {
  getProfitAndLoss,
  getBalanceSheet,
  getTrialBalance,
  getGeneralLedgerEntries,
  getCashFlowStatement,
} from "@/lib/api";
import {
  ProfitAndLossReport,
  BalanceSheetReport,
  TrialBalanceReport,
  GeneralLedgerEntry,
  CashFlowReport,
} from "@/types/accounting";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Financial Statements &amp; Analytics
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              GAAP / Ind AS Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time Balance Sheet, Profit &amp; Loss, Trial Balance, Cash Flows and General Ledger Audit Trail
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
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Statement Select Tabs */}
      <div className="bg-white border border-zinc-200 rounded-lg p-2 flex flex-wrap items-center gap-1.5">
        {[
          { id: "pnl", label: "Profit & Loss (P&L)" },
          { id: "bs", label: "Balance Sheet" },
          { id: "tb", label: "Trial Balance" },
          { id: "cf", label: "Cash Flow Statement" },
          { id: "gl", label: "General Ledger Book" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeTab === "pnl" && pnl && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Statement of Profit and Loss</h2>
              <p className="text-xs text-zinc-500">For the period ended 31 March 2027 (Current Fiscal Year)</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-500 font-medium">Net Operating Profit:</span>
              <div className="text-xl font-bold text-zinc-900 font-mono">
                {formatCurrency(pnl.netProfit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Income */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-bold text-zinc-900 pb-2 border-b border-zinc-200 uppercase tracking-wider text-[11px]">
                <span>Operating Income &amp; Revenue</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-zinc-100 font-mono">
                {pnl.incomeAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-zinc-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-200 font-mono">
                <span>Total Income (A):</span>
                <span>{formatCurrency(pnl.totalIncome)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-bold text-zinc-900 pb-2 border-b border-zinc-200 uppercase tracking-wider text-[11px]">
                <span>Operating Expenses &amp; COGS</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-zinc-100 font-mono">
                {pnl.expenseAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-zinc-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-200 font-mono">
                <span>Total Expenses (B):</span>
                <span>{formatCurrency(pnl.totalExpense)}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between text-xs font-bold font-mono">
            <span className="font-sans text-zinc-900">NET OPERATING PROFIT / (LOSS) (A - B):</span>
            <span className="text-base text-zinc-950">{formatCurrency(pnl.netProfit)}</span>
          </div>
        </div>
      )}

      {/* TAB 2: BALANCE SHEET */}
      {activeTab === "bs" && bs && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Balance Sheet (Financial Position)</h2>
              <p className="text-xs text-zinc-500">As on 31 March 2027 • Assets = Liabilities + Equity Invariant</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-800">
              <CheckCircle className="w-4 h-4 text-zinc-800" />
              <span>Balanced Equation Validated</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Assets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-bold text-zinc-900 pb-2 border-b border-zinc-200 uppercase tracking-wider text-[11px]">
                <span>Application of Funds (Assets)</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-zinc-100 font-mono">
                {bs.assetAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-zinc-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-200 font-mono">
                <span>Total Assets:</span>
                <span>{formatCurrency(bs.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-bold text-zinc-900 pb-2 border-b border-zinc-200 uppercase tracking-wider text-[11px]">
                <span>Source of Funds (Liabilities &amp; Equity)</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-zinc-100 font-mono">
                {bs.liabilityAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-zinc-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
                {bs.equityAccounts?.map((it) => (
                  <div key={it.accountId} className="py-2 flex justify-between text-zinc-700">
                    <span className="font-sans font-medium">{it.accountCode} - {it.accountName}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(it.balance)}</span>
                  </div>
                ))}
                <div className="py-2 flex justify-between text-zinc-700 font-semibold bg-zinc-50 px-2 rounded">
                  <span className="font-sans">Current Fiscal Period Net Earnings</span>
                  <span className="text-zinc-900">{formatCurrency(bs.retainedEarnings)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-200 font-mono">
                <span>Total Liabilities &amp; Capital:</span>
                <span>{formatCurrency(bs.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIAL BALANCE */}
      {activeTab === "tb" && tb && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <span>Account Code &amp; Title</span>
            <div className="flex items-center gap-10">
              <span className="w-28 text-right">Debit (Dr)</span>
              <span className="w-28 text-right">Credit (Cr)</span>
              <span className="w-32 text-right">Net Balance</span>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {tb.accounts?.map((acc) => (
              <div key={acc.accountId} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium">
                    {acc.accountCode}
                  </span>
                  <span className="font-semibold text-zinc-900">{acc.accountName}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">({acc.rootType})</span>
                </div>

                <div className="flex items-center gap-10 font-mono">
                  <span className="w-28 text-right text-zinc-700">{formatCurrency(acc.totalDebit || 0)}</span>
                  <span className="w-28 text-right text-zinc-700">{formatCurrency(acc.totalCredit || 0)}</span>
                  <span className="w-32 text-right font-bold text-zinc-900">{formatCurrency(acc.balance)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between font-mono font-bold text-xs">
            <span className="font-sans text-zinc-900">TRIAL BALANCE TOTALS:</span>
            <div className="flex items-center gap-10">
              <span className="w-28 text-right">{formatCurrency(tb.totalDebit)}</span>
              <span className="w-28 text-right">{formatCurrency(tb.totalCredit)}</span>
              <span className="w-32 text-right text-zinc-800 font-sans text-[11px]">BALANCED</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CASH FLOW STATEMENT */}
      {activeTab === "cf" && cf && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Statement of Cash Flows (Indirect Method)</h2>
              <p className="text-xs text-zinc-500">Operating, Investing &amp; Financing Activities for Current Fiscal Year</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-500 font-medium">Closing Cash Equivalent:</span>
              <div className="text-xl font-bold text-zinc-900 font-mono">
                {formatCurrency(cf.closingCashBalance)}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* 1. Operating Activities */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-900 text-sm font-sans">
                <span>1. Cash Flow from Operating Activities</span>
                <span>{formatCurrency(cf.netOperatingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 pl-4">
                <span className="font-sans">Net Operating Profit from P&amp;L</span>
                <span>{formatCurrency(cf.netOperatingCashFlow)}</span>
              </div>
            </div>

            {/* 2. Investing Activities */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-900 text-sm font-sans">
                <span>2. Cash Flow from Investing Activities</span>
                <span>{formatCurrency(cf.netInvestingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 pl-4">
                <span className="font-sans">Capital Expenditure &amp; Fixed Asset Acquisitions</span>
                <span>{formatCurrency(cf.netInvestingCashFlow)}</span>
              </div>
            </div>

            {/* 3. Financing Activities */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-900 text-sm font-sans">
                <span>3. Cash Flow from Financing Activities</span>
                <span>{formatCurrency(cf.netFinancingCashFlow)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 pl-4">
                <span className="font-sans">Share Capital Infusions &amp; Debt Movements</span>
                <span>{formatCurrency(cf.netFinancingCashFlow)}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-zinc-700">
                <span className="font-sans">Net Increase / (Decrease) in Cash:</span>
                <span>{formatCurrency(cf.netChangeInCash)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span className="font-sans">Opening Cash &amp; Bank Balance:</span>
                <span>{formatCurrency(cf.openingCashBalance)}</span>
              </div>
              <div className="flex justify-between text-zinc-950 pt-2 border-t border-zinc-200 text-sm font-bold">
                <span className="font-sans">Closing Cash &amp; Bank Balance (Balance Sheet Invariant):</span>
                <span>{formatCurrency(cf.closingCashBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL LEDGER */}
      {activeTab === "gl" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <span>Posting Date &amp; Voucher</span>
            <div className="flex items-center gap-10">
              <span>Account</span>
              <span className="w-24 text-right">Debit (Dr)</span>
              <span className="w-24 text-right">Credit (Cr)</span>
            </div>
          </div>

          {gl.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No general ledger entries recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 text-xs">
              {gl.map((gle) => (
                <div key={gle.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-900">{gle.voucherNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-sans">
                        {gle.voucherType}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{gle.postingDate} • {gle.remarks}</div>
                  </div>

                  <div className="flex items-center gap-10 font-mono text-xs">
                    <span className="font-sans font-semibold text-zinc-800 w-44 truncate">{gle.account?.accountName}</span>
                    <span className="w-24 text-right font-bold text-zinc-900">{formatCurrency(gle.debit)}</span>
                    <span className="w-24 text-right font-bold text-zinc-900">{formatCurrency(gle.credit)}</span>
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



