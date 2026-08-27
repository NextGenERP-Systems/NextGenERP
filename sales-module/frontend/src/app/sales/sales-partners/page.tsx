"use client";

import React, { useState, useEffect } from "react";
import {
  Handshake,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Award,
  X,
  RefreshCw,
  Percent,
} from "lucide-react";
import { getSalesPartners, createSalesPartner, toggleSalesPartnerStatus } from "@/lib/api";
import { SalesPartner } from "@/types/sales";

export default function SalesPartnersPage() {
  const [partners, setPartners] = useState<SalesPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("Channel Partner");
  const [commissionRate, setCommissionRate] = useState("5.0");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [territory, setTerritory] = useState("Global");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSalesPartners();
      setPartners(data || []);
    } catch (err) {
      console.error("Failed to load sales partners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      await toggleSalesPartnerStatus(id);
      setActionSuccess(`Partner status updated!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.message || err));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName) return;

    try {
      await createSalesPartner({
        partnerName,
        partnerType,
        commissionRate: Number(commissionRate) || 5.0,
        contactPerson,
        email,
        phone,
        territory,
      });

      setIsCreateOpen(false);
      setActionSuccess("Sales partner registered successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create partner");
    }
  };

  const filteredPartners = partners.filter(
    (p) =>
      p.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partnerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.territory && p.territory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalVolume = partners.reduce((acc, p) => acc + (Number(p.totalAllocatedAmount) || 0), 0);
  const totalCommission = partners.reduce((acc, p) => acc + (Number(p.totalCommissionEarned) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Handshake className="h-6 w-6 text-blue-600" />
            <span>Sales Partners & Agencies</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ERPNext external distributors, commission agencies, referral partners, and commission payout agreements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Sales Partner</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Sales Partners</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{partners.filter((p) => !p.disabled).length}</div>
          <div className="text-[11px] text-slate-500">{partners.length} Total Partners Enrolled</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Partner Sales Volume</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">
            ₹{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-600 font-medium">Delivered & Invoiced via Partners</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Commissions Realized</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ₹{totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Total Cumulative Commission Earned</div>
        </div>
      </div>

      {/* Partners Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Partner Name, Type, Territory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredPartners.length}</span> Partners
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Partner Type</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Territory</th>
                <th className="py-3 px-4 text-center">Commission %</th>
                <th className="py-3 px-4 text-right">Sales Volume</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading sales partners...</td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">No sales partners registered.</td>
                </tr>
              ) : (
                filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.partnerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.contactPerson || "Primary Contact"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {p.partnerType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{p.email || "partner@agency.com"}</div>
                      <div className="text-[10px] text-slate-400">{p.phone || "+1 (555) 000-0000"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.territory || "Global"}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">
                      {p.commissionRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      ₹{Number(p.totalAllocatedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                      ₹{Number(p.totalCommissionEarned).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          !p.disabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {!p.disabled ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(p.id, p.partnerName)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-200 transition-all"
                      >
                        {!p.disabled ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))
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
                <Handshake className="h-4 w-4 text-blue-600" />
                <span>Register Sales Partner</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Partner / Agency Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Apex Global Distributors"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Partner Type *</label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="Channel Partner">Channel Partner</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Agent">Commission Agent</option>
                    <option value="Referral Partner">Referral Partner</option>
                  </select>
                </div>
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
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Territory Coverage</label>
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
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
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
