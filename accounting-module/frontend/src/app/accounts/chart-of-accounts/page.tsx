"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FileSpreadsheet,
  Building,
  CreditCard,
  RefreshCw,
  X,
  CheckCircle,
  Layers,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAccounts, createAccount, deleteAccount } from "@/lib/api";
import { Account, RootType } from "@/types/accounting";

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRootType, setSelectedRootType] = useState<RootType | "ALL">("ALL");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "1000": true,
    "1100": true,
    "1110": true,
    "2000": true,
    "3000": true,
    "4000": true,
    "5000": true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccCode, setNewAccCode] = useState("");
  const [newAccRootType, setNewAccRootType] = useState<RootType>("ASSET");
  const [newAccType, setNewAccType] = useState("Operating Expense");
  const [newAccIsGroup, setNewAccIsGroup] = useState(false);
  const [newAccBalance, setNewAccBalance] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function toggleGroup(code: string) {
    setExpandedGroups((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newAccName) return;

    setIsSubmitting(true);
    try {
      await createAccount({
        accountName: newAccName,
        accountCode: newAccCode,
        rootType: newAccRootType,
        accountType: newAccType,
        isGroup: newAccIsGroup,
        balance: parseFloat(newAccBalance) || 0,
      });
      setIsModalOpen(false);
      setNewAccName("");
      setNewAccCode("");
      await loadAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoot = selectedRootType === "ALL" || acc.rootType === selectedRootType;
    return matchesSearch && matchesRoot;
  });

  const rootGroups: RootType[] = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Chart of Accounts (CoA)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              5 Root Types
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Hierarchical structure of all general ledger accounts, groups, and running balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadAccounts} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="liquid-glass-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Root Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRootType("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedRootType === "ALL"
                ? "liquid-btn-primary shadow-xs"
                : "liquid-btn-glass text-slate-600"
            }`}
          >
            All Accounts ({accounts.length})
          </button>
          {rootGroups.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRootType(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
                selectedRootType === r
                  ? "liquid-btn-primary shadow-xs"
                  : "liquid-btn-glass text-slate-600"
              }`}
            >
              {r.toLowerCase()} ({accounts.filter((a) => a.rootType === r).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search account name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-white/70 border border-slate-200/80 rounded-full focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Chart of Accounts Tree Table */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Account Code & Name</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Root Type</span>
            <span>Account Type</span>
            <span className="w-32 text-right">Running Balance</span>
          </div>
        </div>

        <div className="divide-y divide-slate-200/50">
          {filteredAccounts.map((account) => {
            const isGroup = account.isGroup;
            const isExpanded = expandedGroups[account.accountCode] ?? true;

            return (
              <div
                key={account.id}
                className={`px-5 py-3 flex items-center justify-between text-xs hover:bg-white/40 transition-colors ${
                  isGroup ? "font-bold text-slate-900 bg-white/20" : "text-slate-700 font-medium"
                }`}
              >
                {/* Account Name with Indentation & Icon */}
                <div className="flex items-center gap-2.5">
                  {isGroup ? (
                    <button
                      onClick={() => toggleGroup(account.accountCode)}
                      className="p-1 rounded hover:bg-white/60 text-slate-500"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5" />
                  )}

                  <div className="w-6 h-6 rounded-lg bg-white/80 border border-white flex items-center justify-center text-slate-600 shadow-2xs">
                    {isGroup ? <Folder className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  </div>

                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600">
                    {account.accountCode}
                  </span>

                  <span className={`${isGroup ? "text-slate-950 font-extrabold" : "text-slate-800"}`}>
                    {account.accountName}
                  </span>
                </div>

                {/* Root Type, Account Type, Balance, Action */}
                <div className="flex items-center gap-6">
                  <span className="text-[11px] font-bold text-slate-600 uppercase px-2 py-0.5 rounded-full bg-white/60 border border-slate-200/60">
                    {account.rootType}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 w-28 truncate">
                    {account.accountType || (isGroup ? "Group Parent" : "General")}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 w-28 text-right">
                    {formatCurrency(account.balance)}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteAccount(account.id);
                      loadAccounts();
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Add New General Ledger Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure or ICICI Fixed Deposit"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 5310"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Root Type *</label>
                  <select
                    value={newAccRootType}
                    onChange={(e) => setNewAccRootType(e.target.value as RootType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                    <option value="Receivable">Receivable</option>
                    <option value="Payable">Payable</option>
                    <option value="Operating Expense">Operating Expense</option>
                    <option value="Direct Income">Direct Income</option>
                    <option value="Fixed Asset">Fixed Asset</option>
                    <option value="Tax">Tax</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isGroupCheck"
                  checked={newAccIsGroup}
                  onChange={(e) => setNewAccIsGroup(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isGroupCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Is Group / Parent Account (Can contain sub-accounts)
                </label>
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
                  {isSubmitting ? "Creating..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
