"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  ChevronLeft,
  Printer,
  Heart,
  User,
  Plus,
  Paperclip,
  Tag,
  Share2,
  CheckCircle2,
  XCircle,
  Truck,
  Receipt,
  FileText,
  Layers,
  Users,
  ChevronDown,
  MoreHorizontal,
  Download,
  Edit2,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getSalesOrders,
  submitSalesOrder,
  cancelSalesOrder,
} from "@/lib/api";
import { SalesOrder } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = params.id as string;

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Tabs state matching ERPNext: Details, Address & Contact, Terms, More Info, Connections
  const [activeTab, setActiveTab] = useState<
    "details" | "address" | "terms" | "info" | "connections"
  >("details");

  // Create Dropdown Open
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orders = await getSalesOrders();
      setAllOrders(orders || []);
      const matched = (orders || []).find(
        (o) =>
          o.id === orderIdParam ||
          o.orderNumber.toLowerCase() === orderIdParam.toLowerCase()
      );
      if (matched) {
        setOrder(matched);
      } else if (orders && orders.length > 0) {
        setOrder(orders[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) loadOrder();
  }, [orderIdParam]);

  const handleSubmit = async () => {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await submitSalesOrder(order.id);
      if (updated) {
        setOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} submitted & stock reserved!`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this Sales Order?")) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await cancelSalesOrder(order.id);
      if (updated) {
        setOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} cancelled.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  // Next/Prev Order Navigation
  const currentIndex = allOrders.findIndex((o) => o.id === order?.id);
  const handlePrevOrder = () => {
    if (currentIndex > 0) {
      router.push(`/sales/orders/${allOrders[currentIndex - 1].orderNumber}`);
    }
  };
  const handleNextOrder = () => {
    if (currentIndex >= 0 && currentIndex < allOrders.length - 1) {
      router.push(`/sales/orders/${allOrders[currentIndex + 1].orderNumber}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-sans">
        Loading Sales Order document...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 space-y-3 font-sans">
        <div>Sales Order document not found.</div>
        <Link href="/sales/orders" className="text-blue-600 underline font-semibold">
          ← Back to Sales Orders
        </Link>
      </div>
    );
  }

  const items = order.items && order.items.length > 0 ? order.items : [
    { itemCode: "ACD-1000", itemName: "AC-Drive Motor C", qty: 2, rate: 120000, amount: 240000 }
  ];

  const totalQty = items.reduce((acc, i) => acc + (i.qty || 1), 0);
  const itemsNetTotal = items.reduce((acc, i) => acc + (i.amount || i.qty * i.rate), 0);

  // Status Pill Styling matching ERPNext exact colors
  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED" || status === "TO_DELIVER_AND_BILL") {
      return (
        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          Completed
        </span>
      );
    }
    if (status === "DRAFT") {
      return (
        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          Draft
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
        Submitted
      </span>
    );
  };

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
        {/* Left Breadcrumb Trail: 🏠 / Selling / Sales Order / [Customer Name] [Status] */}
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales/orders" className="text-gray-600 hover:text-gray-900 font-normal">
            Sales Order
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900 truncate max-w-[260px]">
            {order.customerName}
          </span>
          <div className="ml-1">
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Right Action Buttons Toolbar matching ERPNext */}
        <div className="flex items-center gap-2">
          {/* Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="px-3 py-1.5 rounded bg-gray-900 text-white font-medium text-xs flex items-center gap-1.5 hover:bg-gray-800 transition-colors shadow-2xs"
            >
              <span>Create</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
            </button>
            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-xs">
                <Link
                  href={`/sales/delivery-notes?salesOrderId=${order.id}&customerId=${order.customerId}&open=true`}
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Note</span>
                </Link>
                <Link
                  href={`/sales/invoices?salesOrderId=${order.id}&customerId=${order.customerId}&open=true`}
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sales Invoice</span>
                </Link>
                <Link
                  href="/sales/pos"
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Material Request</span>
                </Link>
              </div>
            )}
          </div>

          {/* Prev / Next Arrows */}
          <button
            onClick={handlePrevOrder}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextOrder}
            disabled={currentIndex >= allOrders.length - 1}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* More Options */}
          <button
            onClick={() => setIsPrintOpen(true)}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Cancel or Submit */}
          {order.status === "DRAFT" ? (
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="mx-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Body & Right Sidebar Grid (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
        {/* Left Form Content (9 cols) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Form Tabs Bar: Details | Address & Contact | Terms | More Info | Connections */}
          <div className="flex items-center gap-6 border-b border-gray-200 text-[13px] font-medium pt-1">
            {[
              { id: "details", label: "Details" },
              { id: "address", label: "Address & Contact" },
              { id: "terms", label: "Terms" },
              { id: "info", label: "More Info" },
              { id: "connections", label: "Connections" },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`pb-2.5 transition-colors border-b-2 -mb-px ${
                    isActive
                      ? "border-gray-900 text-gray-900 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Form Fields Two-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Customer *</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-medium text-gray-900">
                      {order.customerName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Date *</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono text-gray-800">
                      {formatDate(order.transactionDate)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Order Type *</label>
                      <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded text-gray-900 font-medium">
                        {order.orderType || "Sales"}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer pt-4">
                      <input type="checkbox" readOnly className="rounded border-gray-300" />
                      <span>Is Subcontracted</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Delivery Date</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono text-gray-800">
                      {formatDate(order.deliveryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency and Price List Section */}
              <div className="pt-2 border-t border-gray-200">
                <button type="button" className="text-xs font-semibold text-gray-800 flex items-center gap-1 hover:text-gray-900">
                  <span>Currency and Price List</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="font-semibold text-gray-800 text-xs">Items</div>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-10">No.</th>
                        <th className="py-2 px-3">Item Code *</th>
                        <th className="py-2 px-3">Delivery Date *</th>
                        <th className="py-2 px-3 text-center">Quantity</th>
                        <th className="py-2 px-3 text-right">Rate (INR)</th>
                        <th className="py-2 px-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((i, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
                            {i.itemCode}: {i.itemName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(order.deliveryDate)}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-800">{i.qty || 1}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹ {Number(i.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">₹ {Number(i.amount || (i.qty * i.rate)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Totals Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs mb-1">Total Quantity</label>
                  <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono font-semibold text-gray-800">
                    {totalQty}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs mb-1">Total (INR)</label>
                  <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono font-bold text-gray-900">
                    ₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Sales Taxes and Charges Section */}
              <div className="space-y-3 pt-2">
                <div className="font-semibold text-gray-800 text-xs">Sales Taxes and Charges</div>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px] font-sans">
                      <tr>
                        <th className="py-2 px-3 w-10">No.</th>
                        <th className="py-2 px-3">Type *</th>
                        <th className="py-2 px-3">Account Head *</th>
                        <th className="py-2 px-3 text-right">Tax Rate</th>
                        <th className="py-2 px-3 text-right">Net Amount (INR)</th>
                        <th className="py-2 px-3 text-right">Amount (INR)</th>
                        <th className="py-2 px-3 text-right">Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2.5 px-3 text-gray-400">1</td>
                        <td className="py-2.5 px-3 font-sans text-gray-700">On Net Total</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 font-sans">Output Tax CGST (9%)</td>
                        <td className="py-2.5 px-3 text-right">9</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal * 0.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">₹ {Number(itemsNetTotal * 1.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-gray-400">2</td>
                        <td className="py-2.5 px-3 font-sans text-gray-700">On Net Total</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 font-sans">Output Tax SGST (9%)</td>
                        <td className="py-2.5 px-3 text-right">9</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal * 0.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">₹ {Number(itemsNetTotal * 1.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Grand Total Banner */}
              <div className="p-4 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-700">Grand Total (INR)</span>
                <span className="font-mono text-base text-gray-900">
                  ₹ {Number(order.grandTotal || (itemsNetTotal * 1.18)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS & CONTACT */}
          {activeTab === "address" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2">
                <div className="font-bold text-gray-900 text-xs">Billing Address</div>
                <div className="text-gray-800 font-medium">{order.customerName}</div>
                <div className="text-gray-600 font-mono">100 Tech Enterprise Blvd, Suite 400</div>
                <div className="text-gray-600 font-mono">New York, NY 10001, United States</div>
                <div className="text-gray-500 pt-2 border-t border-gray-200">Email: billing@enterprise.com</div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2">
                <div className="font-bold text-gray-900 text-xs">Shipping Address</div>
                <div className="text-gray-800 font-medium">Main Warehouse Distribution Hub</div>
                <div className="text-gray-600 font-mono">500 Logistics Parkway, Gate 4</div>
                <div className="text-gray-600 font-mono">Jersey City, NJ 07302, United States</div>
                <div className="text-gray-500 pt-2 border-t border-gray-200">Phone: +1 (555) 019-2834</div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS */}
          {activeTab === "terms" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2 text-xs">
              <div className="font-bold text-gray-900">Terms and Conditions</div>
              <div className="font-mono text-gray-700 space-y-1">
                <p>1. Payment terms: 30 days net from invoice issuance.</p>
                <p>2. Goods remain company property until paid in full.</p>
                <p>3. Delivery SLA: 5-7 business days from order confirmation.</p>
              </div>
            </div>
          )}

          {/* TAB 4: MORE INFO */}
          {activeTab === "info" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2 text-xs font-mono">
              <div className="font-bold text-gray-900 font-sans">Sales Team & Analytics</div>
              <div className="flex justify-between text-gray-600">
                <span>Primary Sales Person:</span>
                <span className="font-bold text-gray-900">John Doe (100%)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Commission Rate:</span>
                <span className="font-bold text-emerald-600">5.0%</span>
              </div>
            </div>
          )}

          {/* TAB 5: CONNECTIONS */}
          {activeTab === "connections" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: "Sales Invoice", count: order.perBilled > 0 ? 1 : 0, href: `/sales/invoices?salesOrderId=${order.id}` },
                { label: "Delivery Note", count: order.perDelivered > 0 ? 1 : 0, href: `/sales/delivery-notes?salesOrderId=${order.id}` },
                { label: "Stock Reservation Entry", count: order.status !== "DRAFT" ? 1 : 0, href: "#" },
                { label: "Payment Entry", count: 0, href: "/sales/payments" },
                { label: "Material Request", count: 0, href: "#" },
                { label: "Quotation", count: order.quotationId ? 1 : 0, href: `/sales/quotations` },
              ].map((conn, idx) => (
                <Link
                  key={idx}
                  href={conn.href}
                  className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  <span className="font-medium text-gray-700 text-[11px] truncate">{conn.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    conn.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {conn.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right ERPNext Sidebar Panel (3 cols matching exact screenshot) */}
        <div className="lg:col-span-3 space-y-4 border-l border-gray-200 pl-4">
          {/* Header Title with Print & Heart Icons */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="font-bold text-gray-900 text-sm truncate max-w-[170px]" title={order.customerName}>
              {order.customerName}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <button onClick={() => setIsPrintOpen(true)} className="p-1 rounded hover:bg-gray-100 hover:text-gray-700">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100 hover:text-red-500">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-mono text-xs font-semibold text-gray-600">
            {order.orderNumber}
          </div>

          {/* Sidebar Action Buttons */}
          <div className="space-y-1.5 text-xs">
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-gray-400" />
                <span>Assign</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                <span>Attachments</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>Tags</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Share</span>
              </span>
            </button>
          </div>

          {/* Edit / Audit Trail Section */}
          <div className="pt-3 border-t border-gray-200 space-y-2 text-[11px] text-gray-500">
            <div>
              <div className="font-medium text-gray-700">Last Edited By You</div>
              <div className="text-gray-400">57 minutes ago</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Created By You</div>
              <div className="text-gray-400">57 minutes ago</div>
            </div>
          </div>
        </div>
      </div>

      {isPrintOpen && (
        <PrintDocumentModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="Sales Order Confirmation"
          docNumber={order.orderNumber}
          docDate={formatDate(order.transactionDate)}
          customerName={order.customerName}
          billingAddress="100 Tech Enterprise Blvd, Suite 400, New York, NY 10001"
          currency={order.currency || "INR"}
          items={items.map((i) => ({
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty || 1,
            rate: i.rate,
            amount: i.amount || (i.qty * i.rate),
          }))}
          netTotal={itemsNetTotal}
          totalTax={itemsNetTotal * 0.18}
          grandTotal={order.grandTotal || itemsNetTotal * 1.18}
          status={order.status}
        />
      )}
    </div>
  );
}
