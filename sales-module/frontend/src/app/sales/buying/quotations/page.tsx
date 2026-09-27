"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  Trophy,
  Scale,
  Calendar,
  Building2,
  Clock,
  Star,
  ArrowRight,
  ShoppingCart,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getSupplierQuotations,
  createSupplierQuotation,
  compareSupplierQuotations,
  awardQuotationToPO,
  SupplierQuotation,
  QuotationComparison,
} from "@/lib/api";

export default function SupplierQuotationsPage() {
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [comparison, setComparison] = useState<QuotationComparison | null>(null);
  const [activeTab, setActiveTab] = useState<"comparison" | "list">("comparison");
  const [loading, setLoading] = useState(true);

  // New Quote Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [materialRequestNumber, setMaterialRequestNumber] = useState("MAT-REQ-2026-001");
  const [itemCode, setItemCode] = useState("ITM-IOT-001");
  const [itemName, setItemName] = useState("ARM Cortex-M4 Microcontroller IC");
  const [qty, setQty] = useState("100");
  const [rate, setRate] = useState("4300");
  const [leadTimeDays, setLeadTimeDays] = useState("5");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [termsAndConditions, setTermsAndConditions] = useState("Doorstep delivery with manufacturer warranty");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAwarding, setIsAwarding] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [quotes, comp] = await Promise.all([
        getSupplierQuotations(),
        compareSupplierQuotations(),
      ]);
      setQuotations(quotes);
      setComparison(comp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAward(quotationId: string, supplier: string) {
    setIsAwarding(quotationId);
    try {
      const po = await awardQuotationToPO(quotationId);
      setSuccessBanner(
        `Quotation awarded to ${supplier}! Purchase Order ${po.poNumber} generated successfully.`
      );
      setTimeout(() => setSuccessBanner(null), 6000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to award quotation.");
    } finally {
      setIsAwarding(null);
    }
  }

  async function handleCreateQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierName) {
      alert("Please provide Supplier Name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedQty = parseFloat(qty) || 1;
      const parsedRate = parseFloat(rate) || 0;

      await createSupplierQuotation({
        supplierName,
        materialRequestNumber,
        leadTimeDays: parseInt(leadTimeDays) || 7,
        paymentTerms,
        termsAndConditions,
        items: [
          {
            itemCode,
            itemName,
            qty: parsedQty,
            rate: parsedRate,
            amount: parsedQty * parsedRate,
            uom: "Nos",
          },
        ],
      });

      setIsModalOpen(false);
      setSupplierName("");
      setSuccessBanner("Supplier Quotation logged and added to comparative matrix!");
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create Supplier Quotation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Supplier Quotations &amp; Comparison
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Procurement Parity
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Side-by-side vendor quotation evaluation matrix, automated scoring, and 1-click PO awarding
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="liquid-btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier Quote</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "comparison"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Comparative Evaluation Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "list"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>All Quotations ({quotations.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPARATIVE EVALUATION MATRIX */}
      {activeTab === "comparison" && comparison && (
        <div className="space-y-6">
          {/* AI Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Recommended Supplier
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {comparison.recommendedSupplier}
                  </h3>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {comparison.recommendationReason}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {comparison.supplierQuotes.find(
                (q) => q.supplierName === comparison.recommendedSupplier
              )?.isAwarded ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Awarded to PO</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    const q = comparison.supplierQuotes.find(
                      (sq) => sq.supplierName === comparison.recommendedSupplier
                    );
                    if (q) handleAward(q.quotationId, q.supplierName);
                  }}
                  disabled={isAwarding !== null}
                  className="liquid-btn-primary text-xs flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>
                    {isAwarding ? "Awarding..." : "Award PO to Recommended Supplier"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparison.supplierQuotes.map((quote) => {
              const isRecommended = quote.supplierName === comparison.recommendedSupplier;
              return (
                <div
                  key={quote.quotationId}
                  className={`liquid-glass-card p-6 space-y-4 relative transition-all ${
                    isRecommended
                      ? "ring-2 ring-amber-400 bg-amber-50/20"
                      : "hover:border-slate-300"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                      Best Value
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {quote.supplierName}
                      </h3>
                      <p className="text-xs font-mono font-bold text-slate-500">
                        {quote.quotationNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{quote.qualityRating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Total Quoted (incl. GST):</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(quote.grandTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Delivery Lead Time:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {quote.leadTimeDays} Days
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Payment Terms:</span>
                      <span className="font-bold text-slate-800">{quote.paymentTerms}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    {quote.isAwarded ? (
                      <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Awarded &amp; Contracted</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAward(quote.quotationId, quote.supplierName)}
                        disabled={isAwarding !== null}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isRecommended
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                            : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>
                          {isAwarding === quote.quotationId ? "Awarding..." : "Award Purchase Order"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Item-by-Item Breakdown Table */}
          <div className="liquid-glass-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Item-Level Unit Price Comparison
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item Code &amp; Description</th>
                    <th className="py-3 px-4 text-center">Req. Qty</th>
                    {comparison.supplierQuotes.map((sq) => (
                      <th key={sq.supplierName} className="py-3 px-4 text-right">
                        {sq.supplierName} (₹)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {comparison.itemRows.map((row) => (
                    <tr key={row.itemCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.itemName}</div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {row.itemCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {row.requiredQty} Nos
                      </td>
                      {row.quotesBySupplier.map((quote) => (
                        <td
                          key={quote.supplierName}
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            quote.isLowestPrice
                              ? "text-emerald-700 bg-emerald-50/50"
                              : "text-slate-800"
                          }`}
                        >
                          <div>{formatCurrency(quote.rate)} / unit</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Total: {formatCurrency(quote.amount)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL QUOTATIONS LIST */}
      {activeTab === "list" && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Material Request</th>
                <th className="py-3 px-4">Quote Date</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {q.quotationNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {q.supplierName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {q.materialRequestNumber || "—"}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {q.transactionDate}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {q.leadTimeDays || 7} Days
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(q.grandTotal)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.status === "ACCEPTED" || q.status === "ORDERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {q.status !== "ORDERED" && q.status !== "ACCEPTED" ? (
                      <button
                        onClick={() => handleAward(q.id, q.supplierName)}
                        disabled={isAwarding !== null}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Award PO</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Awarded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Supplier Quotation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Log Supplier Quotation
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Vendor *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Acme Components"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Material Request Ref</label>
                  <input
                    type="text"
                    value={materialRequestNumber}
                    onChange={(e) => setMaterialRequestNumber(e.target.value)}
                    placeholder="e.g. MAT-REQ-2026-001"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Description</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quoted Qty</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 30 Days"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Terms &amp; Warranty Conditions</label>
                <textarea
                  rows={2}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="liquid-btn-glass text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-btn-primary text-xs"
                >
                  {isSubmitting ? "Saving..." : "Add to Matrix"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
