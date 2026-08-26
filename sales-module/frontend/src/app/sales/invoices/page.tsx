"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  X,
  AlertCircle,
  RefreshCw,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { getSalesInvoices, getCustomers, getSalesOrders, createSalesInvoice, recordPayment } from "@/lib/api";
import { SalesInvoice, Customer, SalesOrder } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printDoc, setPrintDoc] = useState<any>(null);

  // New Invoice Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [notes, setNotes] = useState("");

  // Record Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK_TRANSFER");
  const [referenceNo, setReferenceNo] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, custData, orderData] = await Promise.all([
        getSalesInvoices(),
        getCustomers(),
        getSalesOrders(),
      ]);
      setInvoices(invData || []);
      setCustomers(custData || []);
      setSalesOrders(orderData || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const itemsPayload = [
        {
          itemCode: "ERP-CLOUD-ENT",
          itemName: "NextGen Cloud ERP Enterprise License",
          qty: 1,
          rate: 12000,
          incomeAccount: "4110 - Sales Revenue",
        },
      ];

      await createSalesInvoice({
        customerId: selectedCustomer,
        salesOrderId: selectedOrder || undefined,
        paymentTerms,
        notes,
        items: itemsPayload,
      });

      setIsCreateOpen(false);
      setActionSuccess("Sales Invoice generated successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || !paymentAmount) return;

    try {
      await recordPayment({
        customerId: paymentInvoice.customerId,
        salesInvoiceId: paymentInvoice.id,
        salesOrderId: paymentInvoice.salesOrderId,
        paidAmount: Number(paymentAmount),
        paymentMode,
        referenceNo,
        notes: `Payment for Invoice ${paymentInvoice.invoiceNumber}`,
      });

      setIsPaymentOpen(false);
      setActionSuccess(`Payment of ₹${Number(paymentAmount).toLocaleString()} recorded against ${paymentInvoice.invoiceNumber}!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    }
  };

  const openPaymentModal = (inv: SalesInvoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(String(inv.outstandingAmount));
    setReferenceNo(`WIRE-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsPaymentOpen(true);
  };

  const openPrint = (inv: SalesInvoice) => {
    setPrintDoc({
      title: "Sales Tax Invoice",
      docNumber: inv.invoiceNumber,
      docDate: inv.postingDate,
      customerName: inv.customerName,
      currency: inv.currency || "INR",
      items: inv.items || [],
      netTotal: inv.netTotal,
      totalTax: inv.totalTax,
      grandTotal: inv.grandTotal,
      notes: `Due Date: ${inv.dueDate} | Terms: ${inv.paymentTerms || "Net 30"}`,
      status: inv.status,
    });
    setIsPrintOpen(true);
  };

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.grandTotal) || 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (Number(inv.outstandingAmount) || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-blue-600" />
            <span>Sales Invoices & Billing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts Receivable, tax breakdown, customer billing status, and receipt allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>New Sales Invoice</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced Volume</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ₹{totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">{invoices.length} Total Invoices Issued</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Collected / Paid</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ₹{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Realized Sales Revenue
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding AR Balance</div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            ₹{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3" /> Pending Payment Collection
          </div>
        </div>
      </div>

      {/* Main Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Invoice #, Customer, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> Invoices
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-blue-600 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.postingDate}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(inv.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 font-mono">
                      ₹{Number(inv.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 font-mono">
                      ₹{Number(inv.outstandingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : inv.status === "PARTLY_PAID"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPrint(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Print / PDF"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {inv.outstandingAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold transition-all"
                            title="Record Customer Payment"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentOpen && paymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Record Customer Payment</span>
              </h2>
              <button onClick={() => setIsPaymentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Invoice Number:</span>
                <span className="font-semibold text-slate-900 font-mono">{paymentInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{paymentInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                <span>Outstanding Due:</span>
                <span className="font-mono">₹{Number(paymentInvoice.outstandingAmount).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amount to Settle (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={paymentInvoice.outstandingAmount}
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sales Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                <span>Create New Sales Invoice</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer *</label>
                <select
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                <label className="font-semibold text-slate-700">Sales Order (Optional)</label>
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="">None / Direct Invoice</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.orderNumber} - {so.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="Immediate / Due on Receipt">Immediate / Due on Receipt</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment bank instructions or tax memo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Document Modal */}
      {printDoc && (
        <PrintDocumentModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          {...printDoc}
        />
      )}
    </div>
  );
}
