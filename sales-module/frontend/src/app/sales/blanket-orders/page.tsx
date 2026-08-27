"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  X,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  User,
  Package,
} from "lucide-react";
import { getBlanketOrders, createBlanketOrder, closeBlanketOrder, getCustomers, getCatalogItems } from "@/lib/api";
import { BlanketOrder, Customer, CatalogItem } from "@/types/sales";
import Link from "next/link";

function BlanketOrdersContent() {
  const searchParams = useSearchParams();
  const [blanketOrders, setBlanketOrders] = useState<BlanketOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-12-31");
  const [terms, setTerms] = useState("Annual contract with quarterly scheduled releases. Rate locked for 12 months.");
  const [itemCode, setItemCode] = useState("ERP-CLOUD-ENT");
  const [itemName, setItemName] = useState("NextGen Cloud ERP Enterprise License");
  const [qty, setQty] = useState("50");
  const [rate, setRate] = useState("12000");

  const loadData = async () => {
    setLoading(true);
    try {
      const [boData, custData, itemData] = await Promise.all([
        getBlanketOrders(),
        getCustomers(),
        getCatalogItems(),
      ]);
      setBlanketOrders(boData || []);
      setCustomers(custData || []);
      setCatalogItems(itemData || []);

      const qCustId = searchParams.get("customerId");
      const qOpen = searchParams.get("open");

      if (qCustId) {
        setSelectedCustomer(qCustId);
      }
      if (qOpen === "true" || qCustId) {
        setIsCreateOpen(true);
      }
    } catch (err) {
      console.error("Failed to load blanket orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleItemSelect = (code: string) => {
    setItemCode(code);
    const itm = catalogItems.find((i) => i.itemCode === code);
    if (itm) {
      setItemName(itm.itemName);
      setRate(itm.standardRate.toString());
    }
  };

  const handleClose = async (id: string, boNum: string) => {
    if (!confirm(`Are you sure you want to close Blanket Order ${boNum}?`)) return;
    try {
      await closeBlanketOrder(id);
      setActionSuccess(`Blanket Order ${boNum} marked as CLOSED!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to close blanket order: " + (err.message || err));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a Customer Master for this agreement.");
      return;
    }

    try {
      await createBlanketOrder({
        customerId: selectedCustomer,
        fromDate,
        toDate,
        termsAndConditions: terms,
        items: [
          {
            itemCode,
            itemName,
            qty: Number(qty) || 1,
            rate: Number(rate) || 0,
          },
        ],
      });

      setIsCreateOpen(false);
      setActionSuccess("Blanket Order agreement created successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to create blanket order: " + (err.message || err));
    }
  };

  const filteredOrders = blanketOrders.filter(
    (bo) =>
      bo.blanketOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileCheck className="h-6 w-6 text-indigo-600" />
            <span>Blanket Orders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Long-term framework contracts, locked item rates, and quota fulfillment tracking across sales orders.
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Blanket Order</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Blanket Order # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredOrders.length}</span> Blanket Orders
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 p-8 text-center text-xs text-slate-400">Loading blanket orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-slate-400">No blanket orders found.</div>
          ) : (
            filteredOrders.map((bo) => (
              <div
                key={bo.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {bo.blanketOrderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          bo.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {bo.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{bo.customerName}</h3>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Valid: {bo.fromDate}</div>
                    <div>To: {bo.toDate}</div>
                  </div>
                </div>

                {/* Items & Consumption Progress */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {bo.items.map((item) => {
                    const progressPercent = Math.min(
                      100,
                      Math.round(((item.orderedQty || 0) / (item.qty || 1)) * 100)
                    );
                    return (
                      <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{item.itemName}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-1.5">({item.itemCode})</span>
                          </div>
                          <span className="font-mono font-bold text-indigo-700">₹{Number(item.rate).toLocaleString()} / unit</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Ordered: {item.orderedQty} / {item.qty} units</span>
                            <span className="font-semibold">{progressPercent}% Consumed</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                progressPercent >= 100 ? "bg-amber-500" : "bg-indigo-600"
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 italic line-clamp-1">{bo.termsAndConditions}</span>
                  <div className="flex items-center gap-2">
                    {bo.status === "ACTIVE" && (
                      <>
                        <Link
                          href={`/sales/orders?customerId=${bo.customerId}&open=true`}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>+ Sales Order</span>
                        </Link>
                        <button
                          onClick={() => handleClose(bo.id, bo.blanketOrderNumber)}
                          className="px-2 py-1 rounded text-slate-500 hover:text-rose-600 text-[11px]"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Blanket Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                <span>Create Blanket Order Agreement</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Customer Master *</span>
                </label>
                <select
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Valid From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Valid To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Item selection */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Contract Item</span>
                  </label>
                  <select
                    value={itemCode}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {catalogItems.map((itm) => (
                      <option key={itm.id} value={itm.itemCode}>
                        {itm.itemName} ({itm.itemCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Agreed Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Locked Rate (₹)</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Create Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlanketOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Blanket Orders...</div>}>
      <BlanketOrdersContent />
    </Suspense>
  );
}
