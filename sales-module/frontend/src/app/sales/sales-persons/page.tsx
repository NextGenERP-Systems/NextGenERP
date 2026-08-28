"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Plus,
  Search,
  CheckCircle2,
  Users,
  Target,
  Award,
  TrendingUp,
  Percent,
  X,
  RefreshCw,
  Layers,
  Home,
} from "lucide-react";
import Link from "next/link";
import { getSalesPersons, createSalesPerson, toggleSalesPersonStatus } from "@/lib/api";
import { SalesPerson } from "@/types/sales";

export default function SalesPersonsPage() {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [salesPersonName, setSalesPersonName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parentSalesPerson, setParentSalesPerson] = useState("Alexander Wright");
  const [commissionRate, setCommissionRate] = useState("4.5");
  const [targetAmount, setTargetAmount] = useState("500000");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSalesPersons();
      setSalesPersons(data || []);
    } catch (err) {
      console.error("Failed to load sales persons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      await toggleSalesPersonStatus(id);
      setActionSuccess(`Sales person status updated!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.message || err));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesPersonName) return;

    try {
      await createSalesPerson({
        salesPersonName,
        employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        email,
        phone,
        parentSalesPerson,
        commissionRate: Number(commissionRate) || 4.5,
        targetAmount: Number(targetAmount) || 500000,
      });

      setIsCreateOpen(false);
      setActionSuccess("Sales representative added to hierarchy!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create sales person");
    }
  };

  const filteredReps = salesPersons.filter(
    (sp) =>
      sp.salesPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.employeeId && sp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sp.parentSalesPerson && sp.parentSalesPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalTarget = salesPersons.reduce((acc, sp) => acc + (Number(sp.targetAmount) || 0), 0);
  const totalAllocated = salesPersons.reduce((acc, sp) => acc + (Number(sp.allocatedAmount) || 0), 0);
  const totalIncentives = salesPersons.reduce((acc, sp) => acc + (Number(sp.incentivesEarned) || 0), 0);

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
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
          <span className="font-bold text-gray-900">
            Sales Person
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sales Person</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Sales Reps</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{salesPersons.filter((sp) => !sp.disabled).length}</div>
          <div className="text-[11px] text-slate-500">{salesPersons.length} Total Sales Team Hierarchy</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sales Quota Target vs Achieved</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">
            ₹{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">
            Target: ₹{totalTarget.toLocaleString()} ({totalTarget > 0 ? ((totalAllocated / totalTarget) * 100).toFixed(1) : 0}%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Incentives & Bonuses</div>
          <div className="text-2xl font-bold text-purple-600 font-mono">
            ₹{totalIncentives.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-600 font-medium">Earned Performance Incentives</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Rep Name, ID, Reports To..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredReps.length}</span> Sales Representatives
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Sales Person</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Reports To (Parent)</th>
                <th className="py-3 px-4 text-center">Commission %</th>
                <th className="py-3 px-4 text-right">Annual Target</th>
                <th className="py-3 px-4 text-right">Achieved Sales</th>
                <th className="py-3 px-4 text-right">Incentives</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading sales persons...</td>
                </tr>
              ) : filteredReps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">No sales representatives found.</td>
                </tr>
              ) : (
                filteredReps.map((sp) => {
                  const targetPct = sp.targetAmount > 0 ? (sp.allocatedAmount / sp.targetAmount) * 100 : 0;
                  return (
                    <tr key={sp.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sp.salesPersonName}</div>
                        <div className="text-[10px] text-slate-400">{sp.email || "rep@nextgen.erp"}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{sp.employeeId || "EMP-001"}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {sp.parentSalesPerson || "Root"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{sp.commissionRate}%</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{Number(sp.targetAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="space-y-0.5">
                          <span className="font-bold font-mono text-blue-600">
                            ₹{Number(sp.allocatedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">({targetPct.toFixed(1)}%)</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-purple-600">
                        ₹{Number(sp.incentivesEarned).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            !sp.disabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {!sp.disabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(sp.id, sp.salesPersonName)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-200 transition-all"
                        >
                          {!sp.disabled ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span>Add Sales Person</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. David Kim"
                  value={salesPersonName}
                  onChange={(e) => setSalesPersonName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-0104"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Reports To</label>
                  <input
                    type="text"
                    value={parentSalesPerson}
                    onChange={(e) => setParentSalesPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Annual Target (₹)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="d.kim@nextgen.erp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 789-0133"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Add Sales Rep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
