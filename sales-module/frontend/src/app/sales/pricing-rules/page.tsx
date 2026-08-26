"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Percent,
  Gift,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  X,
  RefreshCw,
  Search,
} from "lucide-react";
import { getPricingRules, getCoupons, createPricingRule, createCoupon, applyCoupon } from "@/lib/api";
import { PricingRule, CouponCode } from "@/types/sales";

export default function PricingRulesPage() {
  const [activeTab, setActiveTab] = useState<"rules" | "coupons">("rules");
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Live Coupon Test Tool
  const [testCouponCode, setTestCouponCode] = useState("NEXTGEN10");
  const [testOrderAmount, setTestOrderAmount] = useState("20000");
  const [testResult, setTestResult] = useState<any>(null);

  // New Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleTitle, setRuleTitle] = useState("");
  const [applyOn, setApplyOn] = useState<any>("ITEM_CODE");
  const [applyKeyId, setApplyKeyId] = useState("");
  const [minQty, setMinQty] = useState("2");
  const [discountPercentage, setDiscountPercentage] = useState("10");

  // New Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponName, setCouponName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<any>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("15");
  const [minOrderAmount, setMinOrderAmount] = useState("5000");

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, couponsData] = await Promise.all([getPricingRules(), getCoupons()]);
      setRules(rulesData || []);
      setCoupons(couponsData || []);
    } catch (err) {
      console.error("Failed to load pricing data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await applyCoupon(testCouponCode, Number(testOrderAmount));
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ valid: false, message: err.message || "Failed to validate coupon" });
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPricingRule({
        title: ruleTitle,
        applyOn,
        applyKeyId,
        minQty: Number(minQty),
        discountPercentage: Number(discountPercentage),
      });
      setIsRuleModalOpen(false);
      setActionSuccess("Pricing rule active!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create rule");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon({
        couponName,
        couponCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
      });
      setIsCouponModalOpen(false);
      setActionSuccess("Coupon code published!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create coupon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-blue-600" />
            <span>Pricing Rules & Promotional Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated volume discounts, free gift items, and promotional coupon codes.
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
            onClick={() => (activeTab === "rules" ? setIsRuleModalOpen(true) : setIsCouponModalOpen(true))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTab === "rules" ? "New Pricing Rule" : "New Coupon"}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Interactive Coupon Test Console */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-200" />
          <h2 className="font-bold text-sm">Interactive Live Coupon Validator</h2>
        </div>
        <p className="text-xs text-blue-100 max-w-xl">
          Test and verify promotional codes against order cart thresholds before distributing to enterprise clients.
        </p>

        <form onSubmit={handleTestCoupon} className="flex flex-wrap items-center gap-3 pt-1">
          <input
            type="text"
            value={testCouponCode}
            onChange={(e) => setTestCouponCode(e.target.value)}
            placeholder="COUPON CODE"
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-blue-200 font-mono font-bold focus:outline-none focus:bg-white/20"
          />
          <div className="flex items-center gap-1.5 text-xs text-blue-100">
            <span>Cart Amount: ₹</span>
            <input
              type="number"
              value={testOrderAmount}
              onChange={(e) => setTestOrderAmount(e.target.value)}
              className="w-28 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:bg-white/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-white text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-50 transition-all shadow-sm"
          >
            Apply & Validate
          </button>
        </form>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              testResult.valid
                ? "bg-emerald-500/20 border-emerald-300 text-emerald-100"
                : "bg-red-500/20 border-red-300 text-red-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.valid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{testResult.message}</span>
            </div>
            {testResult.valid && (
              <div className="font-mono font-bold">
                Discount: -₹{Number(testResult.calculatedDiscountAmount).toLocaleString()} | Final: ₹
                {Number(testResult.finalAmount).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "rules"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Volume & Tier Pricing Rules ({rules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "coupons"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Promotional Coupons ({coupons.length})</span>
        </button>
      </div>

      {/* Pricing Rules Table */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rule Title</th>
                  <th className="py-3 px-4">Apply Target</th>
                  <th className="py-3 px-4 text-right">Min Qty</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">
                        {r.applyOn}: {r.applyKeyId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">{Number(r.minQty)} Units</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
                      {r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : `₹${r.discountAmount} OFF`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      {activeTab === "coupons" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Coupon Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Type & Value</th>
                  <th className="py-3 px-4 text-right">Min Cart Value</th>
                  <th className="py-3 px-4 text-right">Redemptions</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.couponName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded bg-purple-50 text-purple-800 font-mono font-bold text-xs border border-purple-200">
                        {c.couponCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ₹{Number(c.minOrderAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {c.usedCount} / {c.maxUses}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Pricing Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                <span>Create Volume Pricing Rule</span>
              </h2>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  placeholder="e.g. Enterprise License Tier 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Apply On</label>
                  <select
                    value={applyOn}
                    onChange={(e) => setApplyOn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="ITEM_CODE">Item Code</option>
                    <option value="ITEM_GROUP">Item Group</option>
                    <option value="CUSTOMER_GROUP">Customer Group</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Identifier *</label>
                  <input
                    type="text"
                    required
                    value={applyKeyId}
                    onChange={(e) => setApplyKeyId(e.target.value)}
                    placeholder="e.g. ERP-CLOUD-ENT"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Min Quantity</label>
                  <input
                    type="number"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Discount (%) *</label>
                  <input
                    type="number"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" />
                <span>Create Promo Coupon Code</span>
              </h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Coupon Name *</label>
                <input
                  type="text"
                  required
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  placeholder="e.g. Q4 Executive Discount"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EXEC2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Min Cart Threshold (₹)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
