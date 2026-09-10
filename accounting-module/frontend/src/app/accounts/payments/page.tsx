"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPaymentEntries, createPaymentEntry, deletePaymentEntry, getAccounts } from "@/lib/api";
import { PaymentEntry, Account, PaymentType, PaymentMode } from "@/types/accounting";

export default function PaymentEntriesPage() {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("RECEIVE");
  const [partyName, setPartyName] = useState("");
  const [paidFromAccId, setPaidFromAccId] = useState("");
  const [paidToAccId, setPaidToAccId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState<PaymentMode>("BANK_TRANSFER");
  const [referenceNo, setReferenceNo] = useState("");
  const [userRemarks, setUserRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [payData, accData] = await Promise.all([getPaymentEntries(), getAccounts()]);
      setPayments(payData);
      setAccounts(accData.filter((a) => !a.isGroup));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paidAmount) return;

    setIsSubmitting(true);
    try {
      const fromAcc = accounts.find((a) => a.id === paidFromAccId) || accounts[0];
      const toAcc = accounts.find((a) => a.id === paidToAccId) || accounts[1];

      await createPaymentEntry({
        paymentType,
        partyName: partyName || "General Party",
        paidFromAccount: fromAcc,
        paidToAccount: toAcc,
        paidAmount: parseFloat(paidAmount) || 0,
        receivedAmount: parseFloat(paidAmount) || 0,
        modeOfPayment,
        referenceNo,
        userRemarks,
      });

      setIsModalOpen(false);
      setPartyName("");
      setPaidAmount("");
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
              Payment Entries
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              Receive • Pay • Transfer
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Customer receipts, supplier settlements, and internal bank-to-bank transfers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Payment Entry</span>
          </button>
        </div>
      </div>

      {/* Payment List */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-slate-600" />
            <span>Payment # & Party</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Type</span>
            <span>Mode</span>
            <span>Paid From & To</span>
            <span className="w-28 text-right">Amount</span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No payments recorded yet. Click &quot;New Payment Entry&quot; to process a transaction!
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50">
            {payments.map((p) => (
              <div
                key={p.id}
                className="px-5 py-4 flex items-center justify-between text-xs hover:bg-white/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {p.paymentNumber}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600 font-sans">
                      {p.paymentDate}
                    </span>
                  </div>
                  <div className="text-slate-500 font-medium mt-0.5">
                    {p.partyName} {p.referenceNo ? `• Ref: ${p.referenceNo}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-800">
                    {p.paymentType}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    {p.modeOfPayment}
                  </span>
                  <span className="text-slate-500 w-40 truncate">
                    {p.paidFromAccount?.accountName} → {p.paidToAccount?.accountName}
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm w-24 text-right">
                    {formatCurrency(p.paidAmount)}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deletePaymentEntry(p.id);
                      loadData();
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Payment Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Record Payment Transaction</h2>
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
                  <label className="block font-bold text-slate-700 mb-1">Payment Type *</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="RECEIVE">Receive (Customer Payment)</option>
                    <option value="PAY">Pay (Supplier Disbursement)</option>
                    <option value="INTERNAL_TRANSFER">Internal Transfer (Bank to Cash)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={modeOfPayment}
                    onChange={(e) => setModeOfPayment(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI / Instant Pay</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Party / Customer / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp or HDFC Bank"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid From Account *</label>
                  <select
                    required
                    value={paidFromAccId}
                    onChange={(e) => setPaidFromAccId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">Select Account...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid To Account *</label>
                  <select
                    required
                    value={paidToAccId}
                    onChange={(e) => setPaidToAccId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">Select Account...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / UTR / Cheque #</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-982138712"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">User Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice SINV-2026-0001 settlement"
                  value={userRemarks}
                  onChange={(e) => setUserRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
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
                  {isSubmitting ? "Processing..." : "Record Payment & Post GL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
