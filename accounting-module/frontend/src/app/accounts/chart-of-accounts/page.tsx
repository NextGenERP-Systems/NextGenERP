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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Chart of Accounts (CoA)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              5 Root Types
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Hierarchical structure of all general ledger accounts, groups, and running balances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAccounts}
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
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Root Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRootType("ALL")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedRootType === "ALL"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            All Accounts ({accounts.length})
          </button>
          {rootGroups.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRootType(r)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                selectedRootType === r
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {r.toLowerCase()} ({accounts.filter((a) => a.rootType === r).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search account name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Chart of Accounts Tree Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            <span>Account Code & Name</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Root Type</span>
            <span>Account Type</span>
            <span className="w-32 text-right">Running Balance</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {filteredAccounts.map((account) => {
            const isGroup = account.isGroup;
            const isExpanded = expandedGroups[account.accountCode] ?? true;

            return (
              <div
                key={account.id}
                className={`px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50 transition-colors ${
                  isGroup ? "font-bold text-zinc-900 bg-zinc-50/50" : "text-zinc-700 font-medium"
                }`}
              >
                {/* Account Name with Indentation & Icon */}
                <div className="flex items-center gap-2.5">
                  {isGroup ? (
                    <button
                      onClick={() => toggleGroup(account.accountCode)}
                      className="p-0.5 rounded hover:bg-zinc-200 text-zinc-500"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-700" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4" />
                  )}

                  <div className="w-5 h-5 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                    {isGroup ? <Folder className="w-3 h-3" /> : <FileSpreadsheet className="w-3 h-3" />}
                  </div>

                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                    {account.accountCode}
                  </span>

                  <span className={`${isGroup ? "text-zinc-950 font-bold" : "text-zinc-800"}`}>
                    {account.accountName}
                  </span>
                </div>

                {/* Root Type, Account Type, Balance, Action */}
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 uppercase">
                    {account.rootType}
                  </span>
                  <span className="text-[11px] text-zinc-500 w-28 truncate">
                    {account.accountType || (isGroup ? "Group Parent" : "General")}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-900 w-28 text-right">
                    {formatCurrency(account.balance)}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteAccount(account.id);
                      loadAccounts();
                    }}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Add New General Ledger Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure or ICICI Fixed Deposit"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Account Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 5310"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Root Type *</label>
                  <select
                    value={newAccRootType}
                    onChange={(e) => setNewAccRootType(e.target.value as RootType)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
                  <label className="block text-zinc-700 font-semibold mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isGroupCheck"
                  checked={newAccIsGroup}
                  onChange={(e) => setNewAccIsGroup(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="isGroupCheck" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                  Is Group / Parent Account (Can contain child accounts)
                </label>
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
