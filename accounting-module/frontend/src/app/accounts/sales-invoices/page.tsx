"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Printer,
  Trash2,
  RefreshCw,
  X,
  Building,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSalesInvoices, createSalesInvoice, deleteSalesInvoice } from "@/lib/api";
import { SalesInvoice } from "@/types/accounting";

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerEmail && inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Sales Invoices (Accounts Receivable)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              GST / AR Engine
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Customer billing, automated revenue GL postings, and outstanding payment tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadInvoices}
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
            <span>+ Create Sales Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "PAID", "UNPAID", "OVERDUE", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {status === "ALL" ? `All (${invoices.length})` : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-zinc-600" />
            <span>Invoice # &amp; Customer</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Posting Date</span>
            <span>Due Date</span>
            <span>Grand Total</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-16 text-right">Action</span>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No sales invoices match your search. Click &quot;+ Create Sales Invoice&quot; to issue a new bill!
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="px-4 py-3 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                      Tax Invoice
                    </span>
                  </div>
                  <div className="text-zinc-500 font-medium mt-0.5">
                    {inv.customerName} {inv.customerEmail ? `• ${inv.customerEmail}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <span className="text-zinc-600 font-sans">{inv.postingDate}</span>
                  <span className="text-zinc-600 font-sans">{inv.dueDate}</span>
                  <span className="font-bold text-zinc-900 text-sm">
                    {formatCurrency(inv.grandTotal)}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 w-20 text-center font-sans">
                    {inv.status}
                  </span>
                  <div className="flex items-center gap-1 w-16 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(inv);
                      }}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-500"
                      title="View Invoice"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteSalesInvoice(inv.id);
                        loadInvoices();
                      }}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete Sales Invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sales Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Create New Sales Tax Invoice</h2>
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
                  <label className="block text-zinc-700 font-semibold mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Global Technologies Ltd"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. accounts@acmeglobal.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Invoice Items &amp; Services</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-2.5 py-1 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={it.itemName}
                          onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Rate (₹)"
                          value={it.rate}
                          onChange={(e) => updateItem(idx, "rate", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-zinc-300 text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Taxes Summary */}
                <div className="bg-zinc-100 border border-zinc-200 rounded p-2.5 space-y-1 text-xs text-right font-mono">
                  <div className="flex justify-between font-medium text-zinc-600">
                    <span>Taxable Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-zinc-600">
                    <span>GST (18% Output Tax):</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1 border-t border-zinc-200">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full p-6 rounded-lg space-y-5 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">TAX INVOICE</h2>
                  <p className="text-xs text-zinc-500 font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Billed To & Dates */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-bold text-zinc-900 text-sm mt-0.5">{selectedInvoice.customerName}</div>
                <div className="text-zinc-500">{selectedInvoice.customerEmail || "Corporate Enterprise Client"}</div>
              </div>
              <div className="text-right space-y-1">
                <div><span className="text-zinc-500">Invoice Date:</span> <span className="font-bold font-mono">{selectedInvoice.postingDate}</span></div>
                <div><span className="text-zinc-500">Due Date:</span> <span className="font-bold font-mono">{selectedInvoice.dueDate}</span></div>
                <div><span className="text-zinc-500">Status:</span> <span className="font-bold text-zinc-800 font-mono">{selectedInvoice.status}</span></div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-zinc-200 rounded overflow-hidden text-xs">
              <div className="bg-zinc-50 px-3 py-2 flex justify-between font-bold text-zinc-600 border-b border-zinc-200 text-[11px]">
                <span>Description</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-28 text-right">Rate</span>
                <span className="w-28 text-right">Amount</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {selectedInvoice.items?.map((it, idx) => (
                  <div key={idx} className="px-3 py-2 flex justify-between text-zinc-800">
                    <span>{it.itemName}</span>
                    <span className="w-20 text-center font-mono">{it.quantity}</span>
                    <span className="w-28 text-right font-mono">{formatCurrency(it.rate)}</span>
                    <span className="w-28 text-right font-mono font-bold text-zinc-900">{formatCurrency(it.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="text-xs text-right space-y-1 font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>GST Output (18%):</span>
                <span>{formatCurrency(selectedInvoice.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1.5 border-t border-zinc-200">
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
