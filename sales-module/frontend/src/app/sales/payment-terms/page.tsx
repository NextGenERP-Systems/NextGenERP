"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Percent,
  Trash2,
  Check,
  Sliders,
} from "lucide-react";
import {
  getPaymentTermsTemplates,
  createPaymentTermsTemplate,
} from "@/lib/api";
import { PaymentTermsTemplate } from "@/types/sales";

interface NewTemplateItemRow {
  paymentTermName: string;
  invoicePortion: string;
  creditDays: string;
  creditMonths: string;
}

function PaymentTermsContent() {
  const [templates, setTemplates] = useState<PaymentTermsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<NewTemplateItemRow[]>([
    { paymentTermName: "Advance Deposit", invoicePortion: "30.00", creditDays: "0", creditMonths: "0" },
    { paymentTermName: "Upon Dispatch & Delivery", invoicePortion: "50.00", creditDays: "15", creditMonths: "0" },
    { paymentTermName: "Final Settlement", invoicePortion: "20.00", creditDays: "45", creditMonths: "0" },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPaymentTermsTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPortion = items.reduce(
    (sum, it) => sum + (parseFloat(it.invoicePortion) || 0),
    0
  );
  const isPortionValid = Math.abs(totalPortion - 100.0) < 0.001;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        paymentTermName: `Milestone ${items.length + 1}`,
        invoicePortion: "0.00",
        creditDays: "30",
        creditMonths: "0",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof NewTemplateItemRow, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      setErrorMessage("Please enter a template name.");
      return;
    }
    if (!isPortionValid) {
      setErrorMessage(`Sum of milestone portions must be exactly 100.00%. Current sum: ${totalPortion.toFixed(2)}%`);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createPaymentTermsTemplate({
        templateName: templateName.trim(),
        description: description.trim(),
        items: items.map((it) => ({
          paymentTermName: it.paymentTermName.trim(),
          invoicePortion: parseFloat(it.invoicePortion) || 0,
          creditDays: parseInt(it.creditDays) || 0,
          creditMonths: parseInt(it.creditMonths) || 0,
        })),
      });

      setTemplates([created, ...templates]);
      setIsCreateOpen(false);
      setTemplateName("");
      setDescription("");
      setActionSuccess(`Successfully created Payment Terms Template "${created.templateName}"!`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create payment terms template.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <span className="text-gray-900 font-semibold">Payment Terms Templates</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            Payment Terms & Milestone Schedules
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure installment milestones (Advance, Delivery, Final Settlement) and automate milestone-based partial invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh templates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
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
            <span>Total Templates</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{templates.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Ready for Quotations & Orders</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {templates.filter((t) => t.isActive).length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Available across Selling forms</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Milestone Schedules</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {templates.filter((t) => (t.items || []).length > 1).length}
          </div>
          <div className="text-[11px] text-indigo-700 mt-1">Multi-stage installment splits</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Single Milestone</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {templates.filter((t) => (t.items || []).length === 1).length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">100% Advance or Net 30 terms</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates or terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> templates
        </div>
      </div>

      {/* Template Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          Loading payment terms templates...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
          <p className="font-semibold text-gray-700">No payment terms templates found.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((tmpl) => {
            const colors = [
              "bg-blue-500",
              "bg-indigo-500",
              "bg-emerald-500",
              "bg-amber-500",
              "bg-purple-500",
            ];

            return (
              <div
                key={tmpl.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{tmpl.templateName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{tmpl.description || "No description provided."}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>

                  {/* Horizontal Stacked Proportion Bar */}
                  <div className="my-4">
                    <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex justify-between">
                      <span>Installment Allocation</span>
                      <span>{tmpl.items?.length || 0} Milestones (100%)</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                      {(tmpl.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${it.invoicePortion}%` }}
                          className={`${colors[idx % colors.length]} transition-all`}
                          title={`${it.paymentTermName}: ${it.invoicePortion}%`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Milestones Breakdown Table */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100/70 text-gray-600 font-semibold text-[11px]">
                        <tr>
                          <th className="px-3 py-2">Milestone / Term</th>
                          <th className="px-3 py-2 text-right">Portion</th>
                          <th className="px-3 py-2 text-right">Credit Window</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {(tmpl.items || []).map((it, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="px-3 py-2 font-medium text-gray-900 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`}
                              />
                              <span>{it.paymentTermName}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-gray-900">
                              {it.invoicePortion.toFixed(1)}%
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-gray-600">
                              {it.creditDays ? `${it.creditDays}d` : ""}{" "}
                              {it.creditMonths ? `${it.creditMonths}m` : ""}
                              {!it.creditDays && !it.creditMonths ? "Immediate" : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Standard ERPNext Template</span>
                  <Link
                    href="/sales/orders"
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Apply on Sales Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Template */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Create Payment Terms Template</h3>
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

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40-40-20 Project Milestone Plan"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain the commercial milestone terms and schedule breakdown..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Installment Milestone Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-900">
                    Payment Schedule Milestones (Must Sum to 100%)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Milestone Term Name</th>
                        <th className="px-3 py-2 w-24">Portion (%)</th>
                        <th className="px-3 py-2 w-20">Credit Days</th>
                        <th className="px-3 py-2 w-20">Credit Mo.</th>
                        <th className="px-3 py-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={it.paymentTermName}
                              onChange={(e) => handleItemChange(idx, "paymentTermName", e.target.value)}
                              placeholder="e.g. Advance Deposit"
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              required
                              value={it.invoicePortion}
                              onChange={(e) => handleItemChange(idx, "invoicePortion", e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={it.creditDays}
                              onChange={(e) => handleItemChange(idx, "creditDays", e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={it.creditMonths}
                              onChange={(e) => handleItemChange(idx, "creditMonths", e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={items.length <= 1}
                              className="text-gray-400 hover:text-red-600 disabled:opacity-30 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Validation Status Indicator */}
                <div className="mt-2 flex items-center justify-between text-xs px-1">
                  <span className="text-gray-500">Total Milestone Allocation:</span>
                  <div className="flex items-center gap-1.5">
                    {isPortionValid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {totalPortion.toFixed(2)}% (Balanced)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-bold font-mono">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        {totalPortion.toFixed(2)}% (Must equal 100.00%)
                      </span>
                    )}
                  </div>
                </div>
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
                  disabled={submitting || !isPortionValid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentTermsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading Payment Terms Templates...
        </div>
      }
    >
      <PaymentTermsContent />
    </Suspense>
  );
}
