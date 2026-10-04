"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  X,
  Trash2,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCostCenters, createCostCenter, deleteCostCenter } from "@/lib/api";
import { CostCenter } from "@/types/accounting";

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCostCenters = costCenters.filter(
    (cc) =>
      cc.costCenterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cc.costCenterCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Cost Centers &amp; Department Budgets
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Budget Tracking
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Departmental cost allocation, expense auditing, and budgetary variance monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Cost Center</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">
          Total Cost Centers: {costCenters.length}
        </span>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search cost center name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Cost Center Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredCostCenters.length === 0 ? (
          <div className="col-span-3 bg-white border border-zinc-200 rounded-lg p-8 text-center text-xs text-zinc-400">
            No cost centers found. Click &quot;+ Add Cost Center&quot; to create a departmental allocation!
          </div>
        ) : (
          filteredCostCenters.map((cc) => (
            <div key={cc.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3 hover:border-zinc-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                    {cc.costCenterCode}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 mt-2">{cc.costCenterName}</h3>
                  <p className="text-xs text-zinc-500">{cc.isGroup ? "Group Parent" : "Direct Operational Center"}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteCostCenter(cc.id);
                      loadData();
                    }}
                    className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete Cost Center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 font-medium">
                <span className="text-zinc-500">Allocation Status:</span>
                <span className="font-semibold text-zinc-900">Active &amp; Audited</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Cost Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Add New Cost Center</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Cost Center Code</label>
                <input
                  type="text"
                  placeholder="e.g. CC-SALES or CC-ENG"
                  value={costCenterCode}
                  onChange={(e) => setCostCenterCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Cost Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Sales & Marketing Division"
                  value={costCenterName}
                  onChange={(e) => setCostCenterName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ccIsGroup"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="ccIsGroup" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                  Is Group Cost Center (Can contain child cost centers)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium"
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
