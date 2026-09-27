"use client";

import React, { useState, useEffect } from "react";
import {
  Landmark,
  Plus,
  RefreshCw,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getBankAccounts,
  createBankAccount,
  deleteBankAccount,
  getAccounts,
  getBankReconciliation,
  clearBankTransactions,
} from "@/lib/api";
import { BankAccount, Account, BankReconciliation, UnclearedTransaction } from "@/types/accounting";

export default function BankingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [glAccounts, setGlAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Account Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [glAccountId, setGlAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank Reconciliation Tool (BRT) State
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [reconciliation, setReconciliation] = useState<BankReconciliation | null>(null);
  const [statementBalanceInput, setStatementBalanceInput] = useState<string>("");
  const [statementDateInput, setStatementDateInput] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  const [clearanceDateInput, setClearanceDateInput] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [clearingInProgress, setClearingInProgress] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bankData, accData] = await Promise.all([getBankAccounts(), getAccounts()]);
      setAccounts(bankData);
      setGlAccounts(accData.filter((a) => a.accountType === "Bank" || a.rootType === "ASSET"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenReconciliation(bank: BankAccount) {
    setSelectedBank(bank);
    setStatementBalanceInput(bank.currentBalance ? bank.currentBalance.toString() : "0");
    setReconcileLoading(true);
    setIsReconcileOpen(true);
    setSelectedVouchers(new Set());
    setSuccessBanner(null);

    try {
      const recon = await getBankReconciliation(bank.id, bank.currentBalance, statementDateInput);
      setReconciliation(recon);
    } catch (e) {
      console.error(e);
    } finally {
      setReconcileLoading(false);
    }
  }

  async function handleRecalculateRecon() {
    if (!selectedBank) return;
    setReconcileLoading(true);
    try {
      const val = parseFloat(statementBalanceInput) || 0;
      const recon = await getBankReconciliation(selectedBank.id, val, statementDateInput);
      setReconciliation(recon);
    } catch (e) {
      console.error(e);
    } finally {
      setReconcileLoading(false);
    }
  }

  function toggleVoucherSelection(voucherNumber: string) {
    const next = new Set(selectedVouchers);
    if (next.has(voucherNumber)) {
      next.delete(voucherNumber);
    } else {
      next.add(voucherNumber);
    }
    setSelectedVouchers(next);
  }

  function toggleSelectAll(uncleared: UnclearedTransaction[]) {
    if (selectedVouchers.size === uncleared.length) {
      setSelectedVouchers(new Set());
    } else {
      setSelectedVouchers(new Set(uncleared.map((u) => u.voucherNumber)));
    }
  }

  async function handleClearSelected() {
    if (!selectedBank || selectedVouchers.size === 0) return;
    setClearingInProgress(true);
    try {
      const items = Array.from(selectedVouchers).map((vNum) => ({
        voucherNumber: vNum,
        clearanceDate: clearanceDateInput,
      }));
      const updated = await clearBankTransactions(selectedBank.id, items);
      setReconciliation(updated);
      setSelectedVouchers(new Set());
      setSuccessBanner(`Successfully cleared ${items.length} voucher(s) as of ${clearanceDateInput}`);
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setClearingInProgress(false);
    }
  }

  async function handleAutoReconcile() {
    if (!selectedBank || !reconciliation) return;
    const uncleared = reconciliation.unclearedTransactions.filter((u) => !u.isCleared);
    if (uncleared.length === 0) return;

    setClearingInProgress(true);
    try {
      const items = uncleared.map((u) => ({
        voucherNumber: u.voucherNumber,
        clearanceDate: statementDateInput,
      }));
      const updated = await clearBankTransactions(selectedBank.id, items);
      setReconciliation(updated);
      setSelectedVouchers(new Set());
      setSuccessBanner(`Auto-Reconciled all ${items.length} outstanding transactions to statement date!`);
      setTimeout(() => setSuccessBanner(null), 6000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setClearingInProgress(false);
    }
  }

  async function handleSubmitNewAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName || !accountNumber) return;

    setIsSubmitting(true);
    try {
      const glAcc = glAccounts.find((a) => a.id === glAccountId) || glAccounts[0];
      await createBankAccount({
        accountName,
        bankName: bankName || "Corporate Bank",
        accountNumber,
        ifscCode,
        branchName,
        currentBalance: parseFloat(currentBalance) || 0,
        glAccount: glAcc,
      });

      setIsModalOpen(false);
      setAccountName("");
      setAccountNumber("");
      setIfscCode("");
      await loadData();
    } catch (err) {
      console.error(err);
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Banking &amp; Bank Reconciliation
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs">
              ERPNext Parity
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Corporate treasury management, automated double-entry ledger balance sync, and statement reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Corporate Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="liquid-glass-card p-6 space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{acc.accountName}</h3>
                  <p className="text-xs font-bold text-slate-500">
                    {acc.bankName} • {acc.branchName || "Main Corporate Branch"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Active
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm("Delete this bank account?")) {
                      await deleteBankAccount(acc.id);
                      loadData();
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Bank Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Account Number
                </span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {acc.accountNumber}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  IFSC / SWIFT
                </span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {acc.ifscCode || acc.swiftCode || "HDFC0000123"}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500">GL Book Balance:</span>
                <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(acc.currentBalance)}
                </div>
              </div>
              <button
                onClick={() => handleOpenReconciliation(acc)}
                className="liquid-btn-primary text-xs flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Reconcile Tool</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BANK RECONCILIATION TOOL MODAL */}
      {isReconcileOpen && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="liquid-glass-card bg-white/95 max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-white my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Bank Reconciliation Tool (BRT)
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {selectedBank.accountName} ({selectedBank.accountNumber}) • {selectedBank.bankName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReconcileOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Banner */}
            {successBanner && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            <div className="overflow-y-auto flex-1 space-y-6 pr-1">
              {/* Step 1: Statement Parameters Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Bank Statement As-Of Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={statementDateInput}
                        onChange={(e) => setStatementDateInput(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Bank Statement Closing Balance (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={statementBalanceInput}
                      onChange={(e) => setStatementBalanceInput(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold font-mono rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right w-40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecalculateRecon}
                    disabled={reconcileLoading}
                    className="liquid-btn-glass text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reconcileLoading ? "animate-spin" : ""}`} />
                    <span>Recalculate</span>
                  </button>
                  <button
                    onClick={handleAutoReconcile}
                    disabled={clearingInProgress || !reconciliation}
                    className="liquid-btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Reconcile All</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Live Balancing Worksheet */}
              {reconciliation && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Statement Balance
                    </span>
                    <div className="text-base font-black font-mono text-slate-900">
                      {formatCurrency(reconciliation.bankStatementBalance)}
                    </div>
                    <span className="text-[10px] text-slate-500">As per bank closing</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> (+) Deposits in Transit
                    </span>
                    <div className="text-base font-black font-mono text-emerald-700">
                      {formatCurrency(reconciliation.depositsInTransit)}
                    </div>
                    <span className="text-[10px] text-slate-500">Uncleared customer receipts</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> (-) Outstanding Checks
                    </span>
                    <div className="text-base font-black font-mono text-rose-700">
                      {formatCurrency(reconciliation.outstandingPayments)}
                    </div>
                    <span className="text-[10px] text-slate-500">Uncleared supplier payments</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border shadow-2xs space-y-1 ${
                      reconciliation.isReconciled
                        ? "bg-emerald-50/70 border-emerald-300"
                        : "bg-amber-50/70 border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Variance (Diff)
                      </span>
                      {reconciliation.isReconciled ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white">
                          BALANCED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-600 text-white">
                          UNBALANCED
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-base font-black font-mono ${
                        reconciliation.isReconciled ? "text-emerald-800" : "text-amber-800"
                      }`}
                    >
                      {formatCurrency(reconciliation.variance)}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      GL Balance: {formatCurrency(reconciliation.generalLedgerBalance)}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Uncleared Vouchers & Clearance Action */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Uncleared Bank Transactions
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {reconciliation?.unclearedTransactions?.length || 0} Vouchers
                    </span>
                  </div>

                  {/* Batch Clearance Action Bar */}
                  {selectedVouchers.size > 0 && (
                    <div className="flex items-center gap-2 p-1.5 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in">
                      <span className="text-xs font-bold text-blue-800 px-2">
                        {selectedVouchers.size} selected
                      </span>
                      <input
                        type="date"
                        value={clearanceDateInput}
                        onChange={(e) => setClearanceDateInput(e.target.value)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-blue-200"
                      />
                      <button
                        onClick={handleClearSelected}
                        disabled={clearingInProgress}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Clear Transactions</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-8">
                          <button
                            type="button"
                            onClick={() =>
                              reconciliation &&
                              toggleSelectAll(reconciliation.unclearedTransactions)
                            }
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {reconciliation &&
                            selectedVouchers.size ===
                              reconciliation.unclearedTransactions.length &&
                            reconciliation.unclearedTransactions.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-2.5 px-3">Posting Date</th>
                        <th className="py-2.5 px-3">Voucher #</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Party / Account</th>
                        <th className="py-2.5 px-3 text-right">Debit (Deposit)</th>
                        <th className="py-2.5 px-3 text-right">Credit (Payment)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {reconciliation?.unclearedTransactions?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No uncleared transactions found. All bank book vouchers are cleared!
                          </td>
                        </tr>
                      ) : (
                        reconciliation?.unclearedTransactions?.map((item) => {
                          const isSelected = selectedVouchers.has(item.voucherNumber);
                          return (
                            <tr
                              key={item.voucherNumber + item.voucherId}
                              onClick={() => toggleVoucherSelection(item.voucherNumber)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-700">
                                {item.postingDate}
                              </td>
                              <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                                {item.voucherNumber}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {item.voucherType}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-800">
                                {item.partyName || "Direct Banking GL"}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                                {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                                {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {item.isCleared ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Cleared ({item.clearanceDate})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    Uncleared
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Formula: Calculated Balance = Statement + Deposits in Transit - Outstanding Payments
              </span>
              <button
                type="button"
                onClick={() => setIsReconcileOpen(false)}
                className="liquid-btn-primary text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Add Corporate Bank Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAccount} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Title / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Operating Bank Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank Ltd"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50200012345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC / Routing Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala Bangalore"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GL Account Mapping</label>
                  <select
                    value={glAccountId}
                    onChange={(e) => setGlAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">Select GL Account...</option>
                    {glAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
                  {isSubmitting ? "Saving..." : "Save Bank Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
