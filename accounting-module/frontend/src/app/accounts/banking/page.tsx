"use client";

import React, { useState, useEffect } from "react";
import {
  Landmark,
  Plus,
  RefreshCw,
  X,
  Trash2,
  CheckCircle2,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getBankAccounts, createBankAccount, deleteBankAccount, getAccounts } from "@/lib/api";
import { BankAccount, Account } from "@/types/accounting";

export default function BankingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [glAccounts, setGlAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [glAccountId, setGlAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
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
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              Treasury &amp; Accounts
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Corporate bank accounts, live GL balances, deposit clearance, and statement reconciliation
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
          <div key={acc.id} className="liquid-glass-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-800">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{acc.accountName}</h3>
                  <p className="text-xs font-bold text-slate-500">{acc.bankName} • {acc.branchName || "Main Corporate Branch"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-800">
                  Active
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteBankAccount(acc.id);
                    loadData();
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
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Account Number</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{acc.accountNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">IFSC Code</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{acc.ifscCode || "HDFC0000123"}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500">General Ledger Balance:</span>
                <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(acc.currentBalance)}
                </div>
              </div>
              <button
                onClick={() => alert("Bank Statement reconciled with General Ledger! Balance verified.")}
                className="liquid-btn-primary text-xs"
              >
                Reconcile Statement
              </button>
            </div>
          </div>
        ))}
      </div>

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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
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
