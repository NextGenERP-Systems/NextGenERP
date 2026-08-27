"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Calendar,
  IndianRupee,
  Percent,
  Layers,
  X,
  RefreshCw,
  Printer,
  User,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getQuotations, getCustomers, getItems, createQuotation } from "@/lib/api";
import { Quotation, Customer, CatalogItem } from "@/types/sales";
import Link from "next/link";

function QuotationsContent() {
  const searchParams = useSearchParams();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderType, setOrderType] = useState("SALES");
  const [validTill, setValidTill] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("0");
  const [quotationItems, setQuotationItems] = useState<
    { itemId: string; qty: number; rate: number; discountPercentage: number }[]
  >([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, cData, iData] = await Promise.all([
        getQuotations(),
        getCustomers(),
        getItems(),
      ]);
      setQuotations(qData || []);
      setCustomers(cData || []);
      setItems(iData || []);

      const qCustId = searchParams.get("customerId");
      const qOpen = searchParams.get("open");

      if (qCustId) {
        setSelectedCustomerId(qCustId);
      } else if (cData && cData.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(cData[0].id);
      }

      if (qOpen === "true" || qCustId) {
        setIsCreateOpen(true);
        if (iData && iData.length > 0) {
          setQuotationItems([
            {
              itemId: iData[0].id,
              qty: 1,
              rate: iData[0].standardRate,
              discountPercentage: 0,
            },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleAddItemRow = () => {
    if (items.length === 0) return;
    setQuotationItems([
      ...quotationItems,
      {
        itemId: items[0].id,
        qty: 1,
        rate: items[0].standardRate,
        discountPercentage: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, itemId: string) => {
    const selected = items.find((i) => i.id === itemId);
    if (!selected) return;
    const updated = [...quotationItems];
    updated[idx] = {
      ...updated[idx],
      itemId,
      rate: selected.standardRate,
    };
    setQuotationItems(updated);
  };

  // Real-time calculation
  const calculatedNetTotal = quotationItems.reduce((acc, row) => {
    const rowRate = row.rate * (1 - row.discountPercentage / 100);
    return acc + row.qty * rowRate;
  }, 0);

  const calculatedTax = calculatedNetTotal * 0.18; // 18% standard GST
  const discountVal = (calculatedNetTotal + calculatedTax) * (parseFloat(additionalDiscount || "0") / 100);
  const calculatedGrandTotal = calculatedNetTotal + calculatedTax - discountVal;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || quotationItems.length === 0) {
      alert("Please select a customer and add at least one item.");
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerId,
        orderType,
        validTill: validTill || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        additionalDiscountPercentage: parseFloat(additionalDiscount || "0"),
        items: quotationItems.map((qi) => ({
          itemId: qi.itemId,
          qty: qi.qty,
          priceListRate: qi.rate,
          discountPercentage: qi.discountPercentage,
        })),
        taxes: [
          {
            chargeType: "ON_NET_TOTAL",
            accountHead: "Output IGST / CGST (18%)",
            rate: 18.0,
          },
        ],
      };

      const created = await createQuotation(payload);
      setQuotations([created, ...quotations]);
      setIsCreateOpen(false);
      setQuotationItems([]);
      setActionSuccess(`Quotation ${created.quotationNumber} generated successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to create quotation: " + (err.message || err));
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Quotations Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, calculate, and convert sales quotations with real-time tax & pricing engines.
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
              setIsCreateOpen(true);
              if (quotationItems.length === 0 && items.length > 0) {
                setQuotationItems([
                  {
                    itemId: items[0].id,
                    qty: 1,
                    rate: items[0].standardRate,
                    discountPercentage: 0,
                  },
                ]);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "DRAFT", "OPEN", "ORDERED", "LOST"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Quotation #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Valid Till</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading quotations...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No quotations found.</td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{q.quotationNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{q.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{formatDate(q.transactionDate)}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{formatDate(q.validTill)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(q.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.status === "OPEN" && (
                          <Link
                            href={`/sales/orders?quotationId=${q.id}&customerId=${q.customerId}&open=true`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-semibold"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            <span>Convert to Order</span>
                          </Link>
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

      {/* Create Modal with Connects */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Create Sales Quotation</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>Customer *</span>
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="">Select Customer Master...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Valid Till Date</label>
                  <input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Quoted Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {quotationItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No items added. Click &quot;Add Item&quot; above.</div>
                ) : (
                  <div className="space-y-2">
                    {quotationItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="col-span-6 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Item</label>
                          <select
                            value={item.itemId}
                            onChange={(e) => handleItemChange(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs"
                          >
                            {items.map((itm) => (
                              <option key={itm.id} value={itm.id}>
                                {itm.itemName} ({itm.itemCode})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...quotationItems];
                              updated[idx].qty = Number(e.target.value) || 1;
                              setQuotationItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                          />
                        </div>
                        <div className="col-span-3 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const updated = [...quotationItems];
                              updated[idx].rate = Number(e.target.value) || 0;
                              setQuotationItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-right font-mono"
                          />
                        </div>
                        <div className="col-span-1 text-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculation breakdown */}
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <div className="w-56 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Net Total:</span>
                      <span className="font-mono font-semibold">₹{calculatedNetTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Output GST (18%):</span>
                      <span className="font-mono font-semibold text-blue-600">+₹{calculatedTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                      <span>Grand Total:</span>
                      <span className="font-mono text-emerald-700">₹{calculatedGrandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Quotations...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}
