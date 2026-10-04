"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  Trash2,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPaymentEntries, createPaymentEntry, deletePaymentEntry, getAccounts } from "@/lib/api";
import { PaymentEntry, Account, PaymentType, PaymentMode } from "@/types/accounting";

export default function PaymentEntriesPage() {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

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

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.partyName && p.partyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.referenceNo && p.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "ALL" || p.paymentType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Payment Entries &amp; Vouchers
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Receive • Pay • Transfer
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Customer receipts, supplier settlements, and internal bank-to-bank ledger transfers
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
            <span>+ New Payment Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "RECEIVE", "PAY", "INTERNAL_TRANSFER"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {type === "ALL" ? `All (${payments.length})` : type.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search payment # or party..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-600" />
            <span>Payment # &amp; Party</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Type</span>
            <span>Mode</span>
            <span>Accounts (From → To)</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-8"></span>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No payments recorded yet. Click &quot;+ New Payment Entry&quot; to process a transaction!
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="px-4 py-3 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      {p.paymentNumber}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                      {p.paymentDate}
                    </span>
                  </div>
                  <div className="text-zinc-500 font-medium mt-0.5">
                    {p.partyName} {p.referenceNo ? `• Ref: ${p.referenceNo}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
                    {p.paymentType}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-600">
                    {p.modeOfPayment}
                  </span>
                  <span className="text-zinc-500 w-44 truncate">
                    {p.paidFromAccount?.accountName} → {p.paidToAccount?.accountName}
                  </span>
                  <span className="font-mono font-bold text-zinc-900 text-sm w-24 text-right">
                    {formatCurrency(p.paidAmount)}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deletePaymentEntry(p.id);
                      loadData();
                    }}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Record Payment Transaction</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Payment Type *</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="RECEIVE">Receive (Customer Payment)</option>
                    <option value="PAY">Pay (Supplier Disbursement)</option>
                    <option value="INTERNAL_TRANSFER">Internal Transfer (Bank to Cash)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Payment Mode</label>
                  <select
                    value={modeOfPayment}
                    onChange={(e) => setModeOfPayment(e.target.value as PaymentMode)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
                <label className="block text-zinc-700 font-semibold mb-1">Party / Customer / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp or HDFC Bank"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Paid From Account *</label>
                  <select
                    required
                    value={paidFromAccId}
                    onChange={(e) => setPaidFromAccId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
                  <label className="block text-zinc-700 font-semibold mb-1">Paid To Account *</label>
                  <select
                    required
                    value={paidToAccId}
                    onChange={(e) => setPaidToAccId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Reference / UTR / Cheque #</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-982138712"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">User Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice SINV-2026-0001 settlement"
                  value={userRemarks}
                  onChange={(e) => setUserRemarks(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
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
