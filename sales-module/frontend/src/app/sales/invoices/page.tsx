"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Ban,
  ShoppingBag,
  Trash2,
  Calculator,
  User,
  Home,
} from "lucide-react";
import Link from "next/link";
import {
  getSalesInvoices,
  getCustomers,
  getSalesOrders,
  getItems,
  createSalesInvoice,
  recordPayment,
  cancelSalesInvoice,
} from "@/lib/api";
import { SalesInvoice, Customer, SalesOrder, CatalogItem } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

function SalesInvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
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
  const [invoiceItems, setInvoiceItems] = useState<
    { itemId: string; itemCode: string; itemName: string; qty: number; rate: number }[]
  >([]);

  // Record Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK_TRANSFER");
  const [referenceNo, setReferenceNo] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, custData, orderData, itemData] = await Promise.all([
        getSalesInvoices(),
        getCustomers(),
        getSalesOrders(),
        getItems(),
      ]);
      setInvoices(invData || []);
      setCustomers(custData || []);
      setSalesOrders(orderData || []);
      setCatalogItems(itemData || []);

      // Check URL parameters for connections
      const qCustId = searchParams.get("customerId");
      const qOrderId = searchParams.get("salesOrderId");
      const qOpen = searchParams.get("open");

      if (qCustId) {
        setSelectedCustomer(qCustId);
      }
      if (qOrderId) {
        setSelectedOrder(qOrderId);
        const matchedOrder = (orderData || []).find((o) => o.id === qOrderId);
        if (matchedOrder) {
          setSelectedCustomer(matchedOrder.customerId);
          if (matchedOrder.items && matchedOrder.items.length > 0) {
            setInvoiceItems(
              matchedOrder.items.map((i) => ({
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
      if (qOpen === "true" || qCustId || qOrderId) {
        setIsCreateOpen(true);
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // Handle Sales Order Selection in Create Modal -> Auto-fill Customer and Items
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    if (!orderId) return;

    const order = salesOrders.find((so) => so.id === orderId);
    if (order) {
      setSelectedCustomer(order.customerId);
      if (order.items && order.items.length > 0) {
        setInvoiceItems(
          order.items.map((i) => ({
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
    setInvoiceItems([
      ...invoiceItems,
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
    const updated = [...invoiceItems];
    updated[idx] = {
      ...updated[idx],
      itemId: itm.id,
      itemCode: itm.itemCode,
      itemName: itm.itemName,
      rate: itm.standardRate,
    };
    setInvoiceItems(updated);
  };

  const handleItemQtyChange = (idx: number, qty: number) => {
    const updated = [...invoiceItems];
    updated[idx] = { ...updated[idx], qty: Math.max(1, qty) };
    setInvoiceItems(updated);
  };

  const handleItemRateChange = (idx: number, rate: number) => {
    const updated = [...invoiceItems];
    updated[idx] = { ...updated[idx], rate: Math.max(0, rate) };
    setInvoiceItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const itemsSubtotal = invoiceItems.reduce((acc, row) => acc + row.qty * row.rate, 0);
  const taxAmount = itemsSubtotal * 0.18; // Standard 18% Output GST
  const grandTotal = itemsSubtotal + taxAmount;

  const handleCancelInvoice = async (id: string, invoiceNum: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel Sales Invoice ${invoiceNum}? This will post contra reversal GL entries and adjust customer outstanding balance.`
      )
    ) {
      return;
    }
    try {
      await cancelSalesInvoice(id);
      setActionSuccess(`Sales Invoice ${invoiceNum} cancelled and GL reversal entries posted successfully!`);
      loadData();
    } catch (err: any) {
      alert("Failed to cancel invoice: " + (err.message || err));
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a Customer for this invoice.");
      return;
    }

    const payloadItems =
      invoiceItems.length > 0
        ? invoiceItems.map((i) => ({
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty,
            rate: i.rate,
            incomeAccount: "4110 - Sales Revenue",
          }))
        : [
            {
              itemCode: "ERP-CLOUD-ENT",
              itemName: "NextGen Cloud ERP Enterprise License",
              qty: 1,
              rate: 12000,
              incomeAccount: "4110 - Sales Revenue",
            },
          ];

    try {
      await createSalesInvoice({
        customerId: selectedCustomer,
        salesOrderId: selectedOrder || undefined,
        paymentTerms,
        notes,
        items: payloadItems,
      });

      setIsCreateOpen(false);
      setActionSuccess("Sales Invoice generated successfully with General Ledger postings!");
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
      setActionSuccess(
        `Payment of ₹${Number(paymentAmount).toLocaleString()} recorded against ${paymentInvoice.invoiceNumber}!`
      );
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    }
  };

  const openPaymentModal = (inv: SalesInvoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(inv.outstandingAmount.toString());
    setReferenceNo(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsPaymentOpen(true);
  };

  const openPrintModal = (inv: SalesInvoice) => {
    setPrintDoc({
      documentType: "Sales Invoice",
      documentNumber: inv.invoiceNumber,
      transactionDate: inv.postingDate || new Date().toISOString().split("T")[0],
      dueDate: inv.dueDate,
      customerName: inv.customerName,
      customerCode: "CUST-MASTER",
      billingAddress: "100 Tech Enterprise Blvd, Suite 400, New York, NY 10001",
      shippingAddress: "Main Distribution Warehouse, Dock 4",
      currency: "INR",
      paymentTerms: inv.paymentTerms || "Net 30 Days",
      items: inv.items || [
        {
          itemCode: "ERP-CLOUD-ENT",
          itemName: "NextGen Cloud ERP Enterprise License",
          qty: 1,
          rate: inv.grandTotal,
          amount: inv.grandTotal,
          uom: "Nos",
        },
      ],
      netTotal: inv.netTotal || inv.grandTotal * 0.847,
      totalTax: inv.totalTax || inv.grandTotal * 0.153,
      grandTotal: inv.grandTotal,
      roundedTotal: inv.roundedTotal || Math.round(inv.grandTotal),
      inWords: inv.inWords || `INR ${Math.round(inv.grandTotal).toLocaleString()} Only`,
      outstandingAmount: inv.outstandingAmount,
      paidAmount: inv.paidAmount,
      status: inv.status,
    });
    setIsPrintOpen(true);
  };

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
            Sales Invoice
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              if (invoiceItems.length === 0 && catalogItems.length > 0) {
                setInvoiceItems([
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
            <span>Add Sales Invoice</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
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
              placeholder="Search by Invoice #, Customer, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> Invoices
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Outstanding Due</th>
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
                    <td className="py-3 px-4 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{inv.postingDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(inv.grandTotal).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                      ₹{Number(inv.paidAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      ₹{Number(inv.outstandingAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : inv.status === "PARTLY_PAID"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : inv.status === "UNPAID"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : inv.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPrintModal(inv)}
                          title="Print / View Invoice PDF"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-200 transition-all"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded transition-all flex items-center gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Pay</span>
                          </button>
                        )}
                        {inv.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelInvoice(inv.id, inv.invoiceNumber)}
                            title="Cancel Invoice & Post Reversal GL Entries"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-all"
                          >
                            <Ban className="h-3.5 w-3.5" />
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

      {/* Create Sales Invoice Modal with Full Connects */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                <span>Create New Sales Invoice</span>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="">Select Customer Master...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sales Order Picker */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                    <span>Source Sales Order (Optional)</span>
                  </label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="">None / Direct Invoice</option>
                    {salesOrders.map((so) => (
                      <option key={so.id} value={so.id}>
                        {so.orderNumber} - {so.customerName} (₹{Number(so.grandTotal).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Invoice Item Lines</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                {invoiceItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No items added yet. Click &quot;Add Item Line&quot; above.</div>
                ) : (
                  <div className="space-y-2">
                    {invoiceItems.map((item, idx) => (
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
                            onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemRateChange(idx, Number(e.target.value))}
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

                {/* Calculation summary */}
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
                      <span className="font-mono text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment bank instructions or tax memo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
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
    </div>
  );
}

export default function SalesInvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Sales Invoices...</div>}>
      <SalesInvoicesContent />
    </Suspense>
  );
}
