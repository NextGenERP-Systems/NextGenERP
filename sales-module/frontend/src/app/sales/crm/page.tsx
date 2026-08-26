"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  X,
  RefreshCw,
  Clock,
  Briefcase,
} from "lucide-react";
import { getLeads, getOpportunities, createLead, createOpportunity, updateOpportunityStatus, createQuotation, convertOpportunityToQuotation, convertLeadToOpportunity } from "@/lib/api";
import { Lead, Opportunity, Customer } from "@/types/sales";
import { useRouter } from "next/navigation";

export default function CrmPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"opportunities" | "leads">("opportunities");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Lead Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leadSource, setLeadSource] = useState("Website / Inbound");

  // New Opportunity Modal
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [oppTitle, setOppTitle] = useState("");
  const [partyName, setPartyName] = useState("");
  const [dealSize, setDealSize] = useState("");
  const [probability, setProbability] = useState("75");
  const [salesStage, setSalesStage] = useState("Solution Proposal");

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, oppsData] = await Promise.all([getLeads(), getOpportunities()]);
      setLeads(leadsData || []);
      setOpportunities(oppsData || []);
    } catch (err) {
      console.error("Failed to load CRM data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead({ leadName, companyName, email, phone, leadSource });
      setIsLeadModalOpen(false);
      setActionSuccess("Lead added successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create lead");
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOpportunity({
        title: oppTitle,
        partyName,
        dealSize: Number(dealSize),
        probability: Number(probability),
        salesStage,
      });
      setIsOppModalOpen(false);
      setActionSuccess("Deal created in pipeline!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create deal");
    }
  };

  const handleStageChange = async (oppId: string, newStatus: any, newStage: string) => {
    try {
      await updateOpportunityStatus(oppId, newStatus, newStage);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      await convertLeadToOpportunity(leadId);
      setActionSuccess("Lead successfully converted to Opportunity Deal!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
      setActiveTab("opportunities");
    } catch (err: any) {
      alert(err.message || "Failed to convert lead");
    }
  };

  const handleConvertOppToQuote = async (oppId: string) => {
    try {
      const quote = await convertOpportunityToQuotation(oppId);
      setActionSuccess(`Opportunity converted to Quotation ${quote.quotationNumber}!`);
      setTimeout(() => setActionSuccess(null), 5000);
      loadData();
      router.push("/sales/quotations");
    } catch (err: any) {
      alert(err.message || "Failed to convert to quotation");
    }
  };

  const totalPipeline = opportunities.reduce((acc, opp) => acc + (Number(opp.dealSize) || 0), 0);
  const weightedPipeline = opportunities.reduce(
    (acc, opp) => acc + (Number(opp.dealSize) * (Number(opp.probability) || 50)) / 100,
    0
  );

  const STAGES = [
    { key: "QUALIFICATION", label: "Qualification", color: "bg-slate-100 border-slate-300 text-slate-700" },
    { key: "PROPOSAL", label: "Proposal Sent", color: "bg-blue-50 border-blue-200 text-blue-800" },
    { key: "NEGOTIATION", label: "Negotiation", color: "bg-purple-50 border-purple-200 text-purple-800" },
    { key: "WON", label: "Closed Won", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
    { key: "LOST", label: "Closed Lost", color: "bg-red-50 border-red-200 text-red-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Target className="h-6 w-6 text-blue-600" />
            <span>CRM & Pre-Sales Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming inbound leads, deals, stage progression, and conversion to Quotations.
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
            onClick={() => (activeTab === "opportunities" ? setIsOppModalOpen(true) : setIsLeadModalOpen(true))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTab === "opportunities" ? "New Deal" : "New Lead"}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ₹{totalPipeline.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">{opportunities.length} Active Deals in Funnel</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weighted Forecast</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">
            ₹{weightedPipeline.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3 w-3" /> Probability Adjusted
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inbound Leads</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{leads.length} Leads</div>
          <div className="text-[11px] text-slate-500">Ready for sales qualification</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "opportunities"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Deals Pipeline ({opportunities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "leads"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Leads Directory ({leads.length})</span>
        </button>
      </div>

      {/* Opportunities Kanban Board */}
      {activeTab === "opportunities" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map((stage) => {
            const stageOpps = opportunities.filter((o) => o.status === stage.key);
            const stageTotal = stageOpps.reduce((acc, o) => acc + (Number(o.dealSize) || 0), 0);

            return (
              <div key={stage.key} className="bg-slate-50/75 rounded-xl p-3 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{stage.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ₹{stageTotal.toLocaleString()} ({stageOpps.length})
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {stageOpps.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic text-center py-6">No deals</div>
                  ) : (
                    stageOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow"
                      >
                        <div className="font-semibold text-slate-900 text-xs line-clamp-1">{opp.title}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{opp.partyName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-900 font-mono">
                            ₹{Number(opp.dealSize).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">{opp.probability}% prob</span>
                        </div>

                        {/* Stage Mover & Quotation Action */}
                        <div className="flex flex-col gap-1 pt-1 text-[10px]">
                          <div className="flex justify-between items-center">
                            {stage.key !== "WON" && (
                              <button
                                onClick={() => handleStageChange(opp.id, "WON", "Closed Won")}
                                className="text-emerald-600 hover:text-emerald-800 font-medium"
                              >
                                ✓ Mark Won
                              </button>
                            )}
                            {stage.key !== "PROPOSAL" && stage.key !== "WON" && (
                              <button
                                onClick={() => handleStageChange(opp.id, "PROPOSAL", "Proposal Sent")}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                → Proposal
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => handleConvertOppToQuote(opp.id)}
                            className="w-full mt-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[10px] flex items-center justify-center gap-1 transition-all"
                          >
                            <span>📄 Create Quotation</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leads Table */}
      {activeTab === "leads" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lead Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{lead.leadName}</td>
                    <td className="py-3 px-4 text-slate-700">{lead.companyName || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{lead.email || "No email"}</div>
                      <div className="text-[10px] text-slate-400">{lead.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{lead.leadSource}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setOppTitle(`Opportunity - ${lead.companyName || lead.leadName}`);
                          setPartyName(lead.companyName || lead.leadName);
                          setIsOppModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition-all"
                      >
                        <span>Convert to Deal</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {isOppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Create Sales Deal (Opportunity)</span>
              </h2>
              <button onClick={() => setIsOppModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="e.g. Cloud ERP 50 Users - Vance Auto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Prospect / Account Name *</label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Vance Industrial Automations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Deal Size (₹) *</label>
                  <input
                    type="number"
                    required
                    value={dealSize}
                    onChange={(e) => setDealSize(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Win Probability (%)</label>
                  <input
                    type="number"
                    value={probability}
                    onChange={(e) => setProbability(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOppModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span>Add Inbound Lead</span>
              </h2>
              <button onClick={() => setIsLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. David Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. AeroDynamics Corp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lead@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
