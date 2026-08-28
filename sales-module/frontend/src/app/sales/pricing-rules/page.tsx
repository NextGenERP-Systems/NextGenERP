"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Home,
  Trash2,
  Truck,
  TrendingUp,
  Sliders,
  DollarSign,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  getPricingRules,
  createPricingRule,
  deletePricingRule,
  getCoupons,
  createCoupon,
  applyCoupon,
  getPromotionalSchemes,
  createPromotionalScheme,
  deletePromotionalScheme,
  getShippingRules,
  createShippingRule,
  deleteShippingRule,
  getItems,
  getItemGroups,
} from "@/lib/api";
import {
  PricingRule,
  CouponCode,
  PromotionalScheme,
  ShippingRule,
  CatalogItem,
  ItemGroup,
} from "@/types/sales";

function PricingRulesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"rules" | "promotional" | "coupons" | "shipping">("rules");
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [promotionalSchemes, setPromotionalSchemes] = useState<PromotionalScheme[]>([]);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Live Coupon Test Tool State
  const [testCouponCode, setTestCouponCode] = useState("NEXTGEN10");
  const [testOrderAmount, setTestOrderAmount] = useState("20000");
  const [testResult, setTestResult] = useState<any>(null);

  // New Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    title: "",
    applyOn: "ITEM_CODE" as any,
    applyKeyId: "ERP-CLOUD-ENT",
    minQty: 2,
    discountPercentage: 10,
    discountAmount: 0,
    isFreeItem: false,
    freeItemCode: "",
    freeQty: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validUpto: "",
  });

  // New Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    couponName: "",
    couponCode: "",
    discountType: "PERCENTAGE" as any,
    discountValue: 15,
    minOrderAmount: 5000,
    maxUses: 100,
    validUpto: "",
  });

  // New Promotional Scheme Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    name: "",
    applyOn: "Item Group",
    applyKeyId: "Hardware",
    validFrom: new Date().toISOString().split("T")[0],
    validUpto: "",
    minQty: 5,
    discountPercentage: 15,
    description: "",
  });

  // New Shipping Rule Modal
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    shippingRuleName: "",
    calculateBasedOn: "Net Total" as any,
    shippingAmount: 500,
    fromValue: 0,
    toValue: 50000,
    costCenter: "Main - NC",
  });

  // Sync tab from URL query params
  useEffect(() => {
    if (tabParam) {
      if (tabParam === "promotional" || tabParam === "schemes") setActiveTab("promotional");
      else if (tabParam === "coupons") setActiveTab("coupons");
      else if (tabParam === "shipping" || tabParam === "shipping-rules") setActiveTab("shipping");
      else setActiveTab("rules");
    }
  }, [tabParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, couponsData, promoData, shippingData, itmData, grpData] = await Promise.all([
        getPricingRules(),
        getCoupons(),
        getPromotionalSchemes(),
        getShippingRules(),
        getItems(),
        getItemGroups(),
      ]);
      setRules(rulesData || []);
      setCoupons(couponsData || []);
      setPromotionalSchemes(promoData || []);
      setShippingRules(shippingData || []);
      setCatalogItems(itmData || []);
      setItemGroups(grpData || []);
    } catch (err) {
      console.error("Failed to load pricing and promo data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

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
      await createPricingRule(ruleForm);
      setIsRuleModalOpen(false);
      showNotification(`Pricing Rule "${ruleForm.title}" published!`);
      loadData();
      setRuleForm({
        title: "",
        applyOn: "ITEM_CODE",
        applyKeyId: "ERP-CLOUD-ENT",
        minQty: 2,
        discountPercentage: 10,
        discountAmount: 0,
        isFreeItem: false,
        freeItemCode: "",
        freeQty: 0,
        validFrom: new Date().toISOString().split("T")[0],
        validUpto: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create rule");
    }
  };

  const handleDeleteRule = async (id: string, title: string) => {
    if (!confirm(`Delete pricing rule "${title}"?`)) return;
    try {
      await deletePricingRule(id);
      showNotification(`Rule "${title}" deleted.`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete rule");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon(couponForm);
      setIsCouponModalOpen(false);
      showNotification(`Coupon Code "${couponForm.couponCode}" active!`);
      loadData();
      setCouponForm({
        couponName: "",
        couponCode: "",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 5000,
        maxUses: 100,
        validUpto: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create coupon");
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromotionalScheme(promoForm);
      setIsPromoModalOpen(false);
      showNotification(`Promotional Scheme "${promoForm.name}" created!`);
      loadData();
      setPromoForm({
        name: "",
        applyOn: "Item Group",
        applyKeyId: "Hardware",
        validFrom: new Date().toISOString().split("T")[0],
        validUpto: "",
        minQty: 5,
        discountPercentage: 15,
        description: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create promotional scheme");
    }
  };

  const handleDeletePromo = async (id: string, name: string) => {
    if (!confirm(`Delete promotional scheme "${name}"?`)) return;
    await deletePromotionalScheme(id);
    showNotification(`Scheme "${name}" removed.`);
    loadData();
  };

  const handleCreateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShippingRule(shippingForm);
      setIsShippingModalOpen(false);
      showNotification(`Shipping Rule "${shippingForm.shippingRuleName}" created!`);
      loadData();
      setShippingForm({
        shippingRuleName: "",
        calculateBasedOn: "Net Total",
        shippingAmount: 500,
        fromValue: 0,
        toValue: 50000,
        costCenter: "Main - NC",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create shipping rule");
    }
  };

  const handleDeleteShipping = async (id: string, name: string) => {
    if (!confirm(`Delete shipping rule "${name}"?`)) return;
    await deleteShippingRule(id);
    showNotification(`Shipping rule "${name}" removed.`);
    loadData();
  };

  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/sales/pricing-rules?tab=${tab}`);
  };

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-20">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="text-gray-600 font-normal">Items &amp; Pricing</span>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900 capitalize">
            {activeTab === "rules" && "Pricing Rule"}
            {activeTab === "promotional" && "Promotional Scheme"}
            {activeTab === "coupons" && "Coupon Code"}
            {activeTab === "shipping" && "Shipping Rule"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {activeTab === "rules" && (
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pricing Rule</span>
            </button>
          )}

          {activeTab === "promotional" && (
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Promotional Scheme</span>
            </button>
          )}

          {activeTab === "coupons" && (
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Coupon Code</span>
            </button>
          )}

          {activeTab === "shipping" && (
            <button
              onClick={() => setIsShippingModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shipping Rule</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Feedback Alert Banner */}
        {actionSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Submodule Tab Bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-medium overflow-x-auto">
          {[
            { id: "rules", label: `Pricing Rules (${rules.length})`, icon: Percent },
            { id: "promotional", label: `Promotional Schemes (${promotionalSchemes.length})`, icon: Sparkles },
            { id: "coupons", label: `Coupon Codes (${coupons.length})`, icon: Tag },
            { id: "shipping", label: `Shipping Rules (${shippingRules.length})`, icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PRICING RULES (ERPNext DocType: Pricing Rule) */}
        {/* ========================================================================= */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Rule Title</th>
                    <th className="py-3 px-4">Apply On</th>
                    <th className="py-3 px-4">Target Key / Scope</th>
                    <th className="py-3 px-4">Min Qty</th>
                    <th className="py-3 px-4">Discount / Benefit</th>
                    <th className="py-3 px-4">Free Item</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No pricing rules configured. Click "+ Add Pricing Rule" to create one.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{rule.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {rule.applyOn}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-800">{rule.applyKeyId || "ALL"}</td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-800">{rule.minQty || 1} units</td>
                        <td className="py-3 px-4">
                          {rule.discountPercentage > 0 && (
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-mono">
                              {rule.discountPercentage}% OFF
                            </span>
                          )}
                          {rule.discountAmount > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">
                              -₹{rule.discountAmount}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {rule.isFreeItem ? `${rule.freeQty || 1}x ${rule.freeItemCode}` : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {rule.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id, rule.title)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROMOTIONAL SCHEMES (ERPNext DocType: Promotional Scheme) */}
        {/* ========================================================================= */}
        {activeTab === "promotional" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotionalSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-gray-900 text-sm">{scheme.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePromo(scheme.id, scheme.name)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {scheme.description && <p className="text-gray-500 text-xs">{scheme.description}</p>}

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Category / Item:</span>
                      <span className="font-semibold text-gray-800">
                        {scheme.applyOn}: {scheme.applyKeyId || "All"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume Threshold:</span>
                      <span className="font-mono font-bold text-gray-800">Min {scheme.minQty || 1} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Promotional Slab Rebate:</span>
                      <span className="font-mono font-bold text-blue-600 text-sm">
                        {scheme.discountPercentage}% Discount
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-200">
                      <span>Valid:</span>
                      <span>
                        {scheme.validFrom || "Active"} {scheme.validUpto ? `to ${scheme.validUpto}` : "(Continuous)"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COUPON CODES (ERPNext DocType: Coupon Code) */}
        {/* ========================================================================= */}
        {activeTab === "coupons" && (
          <div className="space-y-4">
            {/* Interactive Live Coupon Tester Console */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-200" />
                <h2 className="font-bold text-sm">Live Enterprise Coupon Engine Validator</h2>
              </div>
              <p className="text-xs text-blue-100 max-w-xl">
                Test and verify coupon eligibility against order cart thresholds before distributing promo codes.
              </p>

              <form onSubmit={handleTestCoupon} className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  type="text"
                  value={testCouponCode}
                  onChange={(e) => setTestCouponCode(e.target.value)}
                  placeholder="COUPON CODE"
                  className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-xs text-white placeholder:text-blue-200 font-mono font-bold focus:outline-none focus:bg-white/20"
                />
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <span>Cart Total: ₹</span>
                  <input
                    type="number"
                    value={testOrderAmount}
                    onChange={(e) => setTestOrderAmount(e.target.value)}
                    className="w-28 bg-white/10 border border-white/20 rounded-md px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:bg-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-blue-700 font-bold rounded-md text-xs hover:bg-blue-50 transition-all shadow-sm"
                >
                  Verify Coupon
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                    testResult.valid
                      ? "bg-emerald-500/20 border-emerald-300 text-emerald-100"
                      : "bg-red-500/20 border-red-300 text-red-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.valid ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
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

            {/* Coupons Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Coupon Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Benefit</th>
                    <th className="py-3 px-4">Min Order</th>
                    <th className="py-3 px-4">Usage (Used / Max)</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900">{c.couponName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded w-max">
                        {c.couponCode}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-800">{formatCurrency(c.minOrderAmount)}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {c.usedCount} / {c.maxUses}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px] font-mono">{c.validUpto || "No Expiry"}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
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

        {/* ========================================================================= */}
        {/* TAB 4: SHIPPING RULES (ERPNext DocType: Shipping Rule) */}
        {/* ========================================================================= */}
        {activeTab === "shipping" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shippingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{rule.shippingRuleName}</span>
                    <button
                      onClick={() => handleDeleteShipping(rule.id, rule.shippingRuleName)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calculation Method:</span>
                      <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {rule.calculateBasedOn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Threshold Slab:</span>
                      <span className="font-mono text-gray-800">
                        ₹{rule.fromValue || 0} - ₹{rule.toValue || 999999}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100 font-bold">
                      <span className="text-gray-600">Shipping Charge:</span>
                      <span className="font-mono text-blue-600 text-sm">{formatCurrency(rule.shippingAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD PRICING RULE */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Pricing Rule</h3>
              <button onClick={() => setIsRuleModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Bulk Hardware Discount"
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Apply On</label>
                  <select
                    value={ruleForm.applyOn}
                    onChange={(e) => setRuleForm({ ...ruleForm, applyOn: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ITEM_CODE">Item Code</option>
                    <option value="ITEM_GROUP">Item Group</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="CUSTOMER_GROUP">Customer Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target / Scope Key</label>
                  <input
                    type="text"
                    placeholder="e.g. Hardware or ITEM-CODE"
                    value={ruleForm.applyKeyId}
                    onChange={(e) => setRuleForm({ ...ruleForm, applyKeyId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.minQty}
                    onChange={(e) => setRuleForm({ ...ruleForm, minQty: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ruleForm.discountPercentage}
                    onChange={(e) => setRuleForm({ ...ruleForm, discountPercentage: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Publish Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PROMOTIONAL SCHEME */}
      {/* ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Promotional Scheme</h3>
              <button onClick={() => setIsPromoModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Cloud ERP Flash Sale Scheme"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Apply On</label>
                  <select
                    value={promoForm.applyOn}
                    onChange={(e) => setPromoForm({ ...promoForm, applyOn: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Item Group">Item Group</option>
                    <option value="Item Code">Item Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Key / Group</label>
                  <input
                    type="text"
                    placeholder="e.g. Hardware or ALL"
                    value={promoForm.applyKeyId}
                    onChange={(e) => setPromoForm({ ...promoForm, applyKeyId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={promoForm.minQty}
                    onChange={(e) => setPromoForm({ ...promoForm, minQty: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={promoForm.discountPercentage}
                    onChange={(e) => setPromoForm({ ...promoForm, discountPercentage: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Terms and scheme rules..."
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD COUPON */}
      {/* ========================================================================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Coupon Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Coupon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Welcome 15%"
                  value={couponForm.couponName}
                  onChange={(e) => setCouponForm({ ...couponForm, couponName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENTERPRISE15"
                    value={couponForm.couponCode}
                    onChange={(e) => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SHIPPING RULE */}
      {/* ========================================================================= */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm">New Shipping Rule</h3>
              <button onClick={() => setIsShippingModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateShipping} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Shipping Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Day Air Freight"
                  value={shippingForm.shippingRuleName}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingRuleName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Calculation Method</label>
                  <select
                    value={shippingForm.calculateBasedOn}
                    onChange={(e) => setShippingForm({ ...shippingForm, calculateBasedOn: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Net Total">Based on Net Total</option>
                    <option value="Net Weight">Based on Net Weight</option>
                    <option value="Fixed">Fixed Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Shipping Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingForm.shippingAmount}
                    onChange={(e) => setShippingForm({ ...shippingForm, shippingAmount: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">From Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingForm.fromValue}
                    onChange={(e) => setShippingForm({ ...shippingForm, fromValue: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">To Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingForm.toValue}
                    onChange={(e) => setShippingForm({ ...shippingForm, toValue: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold">
                  Save Shipping Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PricingRulesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-gray-500 font-sans text-xs">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600" />
          <span>Loading Pricing &amp; Promotion Rules...</span>
        </div>
      }
    >
      <PricingRulesContent />
    </Suspense>
  );
}
