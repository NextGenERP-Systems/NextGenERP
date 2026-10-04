"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Building2,
  Search,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPurchaseInvoices, createPurchaseInvoice, deletePurchaseInvoice } from "@/lib/api";
import { PurchaseInvoice } from "@/types/accounting";

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierGstin, setSupplierGstin] = useState("");
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<{ itemName: string; quantity: string; rate: string }[]>([
    { itemName: "Google Cloud Platform (GCP) Dedicated Hosting", quantity: "1", rate: "85000" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await getPurchaseInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems([...items, { itemName: "Office Internet & Telecom Leased Line", quantity: "1", rate: "12000" }]);
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
    if (!supplierName) return;

    setIsSubmitting(true);
    try {
      const formattedItems = items.map((it) => ({
        itemName: it.itemName,
        quantity: parseFloat(it.quantity) || 1,
        rate: parseFloat(it.rate) || 0,
        amount: (parseFloat(it.quantity) || 1) * (parseFloat(it.rate) || 0),
      }));

      await createPurchaseInvoice({
        supplierName,
        supplierEmail,
        supplierGstin,
        postingDate,
        dueDate,
        remarks,
        totalTax,
        items: formattedItems,
      });

      setIsModalOpen(false);
      setSupplierName("");
      setSupplierEmail("");
      await loadInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.billNumber || inv.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.supplierGstin && inv.supplierGstin.toLowerCase().includes(searchQuery.toLowerCase()));
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
              Purchase Invoices (Accounts Payable)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Vendor Bills &amp; AP
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Supplier bills, operating expenses, IT infrastructure subscriptions &amp; accounts payable ledger
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
            <span>+ Record Purchase Bill</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search bill # or supplier..."
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
            <Receipt className="w-3.5 h-3.5 text-zinc-600" />
            <span>Bill # &amp; Supplier</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Bill Date</span>
            <span>Due Date</span>
            <span>Grand Total</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-8"></span>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No purchase bills match your search criteria. Click &quot;+ Record Purchase Bill&quot; to log a vendor bill!
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="px-4 py-3 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      {inv.billNumber || inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                      Vendor Bill
                    </span>
                  </div>
                  <div className="text-zinc-500 font-medium mt-0.5">
                    {inv.supplierName} {inv.supplierGstin ? `• GSTIN: ${inv.supplierGstin}` : ""}
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
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deletePurchaseInvoice(inv.id);
                      loadInvoices();
                    }}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete Purchase Bill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Purchase Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Record Vendor Purchase Bill</h2>
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
                  <label className="block text-zinc-700 font-semibold mb-1">Supplier / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services or WeWork India"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Supplier GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Bill Posting Date *</label>
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
                  <span className="font-bold text-zinc-900">Expense &amp; Purchase Items</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-2.5 py-1 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Expense Description"
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
                    <span>Input Tax Credit (18% ITC):</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1 border-t border-zinc-200">
                    <span>Payable Total:</span>
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
                  {isSubmitting ? "Recording..." : "Record & Post Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
