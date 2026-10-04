"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getJournalEntries, createJournalEntry, deleteJournalEntry, getAccounts } from "@/lib/api";
import { JournalEntry, Account } from "@/types/accounting";

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState("JOURNAL_ENTRY");
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split("T")[0]);
  const [userRemarks, setUserRemarks] = useState("");
  const [rows, setRows] = useState<{ accountId: string; debit: string; credit: string; remarks: string }[]>([
    { accountId: "", debit: "0", credit: "0", remarks: "" },
    { accountId: "", debit: "0", credit: "0", remarks: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [jvData, accData] = await Promise.all([getJournalEntries(), getAccounts()]);
      setEntries(jvData);
      setAccounts(accData.filter((a) => !a.isGroup));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addRow() {
    setRows([...rows, { accountId: "", debit: "0", credit: "0", remarks: "" }]);
  }

  function removeRow(index: number) {
    if (rows.length <= 2) return;
    setRows(rows.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: string, value: string) {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  }

  const totalDebit = rows.reduce((acc, r) => acc + (parseFloat(r.debit) || 0), 0);
  const totalCredit = rows.reduce((acc, r) => acc + (parseFloat(r.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) return;

    setIsSubmitting(true);
    try {
      const items = rows.map((r) => {
        const acc = accounts.find((a) => a.id === r.accountId);
        return {
          account: acc || accounts[0],
          debitAmount: parseFloat(r.debit) || 0,
          creditAmount: parseFloat(r.credit) || 0,
          remarks: r.remarks,
        };
      });

      await createJournalEntry({
        voucherType,
        postingDate,
        totalDebit,
        totalCredit,
        userRemarks,
        items,
      });

      setIsModalOpen(false);
      setUserRemarks("");
      setRows([
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

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.userRemarks && entry.userRemarks.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.postingDate.includes(searchQuery);
    const matchesType = selectedType === "ALL" || entry.voucherType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Journal Entries (Vouchers)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Double-Entry Books
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            General ledger adjustments, depreciation, opening balances, contra entries & multi-line vouchers
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
            <span>+ New Journal Voucher</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "JOURNAL_ENTRY", "BANK_ENTRY", "CASH_ENTRY", "OPENING_ENTRY", "CONTRA_ENTRY"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedType === type
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {type === "ALL" ? `All (${entries.length})` : type.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search voucher # or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
            <span>Voucher # &amp; Date</span>
          </div>
          <div className="flex items-center gap-10">
            <span>Type</span>
            <span>Total Debit</span>
            <span>Total Credit</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-8"></span>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No journal entries recorded. Click &quot;+ New Journal Voucher&quot; to post a balanced transaction!
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredEntries.map((jv) => (
              <div key={jv.id} className="p-4 hover:bg-zinc-50/60 transition-colors space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      {jv.voucherNumber}
                    </span>
                    <span className="text-zinc-500 font-medium">{jv.postingDate}</span>
                  </div>
                  <div className="flex items-center gap-8 font-mono text-xs">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-sans">
                      {jv.voucherType}
                    </span>
                    <span className="font-bold text-zinc-900">{formatCurrency(jv.totalDebit)}</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(jv.totalCredit)}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 w-20 text-center font-sans">
                      {jv.status}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteJournalEntry(jv.id);
                        loadData();
                      }}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete Journal Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {jv.userRemarks && (
                  <p className="text-xs text-zinc-500 italic bg-zinc-50 px-2.5 py-1.5 rounded border border-zinc-200">
                    &quot;{jv.userRemarks}&quot;
                  </p>
                )}

                {/* Sub-Rows Preview */}
                {jv.items && jv.items.length > 0 && (
                  <div className="bg-zinc-50/80 border border-zinc-200 rounded p-2.5 space-y-1.5 text-[11px]">
                    {jv.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-700">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                          <span className="font-semibold text-zinc-900">
                            {item.account?.accountName || "General Account"}
                          </span>
                          {item.remarks && (
                            <span className="text-zinc-400 text-[10px]">({item.remarks})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 font-mono text-xs">
                          <span className={item.debitAmount > 0 ? "font-bold text-zinc-900" : "text-zinc-400"}>
                            Dr: {formatCurrency(item.debitAmount)}
                          </span>
                          <span className={item.creditAmount > 0 ? "font-bold text-zinc-900" : "text-zinc-400"}>
                            Cr: {formatCurrency(item.creditAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Journal Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Create Double-Entry Journal Voucher</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="JOURNAL_ENTRY">Journal Entry</option>
                    <option value="BANK_ENTRY">Bank Entry</option>
                    <option value="CASH_ENTRY">Cash Entry</option>
                    <option value="OPENING_ENTRY">Opening Entry</option>
                    <option value="CONTRA_ENTRY">Contra Entry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={postingDate}
                    onChange={(e) => setPostingDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Remarks / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly server amortization or payroll accruals"
                  value={userRemarks}
                  onChange={(e) => setUserRemarks(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              {/* Multi-Row Debit / Credit Table */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Accounting Ledger Rows</span>
                  <button
                    type="button"
                    onClick={addRow}
                    className="px-2.5 py-1 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                    <span className="col-span-5">Account</span>
                    <span className="col-span-3">Debit (₹)</span>
                    <span className="col-span-3">Credit (₹)</span>
                    <span className="col-span-1 text-center">Del</span>
                  </div>

                  {rows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          required
                          value={row.accountId}
                          onChange={(e) => updateRow(idx, "accountId", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        >
                          <option value="">Select Account...</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountCode} - {a.accountName} ({a.rootType})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={row.debit}
                          onChange={(e) => updateRow(idx, "debit", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={row.credit}
                          onChange={(e) => updateRow(idx, "credit", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        {rows.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Debit / Credit Balancing Bar */}
                <div className="bg-zinc-100 border border-zinc-200 rounded p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <span className="flex items-center gap-1 font-bold text-zinc-900">
                        <CheckCircle className="w-4 h-4 text-zinc-800" />
                        Balanced (Debits == Credits)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-600 font-medium">
                        <AlertTriangle className="w-4 h-4 text-zinc-500" />
                        Unbalanced: Diff = {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 font-mono font-bold text-zinc-900">
                    <span>Dr: {formatCurrency(totalDebit)}</span>
                    <span>Cr: {formatCurrency(totalCredit)}</span>
                  </div>
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
                  disabled={!isBalanced || isSubmitting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Journal Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
