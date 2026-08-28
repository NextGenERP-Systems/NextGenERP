"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Package,
  Layers,
  Users,
  Calendar,
  CreditCard,
  X,
  FileCheck,
  Truck,
  Receipt,
  Plus,
  RefreshCw,
  Printer,
  Trash2,
  User,
  ShoppingBag,
  FileText,
  Home,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getSalesOrders,
  getCustomers,
  getQuotations,
  getItems,
  createSalesOrder,
  submitSalesOrder,
  cancelSalesOrder,
} from "@/lib/api";
import { SalesOrder, Customer, Quotation, CatalogItem } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";
import Link from "next/link";

function SalesOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printDoc, setPrintDoc] = useState<any>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [orderType, setOrderType] = useState("SALES");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [poNo, setPoNo] = useState("");
  const [orderItems, setOrderItems] = useState<
    { itemId: string; itemCode: string; itemName: string; qty: number; rate: number }[]
  >([]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordData, custData, qtnData, itemData] = await Promise.all([
        getSalesOrders(),
        getCustomers(),
        getQuotations(),
        getItems(),
      ]);
      setOrders(ordData || []);
      setCustomers(custData || []);
      setQuotations(qtnData || []);
      setCatalogItems(itemData || []);

      if (ordData && ordData.length > 0 && !selectedOrder) {
        setSelectedOrder(ordData[0]);
      }

      // Check URL parameters for connections
      const qCustId = searchParams.get("customerId");
      const qQtnId = searchParams.get("quotationId");
      const qOpen = searchParams.get("open");

      if (qCustId) {
        setSelectedCustomer(qCustId);
      }
      if (qQtnId) {
        setSelectedQuotation(qQtnId);
        const matchedQtn = (qtnData || []).find((q) => q.id === qQtnId);
        if (matchedQtn) {
          setSelectedCustomer(matchedQtn.customerId);
          if (matchedQtn.items && matchedQtn.items.length > 0) {
            setOrderItems(
              matchedQtn.items.map((i) => ({
                itemId: i.itemId || "",
                itemCode: i.itemCode,
                itemName: i.itemName,
                qty: i.qty,
                rate: i.rate,
              }))
            );
          }
        }
      }
      if (qOpen === "true" || qCustId || qQtnId) {
        setIsCreateOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchParams]);

  // Handle Quotation Selection in Create Modal -> Auto-fill Customer and Items
  const handleQuotationSelect = (qtnId: string) => {
    setSelectedQuotation(qtnId);
    if (!qtnId) return;

    const qtn = quotations.find((q) => q.id === qtnId);
    if (qtn) {
      setSelectedCustomer(qtn.customerId);
      if (qtn.items && qtn.items.length > 0) {
        setOrderItems(
          qtn.items.map((i) => ({
            itemId: i.itemId || "",
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty,
            rate: i.rate,
          }))
        );
      }
    }
  };

  const handleAddItemRow = () => {
    if (catalogItems.length === 0) return;
    const defaultItem = catalogItems[0];
    setOrderItems([
      ...orderItems,
      {
        itemId: defaultItem.id,
        itemCode: defaultItem.itemCode,
        itemName: defaultItem.itemName,
        qty: 1,
        rate: defaultItem.standardRate,
      },
    ]);
  };

  const handleItemChange = (idx: number, itemCode: string) => {
    const itm = catalogItems.find((i) => i.itemCode === itemCode);
    if (!itm) return;
    const updated = [...orderItems];
    updated[idx] = {
      ...updated[idx],
      itemId: itm.id,
      itemCode: itm.itemCode,
      itemName: itm.itemName,
      rate: itm.standardRate,
    };
    setOrderItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const itemsSubtotal = orderItems.reduce((acc, row) => acc + row.qty * row.rate, 0);
  const taxAmount = itemsSubtotal * 0.18;
  const grandTotal = itemsSubtotal + taxAmount;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a Customer for this Sales Order.");
      return;
    }

    const payloadItems =
      orderItems.length > 0
        ? orderItems.map((i) => ({
            itemId: i.itemId,
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty,
            rate: i.rate,
          }))
        : [
            {
              itemCode: "ERP-CLOUD-ENT",
              itemName: "NextGen Cloud ERP Enterprise License",
              qty: 1,
              rate: 12000,
            },
          ];

    try {
      const created = await createSalesOrder({
        customerId: selectedCustomer,
        quotationId: selectedQuotation || undefined,
        orderType,
        deliveryDate: deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        poNo: poNo || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        items: payloadItems,
      });

      setIsCreateOpen(false);
      setActionSuccess(`Sales Order ${created.orderNumber} created successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadOrders();
    } catch (err: any) {
      alert("Failed to create sales order: " + (err.message || err));
    }
  };

  const handleSubmit = async (orderId: string) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await submitSalesOrder(orderId);
      if (updated) {
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} confirmed & stock reserved!`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this Sales Order? Stock reservations will be released.")) {
      return;
    }
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await cancelSalesOrder(orderId);
      if (updated) {
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} cancelled.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const openPrintModal = (so: SalesOrder) => {
    setPrintDoc({
      documentType: "Sales Order Confirmation",
      documentNumber: so.orderNumber,
      transactionDate: so.transactionDate,
      dueDate: so.deliveryDate,
      customerName: so.customerName,
      customerCode: "CUST-MASTER",
      billingAddress: "100 Tech Enterprise Blvd, Suite 400, New York, NY 10001",
      shippingAddress: "Main Warehouse Distribution Hub",
      currency: so.currency || "INR",
      paymentTerms: "Net 30 Days",
      items: so.items || [],
      netTotal: so.netTotal,
      totalTax: so.totalTaxesAndCharges || (so.grandTotal - so.netTotal),
      grandTotal: so.grandTotal,
      roundedTotal: so.roundedTotal,
      inWords: so.inWords,
      status: so.status,
    });
    setIsPrintOpen(true);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      o.status === statusFilter ||
      (statusFilter === "ACTIVE" &&
        (o.status === "TO_DELIVER_AND_BILL" || o.status === "TO_DELIVER" || o.status === "TO_BILL"));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">
            Sales Order
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              if (orderItems.length === 0 && catalogItems.length > 0) {
                setOrderItems([
                  {
                    itemId: catalogItems[0].id,
                    itemCode: catalogItems[0].itemCode,
                    itemName: catalogItems[0].itemName,
                    qty: 1,
                    rate: catalogItems[0].standardRate,
                  },
                ]);
              }
              setIsCreateOpen(true);
            }}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sales Order</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

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
            placeholder="Search by order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"].map((status) => (
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

      {/* Full-Width ERPNext-style Sales Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading sales orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No sales orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Delivered</th>
                  <th className="py-3 px-4 text-center">Billed</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <Link
                        href={`/sales/orders/${order.orderNumber}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{order.orderNumber}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link href={`/sales/orders/${order.orderNumber}`} className="hover:text-blue-600">
                        {order.customerName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {formatDate(order.transactionDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[11px]">
                        {order.perDelivered || 0}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-[11px]">
                        {order.perBilled || 0}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/sales/orders/${order.orderNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-purple-600 text-slate-700 group-hover:text-white text-xs font-semibold transition-all shadow-2xs"
                      >
                        <span>View</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Sales Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
                <span>Create New Sales Order</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Picker */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>Customer *</span>
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

                {/* Quotation Picker */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Source Quotation (Optional)</span>
                  </label>
                  <select
                    value={selectedQuotation}
                    onChange={(e) => handleQuotationSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="">None / Direct Order</option>
                    {quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.customerName} (₹{Number(q.grandTotal).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Customer PO Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-88990"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Order Item Lines</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No items added. Click &quot;Add Item&quot; above.</div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="col-span-5 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Item</label>
                          <select
                            value={item.itemCode}
                            onChange={(e) => handleItemChange(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs"
                          >
                            {catalogItems.map((ci) => (
                              <option key={ci.id} value={ci.itemCode}>
                                {ci.itemName} ({ci.itemCode})
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
                              const updated = [...orderItems];
                              updated[idx].qty = Number(e.target.value) || 1;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].rate = Number(e.target.value) || 0;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-right font-mono"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5 text-right font-mono font-bold text-slate-800">
                          <label className="text-[10px] text-slate-400 block">Amount</label>
                          <div className="pt-1">₹{(item.qty * item.rate).toLocaleString()}</div>
                        </div>
                        <div className="col-span-1 text-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
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
                      <span>Net Subtotal:</span>
                      <span className="font-mono font-semibold">₹{itemsSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Output GST (18%):</span>
                      <span className="font-mono font-semibold text-blue-600">+₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                      <span>Grand Total:</span>
                      <span className="font-mono text-purple-700">₹{grandTotal.toLocaleString()}</span>
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
                  Create Sales Order
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
    </div>
  );
}

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Sales Orders...</div>}>
      <SalesOrdersContent />
    </Suspense>
  );
}
