"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCostCenters, createCostCenter, deleteCostCenter } from "@/lib/api";
import { CostCenter } from "@/types/accounting";

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [costCenterCode, setCostCenterCode] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCostCenters();
      setCostCenters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!costCenterName) return;

    setIsSubmitting(true);
    try {
      await createCostCenter({
        costCenterCode: costCenterCode || "CC-" + (costCenters.length + 101),
        costCenterName,
        isGroup,
      });

      setIsModalOpen(false);
      setCostCenterCode("");
      setCostCenterName("");
      await loadData();
    } catch (err) {
      console.error(err);
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Cost Centers &amp; Department Budgets
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              Budget Tracking
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Departmental cost allocation, expense auditing, and budgetary variance monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cost Center</span>
          </button>
        </div>
      </div>

      {/* Cost Center Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {costCenters.length === 0 ? (
          <div className="col-span-3 liquid-glass-card p-8 text-center text-xs text-slate-400">
            No cost centers added yet. Click &quot;Add Cost Center&quot; to create a departmental allocation!
          </div>
        ) : (
          costCenters.map((cc) => (
            <div key={cc.id} className="liquid-glass-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 font-bold">
                    {cc.costCenterCode}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-2">{cc.costCenterName}</h3>
                  <p className="text-xs text-slate-500">{cc.isGroup ? "Group Parent" : "Direct Operational Center"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-white flex items-center justify-center text-slate-700 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteCostCenter(cc.id);
                      loadData();
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Cost Center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 font-medium">
                <span className="text-slate-500">Allocation Status:</span>
                <span className="font-bold text-slate-900">Active &amp; Audited</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Cost Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Add New Cost Center</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cost Center Code</label>
                <input
                  type="text"
                  placeholder="e.g. CC-SALES or CC-ENG"
                  value={costCenterCode}
                  onChange={(e) => setCostCenterCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cost Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Sales & Marketing Division"
                  value={costCenterName}
                  onChange={(e) => setCostCenterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ccIsGroup"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="ccIsGroup" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Is Group Cost Center (Can contain sub-centers)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
                  {isSubmitting ? "Creating..." : "Save Cost Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
