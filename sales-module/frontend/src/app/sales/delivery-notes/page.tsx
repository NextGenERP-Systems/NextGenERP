"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Trash2,
  User,
  ShoppingBag,
} from "lucide-react";
import {
  getDeliveryNotes,
  getCustomers,
  getSalesOrders,
  getItems,
  createDeliveryNote,
  makeInvoiceFromDelivery,
} from "@/lib/api";
import { DeliveryNote, Customer, SalesOrder, CatalogItem } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

function DeliveryNotesContent() {
  const searchParams = useSearchParams();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
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
  const [deliveryItems, setDeliveryItems] = useState<
    { itemCode: string; itemName: string; qty: number; rate: number; uom: string; warehouse: string }[]
  >([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dnData, custData, orderData, itemData] = await Promise.all([
        getDeliveryNotes(),
        getCustomers(),
        getSalesOrders(),
        getItems(),
      ]);
      setDeliveryNotes(dnData || []);
      setCustomers(custData || []);
      setSalesOrders(orderData || []);
      setCatalogItems(itemData || []);

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
            setDeliveryItems(
              matchedOrder.items.map((i) => ({
                itemCode: i.itemCode,
                itemName: i.itemName,
                qty: i.qty,
                rate: i.rate,
                uom: "Nos",
                warehouse: "Stores - Default",
              }))
            );
          }
        }
      }
      if (qOpen === "true" || qCustId || qOrderId) {
        setIsCreateOpen(true);
      }
    } catch (err) {
      console.error("Failed to load delivery notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // When user selects a Sales Order in the modal -> Auto-fill customer and item lines
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    if (!orderId) return;

    const order = salesOrders.find((so) => so.id === orderId);
    if (order) {
      setSelectedCustomer(order.customerId);
      if (order.items && order.items.length > 0) {
        setDeliveryItems(
          order.items.map((i) => ({
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty,
            rate: i.rate,
            uom: "Nos",
            warehouse: "Stores - Default",
          }))
        );
      }
    }
  };

  const handleAddItemRow = () => {
    if (catalogItems.length === 0) return;
    const defaultItem = catalogItems[0];
    setDeliveryItems([
      ...deliveryItems,
      {
        itemCode: defaultItem.itemCode,
        itemName: defaultItem.itemName,
        qty: 1,
        rate: defaultItem.standardRate,
        uom: defaultItem.stockUom || "Nos",
        warehouse: "Stores - Default",
      },
    ]);
  };

  const handleItemChange = (idx: number, itemCode: string) => {
    const itm = catalogItems.find((i) => i.itemCode === itemCode);
    if (!itm) return;
    const updated = [...deliveryItems];
    updated[idx] = {
      ...updated[idx],
      itemCode: itm.itemCode,
      itemName: itm.itemName,
      rate: itm.standardRate,
      uom: itm.stockUom || "Nos",
    };
    setDeliveryItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== idx));
  };

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
    if (!selectedCustomer) {
      alert("Please select a Customer for this Delivery Note.");
      return;
    }

    const payloadItems =
      deliveryItems.length > 0
        ? deliveryItems.map((i) => ({
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty,
            rate: i.rate,
            uom: i.uom || "Nos",
            warehouse: i.warehouse || "Stores - Default",
          }))
        : [
            {
              itemCode: "ERP-CLOUD-ENT",
              itemName: "NextGen Cloud ERP Enterprise License",
              qty: 1,
              rate: 12000,
              uom: "Nos",
              warehouse: "Stores - Default",
            },
          ];

    try {
      await createDeliveryNote({
        customerId: selectedCustomer,
        salesOrderId: selectedOrder || undefined,
        carrier,
        trackingNumber: trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingAddress: shippingAddress || "Customer Site, Bay 3",
        notes,
        items: payloadItems,
      });

      setIsCreateOpen(false);
      setActionSuccess("Delivery Note dispatched and inventory decremented successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to create delivery note: " + (err.message || err));
    }
  };

  const openPrintModal = (dn: DeliveryNote) => {
    setPrintDoc({
      documentType: "Delivery Note / Dispatch Packing Slip",
      documentNumber: dn.deliveryNoteNumber,
      transactionDate: dn.postingDate,
      dueDate: dn.postingDate,
      customerName: dn.customerName,
      customerCode: "CUST-MASTER",
      billingAddress: "100 Tech Enterprise Blvd, Suite 400, New York, NY 10001",
      shippingAddress: dn.shippingAddress || "Main Distribution Hub, Dock 4",
      currency: "INR",
      paymentTerms: "Goods Received Confirmed",
      items: dn.items || [],
      netTotal: dn.totalQty * 12000,
      totalTax: 0,
      grandTotal: dn.totalQty * 12000,
      roundedTotal: dn.totalQty * 12000,
      inWords: "Goods Dispatched for Fulfillment",
      status: dn.status,
    });
    setIsPrintOpen(true);
  };

  const filteredNotes = deliveryNotes.filter(
    (dn) =>
      dn.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dn.trackingNumber && dn.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-blue-600" />
            <span>Delivery Notes & Fulfillment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Goods Dispatch notes, packaging lists, warehouse stock issue, and delivery tracking.
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
              if (deliveryItems.length === 0 && catalogItems.length > 0) {
                setDeliveryItems([
                  {
                    itemCode: catalogItems[0].itemCode,
                    itemName: catalogItems[0].itemName,
                    qty: 1,
                    rate: catalogItems[0].standardRate,
                    uom: catalogItems[0].stockUom || "Nos",
                    warehouse: "Stores - Default",
                  },
                ]);
              }
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Delivery Note</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
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
              placeholder="Search by Note #, Customer, Tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                <th className="py-3 px-4">Delivery Note #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Carrier & Tracking</th>
                <th className="py-3 px-4 text-center">Delivered Qty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading delivery notes...</td>
                </tr>
              ) : filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No delivery notes found.</td>
                </tr>
              ) : (
                filteredNotes.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-blue-600 font-mono">{dn.deliveryNoteNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{dn.customerName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{dn.postingDate}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{dn.carrier || "Standard Courier"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dn.trackingNumber || "N/A"}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">{dn.totalQty} Units</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          dn.status === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : dn.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {dn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPrintModal(dn)}
                          title="Print Packing Slip"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-200 transition-all"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {dn.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleMakeInvoice(dn.id)}
                            className="px-2 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded transition-all flex items-center gap-1"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Invoice</span>
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

      {/* Create Delivery Note Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Create Delivery Note / Dispatch Slip</span>
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
                    <option value="">None / Direct Dispatch</option>
                    {salesOrders.map((so) => (
                      <option key={so.id} value={so.id}>
                        {so.orderNumber} - {so.customerName} (₹{Number(so.grandTotal).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Courier / Transporter</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tracking / Airway Bill #</label>
                  <input
                    type="text"
                    placeholder="TRK-99001"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Dispatched Products</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {deliveryItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No items added. Click &quot;Add Item&quot; above.</div>
                ) : (
                  <div className="space-y-2">
                    {deliveryItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="col-span-6 space-y-0.5">
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
                              const updated = [...deliveryItems];
                              updated[idx].qty = Number(e.target.value) || 1;
                              setDeliveryItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                          />
                        </div>
                        <div className="col-span-3 space-y-0.5">
                          <label className="text-[10px] text-slate-400">Warehouse</label>
                          <input
                            type="text"
                            value={item.warehouse}
                            onChange={(e) => {
                              const updated = [...deliveryItems];
                              updated[idx].warehouse = e.target.value;
                              setDeliveryItems(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs"
                          />
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
                  Save Delivery Note
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

export default function DeliveryNotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Delivery Notes...</div>}>
      <DeliveryNotesContent />
    </Suspense>
  );
}
