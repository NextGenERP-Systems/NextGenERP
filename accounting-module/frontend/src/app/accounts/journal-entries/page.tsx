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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getJournalEntries, createJournalEntry, deleteJournalEntry, getAccounts } from "@/lib/api";
import { JournalEntry, Account } from "@/types/accounting";

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Journal Entries (Double-Entry Vouchers)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              Balanced Books
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            General ledger adjustments, depreciation, opening balances, and contra entries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Journal Voucher</span>
          </button>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Voucher # & Date</span>
          </div>
          <div className="flex items-center gap-12">
            <span>Type</span>
            <span>Total Debit</span>
            <span>Total Credit</span>
            <span className="w-24 text-right">Status</span>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No journal entries recorded yet. Click &quot;New Journal Voucher&quot; to post your first transaction!
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50">
            {entries.map((jv) => (
              <div key={jv.id} className="p-5 hover:bg-white/40 transition-colors space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {jv.voucherNumber}
                    </span>
                    <span className="text-slate-500 font-medium">{jv.postingDate}</span>
                  </div>
                  <div className="flex items-center gap-8 font-mono text-xs">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 font-sans">
                      {jv.voucherType}
                    </span>
                    <span className="font-bold text-slate-900">{formatCurrency(jv.totalDebit)}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(jv.totalCredit)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 text-slate-800 border border-slate-200 w-24 text-center font-sans">
                      {jv.status}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteJournalEntry(jv.id);
                        loadData();
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Journal Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {jv.userRemarks && (
                  <p className="text-xs text-slate-500 italic bg-white/30 p-2 rounded-lg border border-white/50">
                    &quot;{jv.userRemarks}&quot;
                  </p>
                )}

                {/* Sub-Rows Preview */}
                {jv.items && jv.items.length > 0 && (
                  <div className="liquid-glass p-3 space-y-1.5 text-[11px]">
                    {jv.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-900">
                            {item.account?.accountName || "General Account"}
                          </span>
                          {item.remarks && (
                            <span className="text-slate-400 text-[10px]">({item.remarks})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 font-mono text-xs">
                          <span className={item.debitAmount > 0 ? "font-bold text-slate-900" : "text-slate-400"}>
                            Dr: {formatCurrency(item.debitAmount)}
                          </span>
                          <span className={item.creditAmount > 0 ? "font-bold text-slate-900" : "text-slate-400"}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Create Double-Entry Journal Voucher</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="JOURNAL_ENTRY">Journal Entry</option>
                    <option value="BANK_ENTRY">Bank Entry</option>
                    <option value="CASH_ENTRY">Cash Entry</option>
                    <option value="OPENING_ENTRY">Opening Entry</option>
                    <option value="CONTRA_ENTRY">Contra Entry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={postingDate}
                    onChange={(e) => setPostingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly cloud server amortization or inter-bank treasury sweep"
                  value={userRemarks}
                  onChange={(e) => setUserRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Multi-Row Debit / Credit Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Accounting Ledger Rows</span>
                  <button
                    type="button"
                    onClick={addRow}
                    className="liquid-btn-glass text-[11px] py-1 px-2.5"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>

                <div className="liquid-glass p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 px-1">
                    <span className="col-span-5">Account</span>
                    <span className="col-span-3">Debit (₹)</span>
                    <span className="col-span-3">Credit (₹)</span>
                    <span className="col-span-1 text-center">Action</span>
                  </div>

                  {rows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          required
                          value={row.accountId}
                          onChange={(e) => updateRow(idx, "accountId", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 text-right"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={row.credit}
                          onChange={(e) => updateRow(idx, "credit", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 text-right"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        {rows.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-1 rounded text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Debit / Credit Balancing Bar */}
                <div className="liquid-glass-card p-3 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <span className="flex items-center gap-1 text-slate-800">
                        <CheckCircle className="w-4 h-4 text-slate-700" />
                        Balanced & Ready to Post!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Unbalanced: Diff = {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span>Total Debit: {formatCurrency(totalDebit)}</span>
                    <span>Total Credit: {formatCurrency(totalCredit)}</span>
                  </div>
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
                  disabled={!isBalanced || isSubmitting}
                  className="liquid-btn-primary text-xs disabled:opacity-50"
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
