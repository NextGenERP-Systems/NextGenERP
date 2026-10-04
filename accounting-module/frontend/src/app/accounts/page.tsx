"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  Laptop,
  FileSpreadsheet,
  Building2,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getProfitAndLoss,
  getBalanceSheet,
  getSalesInvoices,
  getPurchaseInvoices,
  getJournalEntries,
  getAccounts,
  createJournalEntry,
  createSalesInvoice,
  createPaymentEntry,
} from "@/lib/api";
import {
  ProfitAndLossReport,
  BalanceSheetReport,
  SalesInvoice,
  PurchaseInvoice,
  JournalEntry,
  Account,
} from "@/types/accounting";

export default function AccountsOverviewPage() {
  const [pnl, setPnl] = useState<ProfitAndLossReport | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab on Dashboard
  const [activeTab, setActiveTab] = useState<"all" | "sales" | "purchases" | "journal">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Action Modal States
  const [isQuickJvOpen, setIsQuickJvOpen] = useState(false);
  const [isQuickSinOpen, setIsQuickSinOpen] = useState(false);
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);

  // Form states for Quick Journal Entry
  const [jvDate, setJvDate] = useState(new Date().toISOString().split("T")[0]);
  const [jvRemarks, setJvRemarks] = useState("");
  const [jvRows, setJvRows] = useState([
    { accountId: "", debit: "0", credit: "0", remarks: "" },
    { accountId: "", debit: "0", credit: "0", remarks: "" },
  ]);

  // Form states for Quick Sales Invoice
  const [sinCustomer, setSinCustomer] = useState("");
  const [sinAmount, setSinAmount] = useState("");
  const [sinItemName, setSinItemName] = useState("Enterprise License & ERP Services");

  // Form states for Quick Payment Entry
  const [payType, setPayType] = useState<"RECEIVE" | "PAY">("RECEIVE");
  const [payParty, setPayParty] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("BANK");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pnlData, bsData, sinvData, pinvData, jvData, accData] = await Promise.all([
        getProfitAndLoss(),
        getBalanceSheet(),
        getSalesInvoices(),
        getPurchaseInvoices(),
        getJournalEntries(),
        getAccounts(),
      ]);
      setPnl(pnlData);
      setBalanceSheet(bsData);
      setSalesInvoices(sinvData);
      setPurchaseInvoices(pinvData);
      setJournalEntries(jvData);
      setAccounts(accData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Dynamic Financial Calculations - 100% Derived from live data with ZERO static fallbacks
  const dynamicMetrics = useMemo(() => {
    const totalAssets = balanceSheet?.totalAssets ?? 0;
    const totalRevenue = pnl?.totalIncome ?? 0;
    const totalExpenses = pnl?.totalExpense ?? 0;
    const netProfit = pnl?.netProfit ?? (totalRevenue - totalExpenses);

    // Outstanding Receivables (Sales Invoices not marked as PAID)
    const outstandingAR = salesInvoices
      .filter((inv) => inv.status !== "PAID")
      .reduce((sum, inv) => sum + (inv.outstandingAmount ?? inv.grandTotal ?? 0), 0);

    // Outstanding Payables (Purchase Invoices not marked as PAID)
    const outstandingAP = purchaseInvoices
      .filter((inv) => inv.status !== "PAID")
      .reduce((sum, inv) => sum + (inv.outstandingAmount ?? inv.grandTotal ?? 0), 0);

    const netProfitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    return {
      totalAssets,
      totalRevenue,
      totalExpenses,
      netProfit,
      outstandingAR,
      outstandingAP,
      netProfitMargin,
      totalVouchers: journalEntries.length,
      activeAccountsCount: accounts.length,
    };
  }, [balanceSheet, pnl, salesInvoices, purchaseInvoices, journalEntries, accounts]);

  // Balanced check for quick journal entry
  const quickJvTotalDebit = jvRows.reduce((acc, r) => acc + (parseFloat(r.debit) || 0), 0);
  const quickJvTotalCredit = jvRows.reduce((acc, r) => acc + (parseFloat(r.credit) || 0), 0);
  const isQuickJvBalanced = Math.abs(quickJvTotalDebit - quickJvTotalCredit) < 0.01 && quickJvTotalDebit > 0;

  async function handleQuickJvSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isQuickJvBalanced) return;

    setIsSubmitting(true);
    try {
      const items = jvRows.map((r) => {
        const acc = accounts.find((a) => a.id === r.accountId) || accounts[0];
        return {
          account: acc,
          debitAmount: parseFloat(r.debit) || 0,
          creditAmount: parseFloat(r.credit) || 0,
          remarks: r.remarks,
        };
      });

      await createJournalEntry({
        voucherType: "JOURNAL_ENTRY",
        postingDate: jvDate,
        totalDebit: quickJvTotalDebit,
        totalCredit: quickJvTotalCredit,
        userRemarks: jvRemarks || "Quick Journal Voucher entry",
        items,
      });

      setIsQuickJvOpen(false);
      setJvRemarks("");
      setJvRows([
        { accountId: "", debit: "0", credit: "0", remarks: "" },
        { accountId: "", debit: "0", credit: "0", remarks: "" },
      ]);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuickSinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sinCustomer || !sinAmount) return;

    setIsSubmitting(true);
    try {
      const amountNum = parseFloat(sinAmount) || 0;
      const taxRate = 18;
      const taxAmount = amountNum * 0.18;
      const grandTotal = amountNum + taxAmount;

      await createSalesInvoice({
        customerName: sinCustomer,
        postingDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        remarks: "Quick Sales Invoice created from Desk Overview",
        items: [
          {
            itemCode: "SRV-001",
            itemName: sinItemName,
            quantity: 1,
            rate: amountNum,
            amount: amountNum,
            taxRate: taxRate,
          },
        ],
      });

      setIsQuickSinOpen(false);
      setSinCustomer("");
      setSinAmount("");
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuickPaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payParty || !payAmount) return;

    setIsSubmitting(true);
    try {
      const amountNum = parseFloat(payAmount) || 0;
      await createPaymentEntry({
        paymentType: payType,
        partyName: payParty,
        partyType: payType === "RECEIVE" ? "CUSTOMER" : "SUPPLIER",
        postingDate: new Date().toISOString().split("T")[0],
        paidAmount: amountNum,
        modeOfPayment: payMode,
        remarks: `Quick Payment Entry (${payType}) from Overview`,
      });

      setIsQuickPayOpen(false);
      setPayParty("");
      setPayAmount("");
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtered Activities
  const filteredSales = salesInvoices.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPurchases = purchaseInvoices.filter(
    (p) =>
      (p.billNumber || p.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJournal = journalEntries.filter(
    (j) =>
      j.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.userRemarks && j.userRemarks.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Finance & Accounting Desk
            </h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Live Double-Entry Core
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            General Ledger, Real-Time Chart of Accounts, Receivables (AR), Payables (AP) & Statutory Statements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh Ledger Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsQuickJvOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Quick Journal Entry</span>
          </button>

          <button
            onClick={() => setIsQuickSinOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-zinc-900 text-zinc-900 bg-white hover:bg-zinc-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Health KPIs (Pure Monochrome, 100% Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Assets
            </span>
            <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {formatCurrency(dynamicMetrics.totalAssets)}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
            <span>Bank & Cash + Debtors + Fixed Assets</span>
          </div>
        </div>

        {/* Operating Revenue */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Operating Revenue
            </span>
            <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {formatCurrency(dynamicMetrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
            <span>Customer Billings & Services</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {formatCurrency(dynamicMetrics.totalExpenses)}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
            <span>Vendor Bills, Supplies & Payroll</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Net Profit (Current)
            </span>
            <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {formatCurrency(dynamicMetrics.netProfit)}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
            <span>Margin: {dynamicMetrics.netProfitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Balances & Quick Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Outstanding Receivables (AR)
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 mt-0.5">
              {formatCurrency(dynamicMetrics.outstandingAR)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {salesInvoices.filter((i) => i.status !== "PAID").length} Invoices pending collection
            </div>
          </div>
          <Link
            href="/accounts/sales-invoices"
            className="px-2.5 py-1 rounded border border-zinc-300 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 transition-colors"
          >
            Review AR →
          </Link>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Outstanding Payables (AP)
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 mt-0.5">
              {formatCurrency(dynamicMetrics.outstandingAP)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {purchaseInvoices.filter((i) => i.status !== "PAID").length} Vendor bills pending payment
            </div>
          </div>
          <Link
            href="/accounts/purchase-invoices"
            className="px-2.5 py-1 rounded border border-zinc-300 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 transition-colors"
          >
            Review AP →
          </Link>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              General Ledger Health
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 mt-0.5">
              {dynamicMetrics.totalVouchers} Vouchers
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {dynamicMetrics.activeAccountsCount} Master Accounts Configured
            </div>
          </div>
          <button
            onClick={() => setIsQuickPayOpen(true)}
            className="px-2.5 py-1 rounded bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Record Payment +
          </button>
        </div>
      </div>

      {/* Accounting Modules Launchpad (Monochrome Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Accounting Subsystems & Command Center
          </h2>
          <span className="text-[11px] text-zinc-400">12 Master Ledgers & Workspaces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            {
              title: "Chart of Accounts",
              desc: "Hierarchical ledger tree",
              href: "/accounts/chart-of-accounts",
              icon: FolderTree,
              count: `${accounts.length} Accounts`,
            },
            {
              title: "General Ledger",
              desc: "Double-entry audit trail",
              href: "/accounts/general-ledger",
              icon: Layers,
              count: `${dynamicMetrics.totalVouchers} Entries`,
            },
            {
              title: "Journal Entries",
              desc: "Manual debit/credit vouchers",
              href: "/accounts/journal-entries",
              icon: BookOpen,
              count: `${journalEntries.length} Vouchers`,
            },
            {
              title: "Sales Invoices",
              desc: "Receivables & GST billing",
              href: "/accounts/sales-invoices",
              icon: FileText,
              count: `${salesInvoices.length} Invoices`,
            },
            {
              title: "Purchase Invoices",
              desc: "Payables & vendor bills",
              href: "/accounts/purchase-invoices",
              icon: Receipt,
              count: `${purchaseInvoices.length} Bills`,
            },
            {
              title: "Payment Entries",
              desc: "Receipts & disbursements",
              href: "/accounts/payments",
              icon: ArrowLeftRight,
              count: "Cash/Bank",
            },
            {
              title: "Banking & Cash",
              desc: "Bank accounts & reconciliations",
              href: "/accounts/banking",
              icon: Landmark,
              count: "Bank Ledger",
            },
            {
              title: "Fixed Assets",
              desc: "Asset register & depreciation",
              href: "/accounts/assets",
              icon: Laptop,
              count: "Depreciation",
            },
            {
              title: "Tax & GST Filing",
              desc: "GSTR-1, GSTR-3B & TDS",
              href: "/accounts/taxes",
              icon: FileSpreadsheet,
              count: "GST Audit",
            },
            {
              title: "Cost Centers",
              desc: "Departmental budget tracking",
              href: "/accounts/cost-centers",
              icon: Building2,
              count: "Profit Centers",
            },
            {
              title: "Financial Statements",
              desc: "Balance Sheet, P&L, Trial Balance",
              href: "/accounts/reports",
              icon: BarChart3,
              count: "GAAP / Ind AS",
            },
            {
              title: "New Journal Voucher",
              desc: "Create balanced voucher",
              onClick: () => setIsQuickJvOpen(true),
              icon: Plus,
              count: "Fast Entry",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="bg-white border border-dashed border-zinc-300 rounded-lg p-3 text-left hover:border-zinc-900 transition-all group"
                >
                  <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center mb-2">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="font-semibold text-xs text-zinc-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{item.desc}</div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">{item.count}</div>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href!}
                className="bg-white border border-zinc-200 rounded-lg p-3 hover:border-zinc-400 transition-all group"
              >
                <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 mb-2 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-zinc-900 truncate">
                  {item.title}
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{item.desc}</div>
                <div className="text-[10px] font-mono text-zinc-400 mt-1">{item.count}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Transaction Registry & Filterable Activity Feed */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        {/* Tab & Search Bar */}
        <div className="p-3 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All Activity" },
              { id: "sales", label: `Sales Invoices (${salesInvoices.length})` },
              { id: "purchases", label: `Purchase Bills (${purchaseInvoices.length})` },
              { id: "journal", label: `Journal Entries (${journalEntries.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search reference # or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="divide-y divide-zinc-100 text-xs">
          {/* SALES INVOICES TAB */}
          {(activeTab === "all" || activeTab === "sales") && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Customer Invoices (Accounts Receivable)</span>
                <Link href="/accounts/sales-invoices" className="hover:text-zinc-900">
                  Open Invoices Module →
                </Link>
              </div>

              {filteredSales.length === 0 ? (
                <div className="py-6 text-center text-zinc-400">
                  No sales invoices recorded yet. Click &quot;+ New Invoice&quot; to issue one.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {filteredSales.slice(0, activeTab === "sales" ? 20 : 4).map((inv) => (
                    <div
                      key={inv.id}
                      className="py-2.5 flex items-center justify-between hover:bg-zinc-50 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold font-mono text-zinc-900">
                            {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {inv.customerName} • {inv.postingDate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold font-mono text-zinc-900">
                            {formatCurrency(inv.grandTotal)}
                          </div>
                          <div className="text-[10px] text-zinc-400">Due: {inv.dueDate}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PURCHASE INVOICES TAB */}
          {(activeTab === "all" || activeTab === "purchases") && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Vendor Bills &amp; Operating Expenses (Accounts Payable)</span>
                <Link href="/accounts/purchase-invoices" className="hover:text-zinc-900">
                  Open Bills Module →
                </Link>
              </div>

              {filteredPurchases.length === 0 ? (
                <div className="py-6 text-center text-zinc-400">
                  No purchase bills recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {filteredPurchases.slice(0, activeTab === "purchases" ? 20 : 4).map((pinv) => (
                    <div
                      key={pinv.id}
                      className="py-2.5 flex items-center justify-between hover:bg-zinc-50 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                          <Receipt className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold font-mono text-zinc-900">
                            {pinv.billNumber || pinv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {pinv.supplierName} • {pinv.postingDate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold font-mono text-zinc-900">
                            {formatCurrency(pinv.grandTotal)}
                          </div>
                          <div className="text-[10px] text-zinc-400">Due: {pinv.dueDate}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {pinv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JOURNAL ENTRIES TAB */}
          {(activeTab === "all" || activeTab === "journal") && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Balanced General Ledger Vouchers</span>
                <Link href="/accounts/journal-entries" className="hover:text-zinc-900">
                  Open Journal Entries →
                </Link>
              </div>

              {filteredJournal.length === 0 ? (
                <div className="py-6 text-center text-zinc-400">
                  No journal vouchers recorded yet. Click &quot;+ Quick Journal Entry&quot; to post a balanced voucher.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {filteredJournal.slice(0, activeTab === "journal" ? 20 : 4).map((jv) => (
                    <div
                      key={jv.id}
                      className="py-2.5 flex items-center justify-between hover:bg-zinc-50 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold font-mono text-zinc-900">
                            {jv.voucherNumber}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {jv.postingDate} • {jv.userRemarks || jv.voucherType}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold font-mono text-zinc-900">
                            {formatCurrency(jv.totalDebit)}
                          </div>
                          <div className="text-[10px] text-zinc-400">Debit = Credit</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {jv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: QUICK JOURNAL VOUCHER */}
      {isQuickJvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-xl w-full rounded-lg p-5 space-y-4 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Quick Journal Entry Voucher</h2>
              </div>
              <button
                onClick={() => setIsQuickJvOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickJvSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Posting Date
                  </label>
                  <input
                    type="date"
                    value={jvDate}
                    onChange={(e) => setJvDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Remarks / Memo
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Month-end depreciation adjustment"
                    value={jvRemarks}
                    onChange={(e) => setJvRemarks(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              {/* Debit / Credit Lines */}
              <div className="space-y-2">
                <div className="font-semibold text-zinc-800">Ledger Posting Accounts</div>
                {jvRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={row.accountId}
                        onChange={(e) => {
                          const updated = [...jvRows];
                          updated[idx].accountId = e.target.value;
                          setJvRows(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        required
                      >
                        <option value="">Select Account...</option>
                        {accounts
                          .filter((a) => !a.isGroup)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountCode} - {a.accountName}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Debit (₹)"
                        value={row.debit}
                        onChange={(e) => {
                          const updated = [...jvRows];
                          updated[idx].debit = e.target.value;
                          if (parseFloat(e.target.value) > 0) updated[idx].credit = "0";
                          setJvRows(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Credit (₹)"
                        value={row.credit}
                        onChange={(e) => {
                          const updated = [...jvRows];
                          updated[idx].credit = e.target.value;
                          if (parseFloat(e.target.value) > 0) updated[idx].debit = "0";
                          setJvRows(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance Verification */}
              <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500">Total Debit: </span>
                  <span className="font-bold font-mono text-zinc-900">
                    {formatCurrency(quickJvTotalDebit)}
                  </span>
                  <span className="text-zinc-500 ml-3">Total Credit: </span>
                  <span className="font-bold font-mono text-zinc-900">
                    {formatCurrency(quickJvTotalCredit)}
                  </span>
                </div>
                {isQuickJvBalanced ? (
                  <span className="font-bold text-zinc-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                  </span>
                ) : (
                  <span className="text-zinc-500 font-medium">Must be equal &gt; 0</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsQuickJvOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isQuickJvBalanced || isSubmitting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post to General Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK SALES INVOICE */}
      {isQuickSinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-lg p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Quick Sales Invoice</h2>
              </div>
              <button
                onClick={() => setIsQuickSinOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickSinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Customer / Client Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Solutions Ltd"
                  value={sinCustomer}
                  onChange={(e) => setSinCustomer(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Product / Service Description
                </label>
                <input
                  type="text"
                  value={sinItemName}
                  onChange={(e) => setSinItemName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Taxable Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={sinAmount}
                  onChange={(e) => setSinAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>

              {sinAmount && (
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-600 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Taxable:</span>
                    <span>{formatCurrency(parseFloat(sinAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>{formatCurrency((parseFloat(sinAmount) || 0) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-200 pt-1">
                    <span>Grand Total:</span>
                    <span>{formatCurrency((parseFloat(sinAmount) || 0) * 1.18)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsQuickSinOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !sinCustomer || !sinAmount}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create & Post Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK PAYMENT ENTRY */}
      {isQuickPayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-lg p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Record Payment Voucher</h2>
              </div>
              <button
                onClick={() => setIsQuickPayOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickPaySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayType("RECEIVE")}
                  className={`py-1.5 rounded text-xs font-semibold border ${
                    payType === "RECEIVE"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  Receive from Customer
                </button>
                <button
                  type="button"
                  onClick={() => setPayType("PAY")}
                  className={`py-1.5 rounded text-xs font-semibold border ${
                    payType === "PAY"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  Pay to Vendor
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Party Name ({payType === "RECEIVE" ? "Customer" : "Supplier"})
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Solutions Ltd"
                  value={payParty}
                  onChange={(e) => setPayParty(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="BANK">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / Digital Gateway</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsQuickPayOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !payParty || !payAmount}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Record Payment Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
