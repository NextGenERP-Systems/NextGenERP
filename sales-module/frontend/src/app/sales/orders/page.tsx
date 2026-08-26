"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getSalesOrders, submitSalesOrder, cancelSalesOrder } from "@/lib/api";
import { SalesOrder } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const data = await getSalesOrders();
        setOrders(data);
        if (data.length > 0) setSelectedOrder(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleSubmit = async (orderId: string) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await submitSalesOrder(orderId);
      if (updated) {
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
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
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Sales Order Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Order lifecycle execution, credit check gating, stock reservation (SRE), and delivery/billing status.
          </p>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 self-stretch sm:self-auto overflow-x-auto">
          {["ALL", "DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
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

      {/* Main Grid: Orders Table on Left, Live Order Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Table (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Grand Total</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50 text-slate-900" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-semibold">{order.orderNumber}</td>
                          <td className="py-3 px-4 truncate max-w-[150px]">{order.customerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{formatDate(order.transactionDate)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(order.grandTotal, order.currency)}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Order Detail Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <Card className="border-slate-200 space-y-5 p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="font-mono text-base font-bold text-slate-900">{selectedOrder.orderNumber}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedOrder.customerName}</div>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Quick Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase">Delivery Target</div>
                  <div className="text-slate-700 font-semibold mt-0.5">{formatDate(selectedOrder.deliveryDate)}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase">Grand Total</div>
                  <div className="text-slate-900 font-bold mt-0.5">{formatCurrency(selectedOrder.grandTotal)}</div>
                </div>
              </div>

              {/* Progress: Delivery & Billing */}
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Truck className="h-3.5 w-3.5 text-sky-400" /> Delivery Progress
                  </span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrder.perDelivered}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${selectedOrder.perDelivered}%` }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Receipt className="h-3.5 w-3.5 text-emerald-400" /> Billing Progress
                  </span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrder.perBilled}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedOrder.perBilled}%` }} />
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Line Items ({selectedOrder.items?.length || 0})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="space-y-0.5 truncate max-w-[200px]">
                        <div className="font-medium text-slate-700 truncate">{item.itemName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.qty} {item.uom} @ {formatCurrency(item.rate)}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Team 100% Split Breakdown */}
              {selectedOrder.salesTeam && selectedOrder.salesTeam.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Sales Team Allocation (100% Split)
                  </div>
                  <div className="space-y-1">
                    {selectedOrder.salesTeam.map((member, idx) => (
                      <div key={idx} className="flex justify-between text-xs p-1.5 rounded bg-slate-50 text-slate-500">
                        <span>{member.salesPersonName} ({member.allocatedPercentage}%)</span>
                        <span className="font-mono text-slate-900">{formatCurrency(member.incentives)} incentive</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Downstream Actions: Delivery, Invoice, Print */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Downstream Documents
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const { makeDeliveryNoteFromOrder } = await import("@/lib/api");
                        const dn = await makeDeliveryNoteFromOrder(selectedOrder.id);
                        alert(`Delivery Note ${dn.deliveryNoteNumber} created successfully!`);
                        window.location.href = "/sales/delivery-notes";
                      } catch (err: any) {
                        alert(err.message || "Failed to create delivery note");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-all"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Create Delivery</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const { makeInvoiceFromOrder } = await import("@/lib/api");
                        const inv = await makeInvoiceFromOrder(selectedOrder.id);
                        alert(`Sales Invoice ${inv.invoiceNumber} created successfully!`);
                        window.location.href = "/sales/invoices";
                      } catch (err: any) {
                        alert(err.message || "Failed to create sales invoice");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Create Invoice</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsPrintOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
                >
                  <span>🖨️ Print / Export PDF</span>
                </button>
              </div>

              {/* Lifecycle Actions */}
              <div className="border-t border-slate-200 pt-4 flex items-center gap-2.5">
                {selectedOrder.status === "DRAFT" && (
                  <button
                    onClick={() => handleSubmit(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit & Reserve Stock</span>
                  </button>
                )}

                {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleCancel(selectedOrder.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs font-medium transition-all"
                    title="Cancel Order"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an order to view real-time lifecycle & fulfillment details.
            </Card>
          )}
        </div>
      </div>

      {/* Print Document Modal */}
      {selectedOrder && (
        <PrintDocumentModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="Sales Order Confirmation"
          docNumber={selectedOrder.orderNumber}
          docDate={selectedOrder.transactionDate}
          customerName={selectedOrder.customerName}
          currency={selectedOrder.currency || "INR"}
          items={selectedOrder.items?.map((it) => ({
            itemCode: it.itemCode,
            itemName: it.itemName,
            qty: it.qty,
            rate: it.rate,
            amount: it.amount,
            uom: it.uom,
          })) || []}
          netTotal={selectedOrder.netTotal}
          totalTax={selectedOrder.totalTaxesAndCharges}
          grandTotal={selectedOrder.grandTotal}
          notes={`Delivery Date: ${selectedOrder.deliveryDate} | Terms: ${selectedOrder.paymentTermsTemplate || "Net 30"}`}
          status={selectedOrder.status}
        />
      )}
    </div>
  );
}

