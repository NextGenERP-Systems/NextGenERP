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
  Home,
  Receipt,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  getSalesPartners,
  createSalesPartner,
  toggleSalesPartnerStatus,
  getSalesPartnerPayouts,
  createSalesPartnerPayout,
} from "@/lib/api";
import { SalesPartner, SalesPartnerPayout } from "@/types/sales";

export default function SalesPartnersPage() {
  const [partners, setPartners] = useState<SalesPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Register Partner Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("Channel Partner");
  const [commissionRate, setCommissionRate] = useState("5.0");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [territory, setTerritory] = useState("Global");

  // Payout Modal State
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutPartner, setPayoutPartner] = useState<SalesPartner | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDate, setPayoutDate] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [payoutMode, setPayoutMode] = useState("Bank Transfer");
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Ledger / History Modal State
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [ledgerPartner, setLedgerPartner] = useState<SalesPartner | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<SalesPartnerPayout[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
      setActionSuccess(`Partner ${name} status updated!`);
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
      setPartnerName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setActionSuccess("Sales partner registered successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create partner");
    }
  };

  const openPayoutModal = (partner: SalesPartner) => {
    setPayoutPartner(partner);
    const balance = Math.max(0, (partner.totalCommissionEarned || 0) - (partner.totalCommissionPaid || 0));
    setPayoutAmount(balance > 0 ? balance.toString() : "");
    setPayoutDate(new Date().toISOString().split("T")[0]);
    setPayoutNote(`Commission Settlement for ${partner.partnerName}`);
    setPayoutMode("Bank Transfer");
    setIsPayoutOpen(true);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutPartner || !payoutAmount || Number(payoutAmount) <= 0) {
      alert("Please specify a valid payout amount.");
      return;
    }

    setPayoutLoading(true);
    try {
      const created = await createSalesPartnerPayout({
        salesPartnerId: payoutPartner.id,
        amount: Number(payoutAmount),
        postingDate: payoutDate,
        referenceNote: payoutNote,
        paymentMode: payoutMode,
      });

      setIsPayoutOpen(false);
      setActionSuccess(`Commission payout of ₹${Number(payoutAmount).toLocaleString()} recorded (${created.payoutNumber})!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to record payout: " + (err.message || err));
    } finally {
      setPayoutLoading(false);
    }
  };

  const openLedgerModal = async (partner: SalesPartner) => {
    setLedgerPartner(partner);
    setIsLedgerOpen(true);
    setLoadingHistory(true);
    try {
      const payouts = await getSalesPartnerPayouts(partner.id);
      setPayoutHistory(payouts || []);
    } catch (err) {
      console.error("Failed to load payout history", err);
    } finally {
      setLoadingHistory(false);
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
  const totalPaid = partners.reduce((acc, p) => acc + (Number(p.totalCommissionPaid) || 0), 0);
  const totalOutstanding = Math.max(0, totalCommission - totalPaid);

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
            Sales Partners & Commission Tracking
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
            <span>Add Sales Partner</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div className="text-[11px] text-blue-600 font-medium">Allocated via Orders & Invoices</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Commissions Accrued</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            ₹{totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium">Cumulative Commission Earned</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding Payouts</div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            ₹{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">
            Paid: <span className="text-emerald-600 font-semibold font-mono">₹{totalPaid.toLocaleString()}</span>
          </div>
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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Showing <span className="font-semibold text-slate-800">{filteredPartners.length}</span> Partners</span>
            <span className="text-slate-300">|</span>
            <Link
              href="/sales/reports"
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Commission Reports</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
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
                <th className="py-3 px-4 text-center">Comm %</th>
                <th className="py-3 px-4 text-right">Sales Volume</th>
                <th className="py-3 px-4 text-right">Accrued</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">Loading sales partners...</td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">No sales partners registered.</td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const earned = Number(p.totalCommissionEarned) || 0;
                  const paid = Number(p.totalCommissionPaid) || 0;
                  const balance = Math.max(0, earned - paid);

                  return (
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
                      <td className="py-3 px-4 text-right font-bold font-mono text-indigo-600">
                        ₹{earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                        ₹{paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono">
                        <span className={balance > 0 ? "text-amber-600" : "text-slate-400"}>
                          ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPayoutModal(p)}
                            title="Record commission payout to this partner"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition-all shadow-2xs"
                          >
                            <CreditCard className="h-3 w-3 text-amber-600" />
                            <span>Payout</span>
                          </button>
                          <button
                            onClick={() => openLedgerModal(p)}
                            title="View Payout & Settlement History"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(p.id, p.partnerName)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50 transition-all"
                          >
                            {!p.disabled ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Commission Settlement Payout Modal */}
      {isPayoutOpen && payoutPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <span>Record Commission Settlement</span>
              </h2>
              <button onClick={() => setIsPayoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1 text-amber-900">
              <div className="font-semibold">{payoutPartner.partnerName}</div>
              <div className="text-[11px] text-amber-800">
                Accrued: <span className="font-mono font-bold">₹{Number(payoutPartner.totalCommissionEarned || 0).toLocaleString()}</span> | Paid: <span className="font-mono font-bold text-emerald-700">₹{Number(payoutPartner.totalCommissionPaid || 0).toLocaleString()}</span>
              </div>
              <div className="text-[11px] font-medium text-amber-900">
                Current Outstanding Balance: <span className="font-mono font-bold text-amber-900">₹{Math.max(0, (payoutPartner.totalCommissionEarned || 0) - (payoutPartner.totalCommissionPaid || 0)).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Disbursement Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 5000"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Payment Date</label>
                  <input
                    type="date"
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque">Company Cheque</option>
                  <option value="UPI">Corporate UPI</option>
                  <option value="Cash">Cash / Petty Cash</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reference / Settlement Note</label>
                <textarea
                  rows={2}
                  placeholder="e.g. NEFT-UTR-998822 / Q1 Commission settlement"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayoutOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {payoutLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout & Settlement History Ledger Modal */}
      {isLedgerOpen && ledgerPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                <span>Commission Settlement History: {ledgerPartner.partnerName}</span>
              </h2>
              <button onClick={() => setIsLedgerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Earned</span>
                <div className="font-mono font-bold text-indigo-700 text-sm">₹{Number(ledgerPartner.totalCommissionEarned || 0).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Disbursed</span>
                <div className="font-mono font-bold text-emerald-700 text-sm">₹{Number(ledgerPartner.totalCommissionPaid || 0).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Remaining Due</span>
                <div className="font-mono font-bold text-amber-700 text-sm">
                  ₹{Math.max(0, (ledgerPartner.totalCommissionEarned || 0) - (ledgerPartner.totalCommissionPaid || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Payout #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Reference Note</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">Loading payout records...</td>
                    </tr>
                  ) : payoutHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">No payout settlements recorded yet for this partner.</td>
                    </tr>
                  ) : (
                    payoutHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/75">
                        <td className="py-2 px-3 font-mono font-bold text-blue-600">{h.payoutNumber}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{h.postingDate}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {h.paymentMode}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{h.referenceNote || "Settlement"}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{Number(h.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsLedgerOpen(false);
                  openPayoutModal(ledgerPartner);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-2xs"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record New Settlement</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLedgerOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
