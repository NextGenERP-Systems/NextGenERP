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
      const parsedBalance = parseFloat(statementBalanceInput) || 0;
      const recon = await getBankReconciliation(selectedBank.id, parsedBalance, statementDateInput);
      setReconciliation(recon);
    } catch (e) {
      console.error(e);
    } finally {
      setReconcileLoading(false);
    }
  }

  function toggleVoucherSelection(vNum: string) {
    const next = new Set(selectedVouchers);
    if (next.has(vNum)) {
      next.delete(vNum);
    } else {
      next.add(vNum);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Banking &amp; Bank Reconciliation
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Corporate Treasury
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Corporate treasury management, automated double-entry ledger balance sync, and statement reconciliation
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
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Corporate Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 hover:border-zinc-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{acc.accountName}</h3>
                  <p className="text-xs text-zinc-500">
                    {acc.bankName} • {acc.branchName || "Main Corporate Branch"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
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
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-600 transition-colors"
                  title="Delete Bank Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Account Number
                </span>
                <div className="font-mono font-bold text-zinc-800 text-sm mt-0.5">
                  {acc.accountNumber}
                </div>
              </div>
              <div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  IFSC / SWIFT
                </span>
                <div className="font-mono font-bold text-zinc-800 text-sm mt-0.5">
                  {acc.ifscCode || acc.swiftCode || "HDFC0000123"}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-500 font-medium">GL Book Balance:</span>
                <div className="text-lg font-bold text-zinc-900 font-mono tracking-tight">
                  {formatCurrency(acc.currentBalance)}
                </div>
              </div>
              <button
                onClick={() => handleOpenReconciliation(acc)}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full p-5 rounded-lg space-y-5 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    Bank Reconciliation Tool (BRT)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {selectedBank.accountName} ({selectedBank.accountNumber}) • {selectedBank.bankName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReconcileOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Banner */}
            {successBanner && (
              <div className="p-2.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {/* Step 1: Statement Parameters Bar */}
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Bank Statement As-Of Date
                    </label>
                    <input
                      type="date"
                      value={statementDateInput}
                      onChange={(e) => setStatementDateInput(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Statement Closing Balance (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={statementBalanceInput}
                      onChange={(e) => setStatementBalanceInput(e.target.value)}
                      className="px-2.5 py-1 text-xs font-mono font-bold rounded border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right w-36"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecalculateRecon}
                    disabled={reconcileLoading}
                    className="px-3 py-1 rounded border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reconcileLoading ? "animate-spin" : ""}`} />
                    <span>Recalculate</span>
                  </button>
                  <button
                    onClick={handleAutoReconcile}
                    disabled={clearingInProgress || !reconciliation}
                    className="px-3 py-1 rounded bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Reconcile All</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Live Balancing Worksheet */}
              {reconciliation && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Statement Balance
                    </span>
                    <div className="text-base font-bold font-mono text-zinc-900">
                      {formatCurrency(reconciliation.bankStatementBalance)}
                    </div>
                    <span className="text-[10px] text-zinc-500">As per bank closing</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-900" /> (+) Deposits in Transit
                    </span>
                    <div className="text-base font-bold font-mono text-zinc-900">
                      {formatCurrency(reconciliation.depositsInTransit)}
                    </div>
                    <span className="text-[10px] text-zinc-500">Uncleared customer receipts</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-zinc-900" /> (-) Outstanding Checks
                    </span>
                    <div className="text-base font-bold font-mono text-zinc-900">
                      {formatCurrency(reconciliation.outstandingPayments)}
                    </div>
                    <span className="text-[10px] text-zinc-500">Uncleared supplier payments</span>
                  </div>

                  <div className="p-3 rounded-lg border border-zinc-300 bg-zinc-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Variance (Diff)
                      </span>
                      {reconciliation.isReconciled ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-900 text-white font-mono">
                          BALANCED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-200 text-zinc-900 font-mono">
                          UNBALANCED
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold font-mono text-zinc-900">
                      {formatCurrency(reconciliation.variance)}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      GL Balance: {formatCurrency(reconciliation.generalLedgerBalance)}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Uncleared Vouchers & Clearance Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Uncleared Bank Transactions
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {reconciliation?.unclearedTransactions?.length || 0} Vouchers
                    </span>
                  </div>

                  {selectedVouchers.size > 0 && (
                    <div className="flex items-center gap-2 p-1 bg-zinc-100 border border-zinc-300 rounded animate-in fade-in">
                      <span className="text-xs font-semibold text-zinc-900 px-2">
                        {selectedVouchers.size} selected
                      </span>
                      <input
                        type="date"
                        value={clearanceDateInput}
                        onChange={(e) => setClearanceDateInput(e.target.value)}
                        className="px-2 py-0.5 text-xs rounded border border-zinc-300 bg-white"
                      />
                      <button
                        onClick={handleClearSelected}
                        disabled={clearingInProgress}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Clear Transactions</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3 w-8">
                          <button
                            type="button"
                            onClick={() =>
                              reconciliation &&
                              toggleSelectAll(reconciliation.unclearedTransactions)
                            }
                            className="text-zinc-400 hover:text-zinc-700"
                          >
                            {reconciliation &&
                            selectedVouchers.size ===
                              reconciliation.unclearedTransactions.length &&
                            reconciliation.unclearedTransactions.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-zinc-900" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-2 px-3">Posting Date</th>
                        <th className="py-2 px-3">Voucher #</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Party / Account</th>
                        <th className="py-2 px-3 text-right">Debit (Deposit)</th>
                        <th className="py-2 px-3 text-right">Credit (Payment)</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {reconciliation?.unclearedTransactions?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-zinc-400">
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
                                isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"
                              }`}
                            >
                              <td className="py-2 px-3">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-zinc-900" />
                                ) : (
                                  <Square className="w-4 h-4 text-zinc-300" />
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono text-zinc-700">
                                {item.postingDate}
                              </td>
                              <td className="py-2 px-3 font-bold font-mono text-zinc-900">
                                {item.voucherNumber}
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                                  {item.voucherType}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-zinc-800">
                                {item.partyName || "Direct Banking GL"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                                {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                                {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {item.isCleared ? (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
                                    Cleared ({item.clearanceDate})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200">
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
            <div className="pt-3 border-t border-zinc-200 shrink-0 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Formula: Calculated Balance = Statement + Deposits in Transit - Outstanding Payments
              </span>
              <button
                type="button"
                onClick={() => setIsReconcileOpen(false)}
                className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Add Corporate Bank Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAccount} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Account Title / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Operating Bank Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank Ltd"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50200012345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">IFSC / Routing Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala Bangalore"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">GL Account Mapping</label>
                  <select
                    value={glAccountId}
                    onChange={(e) => setGlAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
                  <label className="block text-zinc-700 font-semibold mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium"
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
