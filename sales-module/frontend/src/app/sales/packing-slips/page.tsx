"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  X,
  Truck,
  FileText,
  AlertCircle,
  RefreshCw,
  Trash2,
  ShoppingBag,
  Weight,
  ArrowRight,
  Boxes,
  Barcode,
  Send,
  Check,
} from "lucide-react";
import {
  getPackingSlips,
  getDeliveryNotes,
  createPackingSlip,
  shipPackingSlip,
  deletePackingSlip,
} from "@/lib/api";
import { PackingSlip, DeliveryNote, PackingSlipStatus } from "@/types/sales";

function PackingSlipsContent() {
  const [packingSlips, setPackingSlips] = useState<PackingSlip[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Print Modal
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<PackingSlip | null>(null);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDnId, setSelectedDnId] = useState("");
  const [fromPkg, setFromPkg] = useState(1);
  const [toPkg, setToPkg] = useState(1);
  const [pkgType, setPkgType] = useState("Carton");
  const [weightUom, setWeightUom] = useState("Kg");
  const [netWeightInput, setNetWeightInput] = useState("");
  const [grossWeightInput, setGrossWeightInput] = useState("");
  const [letterOfCredit, setLetterOfCredit] = useState("");
  const [shippingMark, setShippingMark] = useState("");
  const [notes, setNotes] = useState("");
  const [itemsToPack, setItemsToPack] = useState<
    { itemCode: string; itemName: string; qty: number; netWeight: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slips, dns] = await Promise.all([
        getPackingSlips(),
        getDeliveryNotes(),
      ]);
      setPackingSlips(slips || []);
      setDeliveryNotes(dns || []);
      if (dns && dns.length > 0 && !selectedDnId) {
        setSelectedDnId(dns[0].id);
        populateItemsFromDn(dns[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateItemsFromDn = (dn: DeliveryNote) => {
    if (!dn.items || dn.items.length === 0) {
      setItemsToPack([]);
      return;
    }
    const mapped = dn.items.map((it) => ({
      itemCode: it.itemCode,
      itemName: it.itemName,
      qty: it.qty,
      netWeight: Math.round(it.qty * 6.125 * 100) / 100, // sample weight
    }));
    setItemsToPack(mapped);
    const sumNet = mapped.reduce((s, i) => s + i.netWeight, 0);
    setNetWeightInput(sumNet.toFixed(3));
    setGrossWeightInput((sumNet * 1.1).toFixed(3));
  };

  const handleDnChange = (dnId: string) => {
    setSelectedDnId(dnId);
    const dn = deliveryNotes.find((d) => d.id === dnId);
    if (dn) {
      populateItemsFromDn(dn);
      setShippingMark(`${dn.customerName.toUpperCase()} / SHIPMENT ${dn.deliveryNoteNumber} / FRAGILE`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDnId) {
      setErrorMessage("Please select a Delivery Note.");
      return;
    }
    if (itemsToPack.length === 0) {
      setErrorMessage("At least one item must be packed.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createPackingSlip({
        deliveryNoteId: selectedDnId,
        fromPackageNo: Number(fromPkg) || 1,
        toPackageNo: Number(toPkg) || 1,
        packageType: pkgType,
        netWeightPkg: parseFloat(netWeightInput) || 0,
        grossWeightPkg: parseFloat(grossWeightInput) || 0,
        weightUom: weightUom,
        letterOfCredit: letterOfCredit.trim() || undefined,
        shippingMark: shippingMark.trim() || undefined,
        notes: notes.trim() || undefined,
        items: itemsToPack.map((it) => ({
          itemCode: it.itemCode,
          itemName: it.itemName,
          qty: it.qty,
          netWeight: it.netWeight,
          weightUom: weightUom,
        })),
      });

      setPackingSlips([created, ...packingSlips]);
      setIsCreateOpen(false);
      setActionSuccess(`Created Packing Slip ${created.packingSlipNumber} for ${created.totalPackages || 1} package(s)!`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create packing slip.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShip = async (id: string, slipNumber: string) => {
    try {
      const updated = await shipPackingSlip(id);
      setPackingSlips(packingSlips.map((p) => (p.id === id ? updated : p)));
      setActionSuccess(`Packing Slip ${slipNumber} marked as SHIPPED!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to mark shipped: " + (err.message || err));
    }
  };

  const handleDelete = async (id: string, slipNumber: string) => {
    if (!confirm(`Are you sure you want to delete Packing Slip ${slipNumber}?`)) return;
    try {
      await deletePackingSlip(id);
      setPackingSlips(packingSlips.filter((p) => p.id !== id));
      setActionSuccess(`Deleted Packing Slip ${slipNumber}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to delete packing slip: " + (err.message || err));
    }
  };

  // KPI aggregates
  const totalPackages = packingSlips.reduce((sum, p) => sum + (p.toPackageNo - p.fromPackageNo + 1), 0);
  const totalGrossWeight = packingSlips.reduce((sum, p) => sum + p.grossWeightPkg, 0);
  const shippedCount = packingSlips.filter((p) => p.status === "SHIPPED").length;

  const filtered = packingSlips.filter((ps) => {
    const matchSearch =
      ps.packingSlipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ps.shippingMark && ps.shippingMark.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ps.items.some((i) => i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) || i.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === "ALL" || ps.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link href="/sales" className="hover:text-blue-600 transition-colors">
              Selling
            </Link>
            <span>/</span>
            <Link href="/sales/delivery-notes" className="hover:text-blue-600 transition-colors">
              Delivery Notes
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Packing Slips</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-600" />
            Packing Slips & Warehouse Shipment Packaging
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage physical package assignments (Case 1 of N), package types, net/gross weights, and printed shipping carton lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh packing slips"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => {
              setIsCreateOpen(true);
              if (deliveryNotes.length > 0) {
                setSelectedDnId(deliveryNotes[0].id);
                populateItemsFromDn(deliveryNotes[0]);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Packing Slip</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Packing Slips</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{packingSlips.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Across active delivery shipments</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Packages / Cartons</span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{totalPackages}</div>
          <div className="text-[11px] text-indigo-700 mt-1">Physical shipping units</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Gross Weight</span>
            <Weight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {totalGrossWeight.toFixed(2)} Kg
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Including packaging & tare</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Dispatched / Shipped</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{shippedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            {packingSlips.length > 0 ? Math.round((shippedCount / packingSlips.length) * 100) : 0}% Fulfillment rate
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search slip, delivery note, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {["ALL", "PACKED", "SHIPPED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Packing Slips Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          Loading packing slips...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-xl space-y-3">
          <Package className="w-8 h-8 mx-auto text-gray-400" />
          <p className="font-semibold text-gray-700">No packing slips found.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700"
          >
            Create First Packing Slip
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Packing Slip #</th>
                  <th className="px-4 py-3">Delivery Note</th>
                  <th className="px-4 py-3">Package Range</th>
                  <th className="px-4 py-3">Package Type</th>
                  <th className="px-4 py-3 text-right">Net / Gross Weight</th>
                  <th className="px-4 py-3">Packed Items</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.map((ps) => {
                  const pkgs = ps.toPackageNo - ps.fromPackageNo + 1;
                  return (
                    <tr key={ps.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">
                        {ps.packingSlipNumber}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <Link
                          href={`/sales/delivery-notes?search=${encodeURIComponent(ps.deliveryNoteNumber)}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold underline inline-flex items-center gap-1"
                        >
                          <span>{ps.deliveryNoteNumber}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200 font-mono">
                          Pkg {ps.fromPackageNo} - {ps.toPackageNo} ({pkgs} {pkgs > 1 ? "boxes" : "box"})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {ps.packageType}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <div className="font-bold text-gray-900">{ps.grossWeightPkg.toFixed(2)} {ps.weightUom} (Gross)</div>
                        <div className="text-[11px] text-gray-500">{ps.netWeightPkg.toFixed(2)} {ps.weightUom} (Net)</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">
                          {ps.items.length} item{ps.items.length > 1 ? "s" : ""}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">
                          {ps.items.map((i) => `${i.qty}x ${i.itemCode}`).join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ps.status === "SHIPPED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Truck className="w-3 h-3" />
                            SHIPPED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3" />
                            PACKED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSlipForPrint(ps)}
                            title="Print warehouse packing slip & shipping label"
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {ps.status !== "SHIPPED" && (
                            <button
                              onClick={() => handleShip(ps.id, ps.packingSlipNumber)}
                              title="Mark as shipped for carrier dispatch"
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Ship</span>
                            </button>
                          )}
                          {ps.status !== "SHIPPED" && (
                            <button
                              onClick={() => handleDelete(ps.id, ps.packingSlipNumber)}
                              title="Delete packing slip"
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Packing Slip */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Create New Packing Slip</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Delivery Note *
                  </label>
                  <select
                    value={selectedDnId}
                    onChange={(e) => handleDnChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {deliveryNotes.map((dn) => (
                      <option key={dn.id} value={dn.id}>
                        {dn.deliveryNoteNumber} - {dn.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Package Type
                  </label>
                  <select
                    value={pkgType}
                    onChange={(e) => setPkgType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Carton">Carton Box</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Wooden Crate">Wooden Crate</option>
                    <option value="Drum">Drum</option>
                    <option value="Envelope">Protective Envelope</option>
                  </select>
                </div>
              </div>

              {/* Package Numbering & Weights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">From Box #</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fromPkg}
                    onChange={(e) => setFromPkg(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">To Box #</label>
                  <input
                    type="number"
                    min={fromPkg}
                    required
                    value={toPkg}
                    onChange={(e) => setToPkg(parseInt(e.target.value) || fromPkg)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Net Weight ({weightUom})</label>
                  <input
                    type="number"
                    step="0.001"
                    value={netWeightInput}
                    onChange={(e) => setNetWeightInput(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Gross Weight ({weightUom})</label>
                  <input
                    type="number"
                    step="0.001"
                    value={grossWeightInput}
                    onChange={(e) => setGrossWeightInput(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shipping Mark / Export Markings
                </label>
                <input
                  type="text"
                  placeholder="e.g. VANGUARD / SAN JOSE / PKG 1-2 / FRAGILE"
                  value={shippingMark}
                  onChange={(e) => setShippingMark(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Items Allocation Table */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Packed Items ({itemsToPack.length})
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 w-24 text-right">Pack Qty</th>
                        <th className="px-3 py-2 w-28 text-right">Net Wt (Kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {itemsToPack.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <div className="font-bold text-gray-900">{it.itemCode}</div>
                            <div className="text-[11px] text-gray-500">{it.itemName}</div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={it.qty}
                              onChange={(e) => {
                                const updated = [...itemsToPack];
                                updated[idx].qty = parseFloat(e.target.value) || 1;
                                setItemsToPack(updated);
                              }}
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.001"
                              value={it.netWeight}
                              onChange={(e) => {
                                const updated = [...itemsToPack];
                                updated[idx].netWeight = parseFloat(e.target.value) || 0;
                                setItemsToPack(updated);
                              }}
                              className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-right font-mono"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Packing Notes & Protective Inserts
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Foam edge guards and desiccants inserted into all cartons."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Packing Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Packing Slip Modal */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Packing Slip Document Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 space-y-6 text-xs text-gray-800 bg-white">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
                <div>
                  <div className="text-xl font-black text-gray-900 tracking-tight">NEXTGEN ERP ENTERPRISE</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">Warehouse Dispatch & Logistics Division</div>
                  <div className="text-gray-500 text-[11px]">Shipping Hub #4, Industrial Corridor, Austin, TX</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-blue-700 font-mono">{selectedSlipForPrint.packingSlipNumber}</div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">Against: {selectedSlipForPrint.deliveryNoteNumber}</div>
                  <div className="mt-2 inline-block px-3 py-1 bg-gray-900 text-white rounded font-mono font-bold text-xs">
                    PACKAGE {selectedSlipForPrint.fromPackageNo} OF {selectedSlipForPrint.toPackageNo}
                  </div>
                </div>
              </div>

              {/* Barcode & Shipping Marks */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Shipping Mark & Consignee</div>
                  <div className="font-bold text-gray-900 mt-1 font-mono text-xs">
                    {selectedSlipForPrint.shippingMark || "STANDARD CARRIER DISPATCH"}
                  </div>
                  {selectedSlipForPrint.letterOfCredit && (
                    <div className="text-[11px] text-gray-600 font-mono mt-0.5">L/C Ref: {selectedSlipForPrint.letterOfCredit}</div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end justify-center">
                  <Barcode className="w-28 h-8 text-gray-800" />
                  <span className="font-mono text-[10px] text-gray-600 mt-0.5 tracking-widest">{selectedSlipForPrint.packingSlipNumber}</span>
                </div>
              </div>

              {/* Weight & Packaging Meta */}
              <div className="grid grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3 text-center">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Package Type</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedSlipForPrint.packageType}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Net Weight</div>
                  <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">
                    {selectedSlipForPrint.netWeightPkg.toFixed(3)} {selectedSlipForPrint.weightUom}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Gross Weight</div>
                  <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                    {selectedSlipForPrint.grossWeightPkg.toFixed(3)} {selectedSlipForPrint.weightUom}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <div className="font-bold text-gray-900 mb-2">Carton Contents Breakdown</div>
                <table className="w-full border border-gray-200 rounded text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Item Code</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Packed Qty</th>
                      <th className="p-2 text-right">Net Wt ({selectedSlipForPrint.weightUom})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedSlipForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-gray-500">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-gray-900">{item.itemCode}</td>
                        <td className="p-2 text-gray-700">{item.itemName}</td>
                        <td className="p-2 text-right font-mono font-bold">{item.qty}</td>
                        <td className="p-2 text-right font-mono">{item.netWeight.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedSlipForPrint.notes && (
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600">
                  <span className="font-bold text-gray-900">Notes: </span>
                  {selectedSlipForPrint.notes}
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200 mt-6 text-xs text-gray-600">
                <div>
                  <div className="h-10 border-b border-gray-300"></div>
                  <div className="mt-1 font-semibold text-gray-900">Warehouse Packer / Sign</div>
                </div>
                <div>
                  <div className="h-10 border-b border-gray-300"></div>
                  <div className="mt-1 font-semibold text-gray-900">Carrier / Freight Dispatcher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PackingSlipsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading Packing Slips...
        </div>
      }
    >
      <PackingSlipsContent />
    </Suspense>
  );
}
