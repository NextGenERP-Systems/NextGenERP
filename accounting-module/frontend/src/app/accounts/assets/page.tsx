"use client";

import React, { useState, useEffect } from "react";
import {
  Laptop,
  Plus,
  RefreshCw,
  X,
  Trash2,
  TrendingDown,
  Building,
  CheckCircle,
  Play,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAssets, createAsset, runDepreciation, deleteAsset } from "@/lib/api";
import { Asset } from "@/types/accounting";

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("IT Hardware & Laptops");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [grossPurchaseAmount, setGrossPurchaseAmount] = useState("");
  const [usefulLifeYears, setUsefulLifeYears] = useState("3");
  const [depreciationMethod, setDepreciationMethod] = useState("STRAIGHT_LINE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetName || !grossPurchaseAmount) return;

    setIsSubmitting(true);
    try {
      await createAsset({
        assetName,
        assetCategory,
        purchaseDate,
        grossPurchaseAmount: parseFloat(grossPurchaseAmount) || 0,
        usefulLifeYears: parseInt(usefulLifeYears) || 3,
        depreciationMethod,
      });

      setIsModalOpen(false);
      setAssetName("");
      setGrossPurchaseAmount("");
      await loadAssets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRunDepreciation(id: string) {
    try {
      await runDepreciation(id);
      await loadAssets();
    } catch (err) {
      console.error(err);
    }
  }

  const totalGross = assets.reduce((acc, a) => acc + (a.grossPurchaseAmount || 0), 0);
  const totalDep = assets.reduce((acc, a) => acc + (a.accumulatedDepreciation || 0), 0);
  const totalNetBook = totalGross - totalDep;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Fixed Asset Management &amp; Depreciation
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-700 shadow-2xs">
              Asset Register
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Capital expenditure tracking, straight-line &amp; WDV depreciation, and net book value audit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadAssets} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="liquid-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Asset</span>
          </button>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Asset Value</span>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{formatCurrency(totalGross)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total Original Purchase Cost</p>
        </div>
        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accumulated Depreciation</span>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{formatCurrency(totalDep)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total Written-off to P&amp;L</p>
        </div>
        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Book Value (NBV)</span>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{formatCurrency(totalNetBook)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Balance Sheet Carrying Value</p>
        </div>
      </div>

      {/* Assets Table */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/30 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-600" />
            <span>Asset Tag &amp; Name</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Category</span>
            <span>Purchase Cost</span>
            <span>Acc. Dep</span>
            <span className="w-28 text-right">Net Book Value</span>
            <span className="w-36 text-center">Action</span>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No fixed assets registered yet. Click &quot;Register New Asset&quot; to add hardware, servers, or equipment!
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50 text-xs">
            {assets.map((ast) => (
              <div key={ast.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">{ast.assetCode}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-700">
                      {ast.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">{ast.assetName}</div>
                  <div className="text-[11px] text-slate-500">Purchased: {ast.purchaseDate} • {ast.usefulLifeYears} Yrs Life ({ast.depreciationMethod})</div>
                </div>

                <div className="flex items-center gap-8 font-mono">
                  <span className="text-slate-600 font-sans text-[11px] w-28 truncate">{ast.assetCategory}</span>
                  <span className="text-slate-700 font-bold">{formatCurrency(ast.grossPurchaseAmount)}</span>
                  <span className="text-slate-500">{formatCurrency(ast.accumulatedDepreciation)}</span>
                  <span className="font-black text-slate-900 w-28 text-right">{formatCurrency(ast.netBookValue)}</span>

                  <div className="flex items-center gap-2 w-36 justify-center">
                    <button
                      onClick={() => handleRunDepreciation(ast.id)}
                      disabled={ast.status === "FULLY_DEPRECIATED"}
                      className="liquid-btn-glass text-[11px] py-1 px-2.5 disabled:opacity-40"
                      title="Run Monthly Depreciation Auto-Post"
                    >
                      <Play className="w-3 h-3 text-slate-700" /> Depreciate
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAsset(ast.id);
                        loadAssets();
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900">Register New Fixed Asset</h2>
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
                <label className="block font-bold text-slate-700 mb-1">Asset Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro M3 Max (Dev Fleet) or Cloud Rack Server"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asset Category *</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="IT Hardware & Laptops">IT Hardware &amp; Laptops</option>
                    <option value="Cloud Servers & Networking">Cloud Servers &amp; Networking</option>
                    <option value="Office Furniture & Fixtures">Office Furniture &amp; Fixtures</option>
                    <option value="Vehicles & Transport">Vehicles &amp; Transport</option>
                    <option value="Plant & Machinery">Plant &amp; Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gross Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={grossPurchaseAmount}
                    onChange={(e) => setGrossPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Useful Life (Years) *</label>
                  <input
                    type="number"
                    required
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-slate-400 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Depreciation Method</label>
                <select
                  value={depreciationMethod}
                  onChange={(e) => setDepreciationMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="STRAIGHT_LINE">Straight Line Method (SLM)</option>
                  <option value="WRITTEN_DOWN_VALUE">Written Down Value (WDV)</option>
                </select>
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
                  {isSubmitting ? "Registering..." : "Register Fixed Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
