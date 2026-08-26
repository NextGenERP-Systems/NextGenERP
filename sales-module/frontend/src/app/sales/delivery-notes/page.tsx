"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Receipt,
  Eye,
  X,
  Package,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getDeliveryNotes, getCustomers, getSalesOrders, createDeliveryNote, makeInvoiceFromDelivery } from "@/lib/api";
import { DeliveryNote, Customer, SalesOrder } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

export default function DeliveryNotesPage() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printDoc, setPrintDoc] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Delivery Note Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [carrier, setCarrier] = useState("FedEx Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [dnData, custData, orderData] = await Promise.all([
        getDeliveryNotes(),
        getCustomers(),
        getSalesOrders(),
      ]);
      setDeliveryNotes(dnData || []);
      setCustomers(custData || []);
      setSalesOrders(orderData || []);
    } catch (err) {
      console.error("Failed to load delivery notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotes = deliveryNotes.filter(
    (dn) =>
      dn.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dn.trackingNumber && dn.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMakeInvoice = async (dnId: string) => {
    try {
      const inv = await makeInvoiceFromDelivery(dnId);
      setActionSuccess(`Sales Invoice ${inv.invoiceNumber} created successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const itemsPayload = [
        {
          itemCode: "ERP-CLOUD-ENT",
          itemName: "NextGen Cloud ERP Enterprise License",
          qty: 1,
          rate: 12000,
          uom: "Nos",
          warehouse: "Stores - Default",
        },
      ];

      await createDeliveryNote({
        customerId: selectedCustomer,
        salesOrderId: selectedOrder || undefined,
        carrier,
        trackingNumber,
        shippingAddress,
        notes,
        items: itemsPayload,
      });

      setIsCreateOpen(false);
      setActionSuccess("Delivery Note created and dispatched successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create delivery note");
    }
  };

  const openPrint = (dn: DeliveryNote) => {
    setPrintDoc({
      title: "Delivery Note / Dispatch Slip",
      docNumber: dn.deliveryNoteNumber,
      docDate: dn.postingDate,
      customerName: dn.customerName,
      billingAddress: dn.shippingAddress,
      currency: "INR",
      items: dn.items || [],
      netTotal: dn.totalAmount,
      grandTotal: dn.totalAmount,
      notes: `Carrier: ${dn.carrier || "N/A"} | Tracking #: ${dn.trackingNumber || "N/A"}`,
      status: dn.status,
    });
    setIsPrintOpen(true);
  };

  const totalDeliveredQty = deliveryNotes.reduce((acc, dn) => acc + (Number(dn.totalQty) || 0), 0);
  const totalValueDelivered = deliveryNotes.reduce((acc, dn) => acc + (Number(dn.totalAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-blue-600" />
            <span>Delivery Notes & Fulfilment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch items, track shipments, and automate Sales Order delivery completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>New Delivery Note</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Shipments</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{deliveryNotes.length}</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Dispatched & Active
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Quantity Shipped</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">{totalDeliveredQty.toLocaleString()} Units</div>
          <div className="text-[11px] text-slate-500">Across all customer orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Shipped Value</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ₹{totalValueDelivered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">Ready for billing & invoicing</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by DN#, Customer, Tracking #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredNotes.length}</span> Delivery Notes
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">DN Number</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Carrier & Tracking</th>
                <th className="py-3 px-4 text-right">Items / Qty</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading delivery notes...
                  </td>
                </tr>
              ) : filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No delivery notes found.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-blue-600 font-mono">{dn.deliveryNoteNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{dn.postingDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{dn.customerName}</td>
                    <td className="py-3 px-4">
                      {dn.carrier ? (
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-700">{dn.carrier}</span>
                          {dn.trackingNumber && (
                            <div className="text-[10px] text-slate-400 font-mono">#{dn.trackingNumber}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Self Dispatch</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {Number(dn.totalQty).toLocaleString()} Nos
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(dn.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPrint(dn)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Print / PDF"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMakeInvoice(dn.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-medium transition-all"
                          title="Create Sales Invoice"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delivery Note Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Create New Delivery Note</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer *</label>
                <select
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sales Order (Optional)</label>
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">None / Direct Dispatch</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.orderNumber} - {so.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Carrier / Logistics</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. FedEx / DHL / BlueDart"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. FX-98472918"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Shipping Address</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Delivery warehouse / destination address..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Dispatch Shipment
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
  );
}
