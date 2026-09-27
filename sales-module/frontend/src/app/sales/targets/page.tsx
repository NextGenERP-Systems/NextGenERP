"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  RefreshCw,
  X,
  AlertCircle,
  Award,
  Layers,
  BarChart3,
  DollarSign,
  Percent,
  Check,
  Sliders,
} from "lucide-react";
import {
  getSalesTargets,
  createSalesTarget,
  getSalesPersonTargetVariance,
  getTerritoryTargetVariance,
  getSalesPersons,
} from "@/lib/api";
import {
  SalesTarget,
  TargetVarianceReport,
  TargetType,
  SalesPerson,
} from "@/types/sales";
import { formatCurrency } from "@/lib/utils";

function SalesTargetsContent() {
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [activeTab, setActiveTab] = useState<"reps" | "territories" | "targets">("reps");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data State
  const [repVariances, setRepVariances] = useState<TargetVarianceReport[]>([]);
  const [terrVariances, setTerrVariances] = useState<TargetVarianceReport[]>([]);
  const [targetsList, setTargetsList] = useState<SalesTarget[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>("SALES_PERSON");
  const [targetRefId, setTargetRefId] = useState("");
  const [targetRefName, setTargetRefName] = useState("");
  const [period, setPeriod] = useState("ANNUAL");
  const [targetAmount, setTargetAmount] = useState("500000");
  const [targetQty, setTargetQty] = useState("50");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, terrs, tgts, persons] = await Promise.all([
        getSalesPersonTargetVariance(fiscalYear),
        getTerritoryTargetVariance(fiscalYear),
        getSalesTargets(fiscalYear),
        getSalesPersons(),
      ]);
      setRepVariances(reps || []);
      setTerrVariances(terrs || []);
      setTargetsList(tgts || []);
      setSalesPersons(persons || []);

      if (persons && persons.length > 0 && !targetRefId) {
        setTargetRefId(persons[0].id);
        setTargetRefName(persons[0].salesPersonName);
      }
    } catch (err) {
      console.error("Failed to load target variance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fiscalYear]);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRefId) {
      setErrorMessage("Please select a target entity.");
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createSalesTarget({
        targetType,
        targetRefId,
        targetRefName,
        fiscalYear,
        period,
        targetAmount: parseFloat(targetAmount) || 0,
        targetQty: parseFloat(targetQty) || 0,
      });

      setIsCreateOpen(false);
      setActionSuccess(`Saved ${created.period} quota target for ${created.targetRefName}!`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save target quota.");
    } finally {
      setSubmitting(false);
    }
  };

  // Top KPIs
  const currentDataset = activeTab === "territories" ? terrVariances : repVariances;
  const totalTarget = currentDataset.reduce((sum, r) => sum + r.targetAmount, 0);
  const totalAchieved = currentDataset.reduce((sum, r) => sum + r.achievedAmount, 0);
  const overallAttainment = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;
  const netVariance = totalAchieved - totalTarget;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link href="/sales" className="hover:text-blue-600 transition-colors">
              Selling
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Sales Targets & Variance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-blue-600" />
            Quota Targets & Performance Variance
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track quota distribution across sales representatives and geographical territories with real-time target vs. actual variance analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 text-xs shadow-sm">
            <span className="text-gray-500 font-medium pl-1.5">FY:</span>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="bg-transparent font-bold text-gray-900 focus:outline-none pr-1"
            >
              <option value="2026">FY 2026</option>
              <option value="2025">FY 2025</option>
            </select>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Set Quota Target</span>
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
            <span>Total Target Quota</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalTarget)}</div>
          <div className="text-[11px] text-gray-500 mt-1">Annual baseline quota target</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Actual Revenue Booked</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalAchieved)}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Confirmed booked revenue</div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Quota Attainment</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {overallAttainment.toFixed(1)}%
          </div>
          <div className="text-[11px] text-indigo-700 mt-1">
            {overallAttainment >= 100 ? "Exceeding Plan Target" : "Pacing towards target"}
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Net Variance</span>
            {netVariance >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className={`text-2xl font-bold mt-2 ${netVariance >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {netVariance >= 0 ? `+${formatCurrency(netVariance)}` : formatCurrency(netVariance)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {netVariance >= 0 ? "Surplus over target" : "Gap remaining to quota"}
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-px">
        <div className="flex items-center gap-6 text-xs font-semibold">
          {[
            { id: "reps", label: `Sales Persons (${repVariances.length})`, icon: Users },
            { id: "territories", label: `Territories (${terrVariances.length})`, icon: MapPin },
            { id: "targets", label: `Quota Config (${targetsList.length})`, icon: Sliders },
          ].map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors -mb-px ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rep or territory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      {/* TAB 1 & 2: Variance Table (Reps / Territories) */}
      {(activeTab === "reps" || activeTab === "territories") && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">
                    {activeTab === "reps" ? "Sales Representative" : "Territory Region"}
                  </th>
                  <th className="px-4 py-3 text-right">Target Quota</th>
                  <th className="px-4 py-3 text-right">Achieved Revenue</th>
                  <th className="px-4 py-3 text-right">Variance</th>
                  <th className="px-4 py-3 w-44">Attainment %</th>
                  <th className="px-4 py-3 text-center">Pacing Status</th>
                  <th className="px-4 py-3 text-center">Deals Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {(activeTab === "reps" ? repVariances : terrVariances)
                  .filter((r) => r.targetRefName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row, idx) => {
                    const isPositive = row.varianceAmount >= 0;
                    const pct = Math.min(100, Math.max(0, row.percentageAchieved));

                    return (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {row.targetRefName.charAt(0)}
                          </span>
                          <span>{row.targetRefName}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(row.targetAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                          {formatCurrency(row.achievedAmount)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${isPositive ? "text-emerald-700" : "text-amber-700"}`}>
                          {isPositive ? `+${formatCurrency(row.varianceAmount)}` : formatCurrency(row.varianceAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="font-bold text-gray-900">{row.percentageAchieved.toFixed(1)}%</span>
                              <span className="text-gray-400">{row.percentageAchieved >= 100 ? "Goal met" : `${(100 - row.percentageAchieved).toFixed(1)}% gap`}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  row.percentageAchieved >= 100
                                    ? "bg-emerald-500"
                                    : row.percentageAchieved >= 75
                                    ? "bg-blue-500"
                                    : row.percentageAchieved >= 50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.pacingStatus === "EXCEEDED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" />
                              EXCEEDED
                            </span>
                          )}
                          {row.pacingStatus === "ON_TRACK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <TrendingUp className="w-3 h-3" />
                              ON TRACK
                            </span>
                          )}
                          {row.pacingStatus === "AT_RISK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              AT RISK
                            </span>
                          )}
                          {row.pacingStatus === "BEHIND" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              BEHIND
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold text-gray-700">
                          {row.totalDealsBooked}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Target Quota Config Table */}
      {activeTab === "targets" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Fiscal Year</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Quota Target Amount</th>
                  <th className="px-4 py-3 text-right">Target Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {targetsList.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900">{t.targetRefName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {t.targetType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{t.fiscalYear}</td>
                    <td className="px-4 py-3 font-mono">{t.period}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(t.targetAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{t.targetQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Set Quota Target */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Set Sales Quota Target</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTarget} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      const type = e.target.value as TargetType;
                      setTargetType(type);
                      if (type === "SALES_PERSON" && salesPersons.length > 0) {
                        setTargetRefId(salesPersons[0].id);
                        setTargetRefName(salesPersons[0].salesPersonName);
                      } else {
                        setTargetRefId("terr-001");
                        setTargetRefName("North America - US East");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SALES_PERSON">Sales Representative</option>
                    <option value="TERRITORY">Territory Region</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fiscal Year</label>
                  <select
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select {targetType === "SALES_PERSON" ? "Sales Representative" : "Territory"} *
                </label>
                {targetType === "SALES_PERSON" ? (
                  <select
                    value={targetRefId}
                    onChange={(e) => {
                      setTargetRefId(e.target.value);
                      const rep = salesPersons.find((p) => p.id === e.target.value);
                      if (rep) setTargetRefName(rep.salesPersonName);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    {salesPersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.salesPersonName} {p.employeeId ? `(${p.employeeId})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={targetRefId}
                    onChange={(e) => {
                      setTargetRefId(e.target.value);
                      const map: Record<string, string> = {
                        "terr-001": "North America - US East",
                        "terr-002": "North America - US West",
                        "terr-003": "Europe & UK Commercial",
                        "terr-004": "Asia-Pacific & India",
                      };
                      setTargetRefName(map[e.target.value] || "Territory");
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="terr-001">North America - US East</option>
                    <option value="terr-002">North America - US West</option>
                    <option value="terr-003">Europe & UK Commercial</option>
                    <option value="terr-004">Asia-Pacific & India</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quota Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ANNUAL">Annual</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Amount (INR) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-right font-bold focus:outline-none focus:border-blue-500"
                  />
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
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Target Quota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesTargetsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading Sales Targets & Quota Performance...
        </div>
      }
    >
      <SalesTargetsContent />
    </Suspense>
  );
}
