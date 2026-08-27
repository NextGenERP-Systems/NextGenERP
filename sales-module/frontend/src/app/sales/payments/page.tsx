"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  DollarSign,
  Receipt,
  Building2,
  RefreshCw,
  X,
  ArrowDownRight,
  Ban,
} from "lucide-react";
import {
  getPayments,
  getCustomers,
  getSalesInvoices,
  getSalesOrders,
  recordPayment,
  cancelPaymentEntry,
} from "@/lib/api";
import { PaymentEntry, Customer, SalesInvoice, SalesOrder } from "@/types/sales";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [orders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Payment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<any>("BANK_TRANSFER");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [payData, custData, invData, ordData] = await Promise.all([
        getPayments(),
        getCustomers(),
        getSalesInvoices(),
        getSalesOrders(),
      ]);
      setPayments(payData || []);
      setCustomers(custData || []);
      setInvoices(invData || []);
      setSalesOrders(ordData || []);

      const qCustId = searchParams.get("customerId");
      const qInvId = searchParams.get("salesInvoiceId");
      const qOpen = searchParams.get("open");

      if (qCustId) {
        setSelectedCustomer(qCustId);
      }
      if (qInvId) {
        setSelectedInvoice(qInvId);
        const matchedInv = (invData || []).find((i) => i.id === qInvId);
        if (matchedInv) {
          setSelectedCustomer(matchedInv.customerId);
          setPaidAmount(matchedInv.outstandingAmount.toString());
        }
      }
      if (qOpen === "true" || qCustId || qInvId) {
        setReferenceNo(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
        setIsCreateOpen(true);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // When user selects a Sales Invoice -> Auto-fill customer and amount
  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoice(invId);
    if (!invId) return;

    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setSelectedCustomer(inv.customerId);
      setPaidAmount(inv.outstandingAmount.toString());
    }
  };

  const handleCancelPayment = async (id: string, payNum: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel payment ${payNum}? This will restore the customer's balance/invoice outstanding and post contra GL reversals.`
      )
    ) {
      return;
    }
    try {
      await cancelPaymentEntry(id);
      setActionSuccess(`Payment ${payNum} cancelled and GL reversal contra entries posted!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to cancel payment: " + (err.message || err));
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNo && p.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paidAmount) {
      alert("Please select a customer and specify the paid amount.");
      return;
    }

    try {
      await recordPayment({
        customerId: selectedCustomer,
        salesInvoiceId: selectedInvoice || undefined,
        salesOrderId: selectedOrder || undefined,
        paidAmount: Number(paidAmount),
        paymentMode,
        referenceNo: referenceNo || `UTR-${Math.floor(100000 + Math.random() * 900000)}`,
        notes,
      });

      setIsCreateOpen(false);
      setActionSuccess(`Customer payment of ₹${Number(paidAmount).toLocaleString()} recorded successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to record payment: " + (err.message || err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <span>Payment Entries</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts receivable collections, invoice reconciliations, bank ledger debits, and customer credit adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setReferenceNo(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment #, Customer, Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredPayments.length}</span> Payments
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Mode & Reference</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No payment entries found.</td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-emerald-700 font-mono">{p.paymentNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{p.customerName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{p.postingDate}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{p.paymentMode}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.referenceNo || "N/A"}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(p.paidAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleCancelPayment(p.id, p.paymentNumber)}
                          title="Cancel Payment & Post Reversal GL Entries"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-all inline-flex items-center"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Record Customer Payment</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>Customer Master *</span>
                </label>
                <select
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <Receipt className="h-3.5 w-3.5 text-amber-600" />
                  <span>Settle Against Sales Invoice (Optional)</span>
                </label>
                <select
                  value={selectedInvoice}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="">None / Advance Payment on Account</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName} (Due: ₹{Number(inv.outstandingAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amount to Receive (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer (NEFT/RTGS)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="UPI">UPI / Digital Instant</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="CASH">Cash Deposit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Transaction Reference / UTR #</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Remarks / Memo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Customer reference or ledger narration..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Post Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Payments...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
