"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Printer,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  Building,
  DollarSign,
  ArrowDownLeft,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSalesInvoices, createSalesInvoice, deleteSalesInvoice } from "@/lib/api";
import { SalesInvoice } from "@/types/accounting";

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<{ itemCode: string; itemName: string; quantity: string; rate: string; taxRate: string }[]>([
    { itemCode: "SRV-001", itemName: "ERP Enterprise License & Cloud Setup", quantity: "1", rate: "150000", taxRate: "18" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await getSalesInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems([...items, { itemCode: "SRV-002", itemName: "Custom Software Engineering Service", quantity: "1", rate: "50000", taxRate: "18" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  const subtotal = items.reduce((acc, it) => acc + ((parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0)), 0);
  const totalTax = subtotal * 0.18;
  const grandTotal = subtotal + totalTax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName) return;

    setIsSubmitting(true);
    try {
      const formattedItems = items.map((it) => ({
        itemCode: it.itemCode,
        itemName: it.itemName,
        quantity: parseFloat(it.quantity) || 1,
        rate: parseFloat(it.rate) || 0,
        amount: (parseFloat(it.quantity) || 1) * (parseFloat(it.rate) || 0),
        taxRate: parseFloat(it.taxRate) || 18,
      }));

      await createSalesInvoice({
        customerName,
        customerEmail,
        postingDate,
        dueDate,
        remarks,
        items: formattedItems,
      });

      setIsModalOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      await loadInvoices();
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
              Sales Invoices (Accounts Receivable)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              GST / AR Engine
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Customer billing, automated revenue GL postings, and outstanding payment tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadInvoices} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sales Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Invoice # & Customer</span>
          </div>
          <div className="flex items-center gap-10">
            <span>Posting Date</span>
            <span>Due Date</span>
            <span>Grand Total</span>
            <span className="w-24 text-right">Status</span>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No sales invoices created yet. Click &quot;Create Sales Invoice&quot; to issue your first invoice!
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="px-5 py-4 flex items-center justify-between text-xs hover:bg-white/40 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600">
                      Tax Invoice
                    </span>
                  </div>
                  <div className="text-slate-500 font-medium mt-0.5">
                    {inv.customerName} {inv.customerEmail ? `• ${inv.customerEmail}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <span className="text-slate-600 font-sans">{inv.postingDate}</span>
                  <span className="text-slate-600 font-sans">{inv.dueDate}</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatCurrency(inv.grandTotal)}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 text-slate-800 border border-slate-200 w-24 text-center font-sans">
                    {inv.status}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteSalesInvoice(inv.id);
                      loadInvoices();
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Sales Invoice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sales Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Create New Sales Tax Invoice</h2>
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
                  <label className="block font-bold text-slate-700 mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Global Technologies Ltd"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. accounts@acmeglobal.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Invoice Items & Services</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="liquid-btn-glass text-[11px] py-1 px-2.5"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="liquid-glass p-3 space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={it.itemName}
                          onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Rate (₹)"
                          value={it.rate}
                          onChange={(e) => updateItem(idx, "rate", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 rounded text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Taxes Summary */}
                <div className="liquid-glass-card p-3 space-y-1.5 text-xs text-right font-mono">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>GST (18% Output Tax):</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
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
                  disabled={isSubmitting}
                  className="liquid-btn-primary text-xs"
                >
                  {isSubmitting ? "Generating..." : "Generate & Post Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Inspector Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-white max-h-[90vh] overflow-y-auto print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-800">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">TAX INVOICE</h2>
                  <p className="text-xs text-slate-500 font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="liquid-btn-glass text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Billed To & Dates */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-extrabold text-slate-900 text-sm mt-1">{selectedInvoice.customerName}</div>
                <div className="text-slate-500">{selectedInvoice.customerEmail || "Corporate Enterprise Client"}</div>
              </div>
              <div className="text-right space-y-1">
                <div><span className="text-slate-500">Invoice Date:</span> <span className="font-bold font-mono">{selectedInvoice.postingDate}</span></div>
                <div><span className="text-slate-500">Due Date:</span> <span className="font-bold font-mono">{selectedInvoice.dueDate}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className="font-bold text-slate-800">{selectedInvoice.status}</span></div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 flex justify-between font-bold text-slate-600 border-b border-slate-200">
                <span>Description</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-28 text-right">Rate</span>
                <span className="w-28 text-right">Amount</span>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedInvoice.items?.map((it, idx) => (
                  <div key={idx} className="px-4 py-3 flex justify-between text-slate-800">
                    <span>{it.itemName}</span>
                    <span className="w-20 text-center font-mono">{it.quantity}</span>
                    <span className="w-28 text-right font-mono">{formatCurrency(it.rate)}</span>
                    <span className="w-28 text-right font-mono font-bold">{formatCurrency(it.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="text-xs text-right space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Output (18%):</span>
                <span>{formatCurrency(selectedInvoice.totalTax)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
