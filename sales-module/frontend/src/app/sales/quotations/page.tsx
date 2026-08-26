"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getQuotations, getCustomers, getItems, createQuotation } from "@/lib/api";
import { Quotation, Customer, CatalogItem } from "@/types/sales";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderType, setOrderType] = useState("SALES");
  const [validTill, setValidTill] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("0");
  const [quotationItems, setQuotationItems] = useState<
    { itemId: string; qty: number; rate: number; discountPercentage: number }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [qData, cData, iData] = await Promise.all([
          getQuotations(),
          getCustomers(),
          getItems(),
        ]);
        setQuotations(qData);
        setCustomers(cData);
        setItems(iData);
        if (cData.length > 0) setSelectedCustomerId(cData[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const calculatedTax = calculatedNetTotal * 0.0825; // 8.25% standard tax
  const discountVal = (calculatedNetTotal + calculatedTax) * (parseFloat(additionalDiscount || "0") / 100);
  const calculatedGrandTotal = calculatedNetTotal + calculatedTax - discountVal;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || quotationItems.length === 0) {
      alert("Please select a customer and add at least one item.");
      return;
    }

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
          accountHead: "State Sales Tax (6.25%)",
          rate: 6.25,
        },
        {
          chargeType: "ON_NET_TOTAL",
          accountHead: "Municipal Surcharge (2.0%)",
          rate: 2.0,
        },
      ],
    };

    const created = await createQuotation(payload);
    setQuotations([created, ...quotations]);
    setIsCreateOpen(false);
    setQuotationItems([]);
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
            Quotations Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, calculate, and convert sales quotations with real-time tax & pricing engines.
          </p>
        </div>
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations by # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 self-stretch sm:self-auto overflow-x-auto">
          {["ALL", "OPEN", "ORDERED", "LOST", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === st
                  ? "bg-slate-100 text-slate-900 shadow-sm border border-blue-200"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Quotation #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Valid Till</th>
                  <th className="py-3.5 px-4">Net Total</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredQuotations.map((qtn) => (
                  <tr key={qtn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {qtn.quotationNumber}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[200px]">{qtn.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{formatDate(qtn.transactionDate)}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{formatDate(qtn.validTill)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {formatCurrency(qtn.netTotal, qtn.currency)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(qtn.grandTotal, qtn.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={qtn.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {qtn.status === "OPEN" && (
                        <span className="text-[11px] text-slate-500 font-mono flex items-center justify-end gap-1">
                          Ready for Order <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Quotation Builder Drawer / Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-500" />
                  New Quotation Builder
                </h2>
                <p className="text-xs text-slate-400">
                  Dynamic line item discounts, multi-tier tax computations, and price list lookup.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-5">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Customer Account
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="SALES">Sales Order</option>
                    <option value="MAINTENANCE">Maintenance Agreement</option>
                    <option value="SHOPPING_CART">Shopping Cart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Valid Till Date
                  </label>
                  <input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Line Items & Discounts
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-white px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    <Plus className="h-3 w-3" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {quotationItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="col-span-5">
                        <select
                          value={row.itemId}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                        >
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.itemName} ({i.itemCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.qty}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].qty = parseFloat(e.target.value) || 1;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={row.rate}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].rate = parseFloat(e.target.value) || 0;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-mono text-right focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Disc %"
                          value={row.discountPercentage}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].discountPercentage = parseFloat(e.target.value) || 0;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 text-right focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-blue-7000 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount Summary */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">Additional Overall Discount (%)</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={additionalDiscount}
                    onChange={(e) => setAdditionalDiscount(e.target.value)}
                    className="w-32 bg-slate-100 border border-slate-200 rounded p-1.5 text-xs text-slate-700"
                  />
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Automatically applies 6.25% State Sales Tax and 2.0% Municipal Surcharge.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Net Total:</span>
                    <span>{formatCurrency(calculatedNetTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes & Charges (8.25%):</span>
                    <span>{formatCurrency(calculatedTax)}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({additionalDiscount}%):</span>
                      <span>-{formatCurrency(discountVal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(calculatedGrandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Create & Calculate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
