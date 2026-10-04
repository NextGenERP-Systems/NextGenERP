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
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAssets, createAsset, runDepreciation, deleteAsset } from "@/lib/api";
import { Asset } from "@/types/accounting";

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

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

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.assetCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || ast.assetCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Fixed Asset Management &amp; Depreciation
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Asset Register
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Capital expenditure tracking, straight-line &amp; WDV depreciation, and net book value audit
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAssets}
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
            <span>+ Register New Asset</span>
          </button>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Gross Asset Value</span>
          <div className="text-xl font-bold text-zinc-900 font-mono">{formatCurrency(totalGross)}</div>
          <p className="text-[10px] text-zinc-400">Total Original Purchase Cost</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Accumulated Depreciation</span>
          <div className="text-xl font-bold text-zinc-900 font-mono">{formatCurrency(totalDep)}</div>
          <p className="text-[10px] text-zinc-400">Total Written-off to P&amp;L</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Net Book Value (NBV)</span>
          <div className="text-xl font-bold text-zinc-900 font-mono">{formatCurrency(totalNetBook)}</div>
          <p className="text-[10px] text-zinc-400">Balance Sheet Carrying Value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "IT Hardware & Laptops", "Cloud Servers & Networking", "Office Furniture & Fixtures", "Vehicles & Transport"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cat === "ALL" ? `All (${assets.length})` : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search asset code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-zinc-600" />
            <span>Asset Tag &amp; Name</span>
          </div>
          <div className="flex items-center gap-8">
            <span>Category</span>
            <span>Purchase Cost</span>
            <span>Acc. Dep</span>
            <span className="w-28 text-right">Net Book Value</span>
            <span className="w-32 text-center">Action</span>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No fixed assets registered yet. Click &quot;+ Register New Asset&quot; to add hardware, servers, or equipment!
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 text-xs">
            {filteredAssets.map((ast) => (
              <div key={ast.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 text-sm">{ast.assetCode}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                      {ast.status}
                    </span>
                  </div>
                  <div className="font-bold text-zinc-900 mt-0.5">{ast.assetName}</div>
                  <div className="text-[11px] text-zinc-500">Purchased: {ast.purchaseDate} • {ast.usefulLifeYears} Yrs Life ({ast.depreciationMethod})</div>
                </div>

                <div className="flex items-center gap-8 font-mono">
                  <span className="text-zinc-600 font-sans text-[11px] w-28 truncate">{ast.assetCategory}</span>
                  <span className="text-zinc-900 font-bold">{formatCurrency(ast.grossPurchaseAmount)}</span>
                  <span className="text-zinc-500">{formatCurrency(ast.accumulatedDepreciation)}</span>
                  <span className="font-bold text-zinc-900 w-28 text-right">{formatCurrency(ast.netBookValue)}</span>

                  <div className="flex items-center gap-1.5 w-32 justify-center">
                    <button
                      onClick={() => handleRunDepreciation(ast.id)}
                      disabled={ast.status === "FULLY_DEPRECIATED"}
                      className="px-2 py-1 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-[11px] font-medium flex items-center gap-1 disabled:opacity-40"
                      title="Run Monthly Depreciation Auto-Post"
                    >
                      <Play className="w-3 h-3 text-zinc-700" /> Depreciate
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAsset(ast.id);
                        loadAssets();
                      }}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">Register New Fixed Asset</h2>
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
                <label className="block text-zinc-700 font-semibold mb-1">Asset Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro M3 Max (Dev Fleet) or Cloud Rack Server"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Asset Category *</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="IT Hardware & Laptops">IT Hardware &amp; Laptops</option>
                    <option value="Cloud Servers & Networking">Cloud Servers &amp; Networking</option>
                    <option value="Office Furniture & Fixtures">Office Furniture &amp; Fixtures</option>
                    <option value="Vehicles & Transport">Vehicles &amp; Transport</option>
                    <option value="Plant & Machinery">Plant &amp; Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Gross Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={grossPurchaseAmount}
                    onChange={(e) => setGrossPurchaseAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Useful Life (Years) *</label>
                  <input
                    type="number"
                    required
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Depreciation Method</label>
                <select
                  value={depreciationMethod}
                  onChange={(e) => setDepreciationMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                >
                  <option value="STRAIGHT_LINE">Straight Line Method (SLM)</option>
                  <option value="WRITTEN_DOWN_VALUE">Written Down Value (WDV)</option>
                </select>
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
