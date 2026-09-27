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
  Home,
  ChevronRight,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  User,
  GripVertical,
  Layers,
  FileText,
  HelpCircle,
  ThumbsDown,
  Award,
} from "lucide-react";
import Link from "next/link";
import {
  getLeads,
  getOpportunities,
  createLead,
  createOpportunity,
  updateOpportunityStatus,
  convertOpportunityToQuotation,
  convertLeadToOpportunity,
  getCustomers,
  getSalesPersons,
} from "@/lib/api";
import { Lead, Opportunity, OpportunityStatus, Customer, SalesPerson } from "@/types/sales";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StageConfig {
  key: OpportunityStatus;
  label: string;
  defaultProbability: number;
  bgHeader: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
}

const STAGES: StageConfig[] = [
  {
    key: "PROSPECTING",
    label: "Prospecting",
    defaultProbability: 15,
    bgHeader: "bg-slate-100",
    borderColor: "border-slate-300",
    badgeBg: "bg-slate-200 text-slate-700",
    textColor: "text-slate-700",
  },
  {
    key: "QUALIFICATION",
    label: "Qualification",
    defaultProbability: 30,
    bgHeader: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100 text-blue-700",
    textColor: "text-blue-800",
  },
  {
    key: "PROPOSAL",
    label: "Proposal Sent",
    defaultProbability: 60,
    bgHeader: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-100 text-amber-800",
    textColor: "text-amber-800",
  },
  {
    key: "NEGOTIATION",
    label: "Negotiation",
    defaultProbability: 80,
    bgHeader: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-100 text-purple-700",
    textColor: "text-purple-800",
  },
  {
    key: "WON",
    label: "Closed Won",
    defaultProbability: 100,
    bgHeader: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-100 text-emerald-800",
    textColor: "text-emerald-800",
  },
  {
    key: "LOST",
    label: "Closed Lost",
    defaultProbability: 0,
    bgHeader: "bg-rose-50",
    borderColor: "border-rose-200",
    badgeBg: "bg-rose-100 text-rose-800",
    textColor: "text-rose-800",
  },
];

export default function CrmPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"opportunities" | "leads">("opportunities");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStatus | null>(null);

  // Quick View / Drawer
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Lost Reason Modal
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [oppToMarkLost, setOppToMarkLost] = useState<Opportunity | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState("");

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
  const [partyType, setPartyType] = useState<"CUSTOMER" | "LEAD">("CUSTOMER");
  const [partyName, setPartyName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dealSize, setDealSize] = useState("");
  const [probability, setProbability] = useState("30");
  const [initialStage, setInitialStage] = useState<OpportunityStatus>("QUALIFICATION");
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [assignedSalesPerson, setAssignedSalesPerson] = useState("Priya Sharma");
  const [oppEmail, setOppEmail] = useState("");
  const [oppPhone, setOppPhone] = useState("");
  const [oppNotes, setOppNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, oppsData, custsData, spData] = await Promise.all([
        getLeads(),
        getOpportunities(),
        getCustomers(),
        getSalesPersons(),
      ]);
      setLeads(leadsData || []);
      setOpportunities(oppsData || []);
      setCustomers(custsData || []);
      setSalesPersons(spData || []);
    } catch (err) {
      console.error("Failed to load CRM data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData("text/plain", oppId);
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: OpportunityStatus) => {
    e.preventDefault();
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: OpportunityStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const oppId = e.dataTransfer.getData("text/plain") || draggedOppId;
    if (!oppId) return;

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp || opp.status === targetStage) {
      setDraggedOppId(null);
      return;
    }

    if (targetStage === "LOST") {
      setOppToMarkLost(opp);
      setIsLostModalOpen(true);
      setDraggedOppId(null);
      return;
    }

    const stageConfig = STAGES.find((s) => s.key === targetStage);
    const stageLabel = stageConfig ? stageConfig.label : targetStage;

    try {
      const updated = await updateOpportunityStatus(oppId, targetStage, stageLabel);
      setOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, status: targetStage, salesStage: stageLabel } : o)));
      showSuccess(`Deal "${opp.title}" moved to ${stageLabel}!`);
    } catch (err: any) {
      alert("Failed to update stage: " + (err.message || err));
    } finally {
      setDraggedOppId(null);
    }
  };

  const handleLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppToMarkLost) return;
    try {
      await updateOpportunityStatus(oppToMarkLost.id, "LOST", "Closed Lost", lostReasonInput);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppToMarkLost.id ? { ...o, status: "LOST", salesStage: "Closed Lost", lostReason: lostReasonInput } : o))
      );
      setIsLostModalOpen(false);
      setOppToMarkLost(null);
      setLostReasonInput("");
      showSuccess(`Deal "${oppToMarkLost.title}" recorded as Closed Lost.`);
    } catch (err: any) {
      alert("Failed to record lost reason: " + (err.message || err));
    }
  };

  const handleStageChange = async (oppId: string, newStatus: OpportunityStatus, newStage: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (newStatus === "LOST") {
      if (opp) {
        setOppToMarkLost(opp);
        setIsLostModalOpen(true);
      }
      return;
    }

    try {
      await updateOpportunityStatus(oppId, newStatus, newStage);
      setOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, status: newStatus, salesStage: newStage } : o)));
      showSuccess(`Stage updated to ${newStage}`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      await convertLeadToOpportunity(leadId);
      showSuccess("Lead successfully converted to Opportunity Deal!");
      loadData();
      setActiveTab("opportunities");
    } catch (err: any) {
      alert(err.message || "Failed to convert lead");
    }
  };

  const handleConvertOppToQuote = async (oppId: string) => {
    try {
      const quote = await convertOpportunityToQuotation(oppId);
      showSuccess(`Opportunity converted to Quotation ${quote.quotationNumber}!`);
      loadData();
      router.push(`/sales/quotations?highlight=${quote.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to convert to quotation");
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead({ leadName, companyName, email, phone, leadSource });
      setIsLeadModalOpen(false);
      showSuccess("Lead added successfully!");
      setLeadName("");
      setCompanyName("");
      setEmail("");
      setPhone("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create lead");
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPartyName = partyType === "CUSTOMER" && selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.customerName || partyName
      : partyName;

    if (!finalPartyName) {
      alert("Please provide an Account or Prospect name.");
      return;
    }

    try {
      const stageConfig = STAGES.find((s) => s.key === initialStage);
      await createOpportunity({
        title: oppTitle,
        partyName: finalPartyName,
        partyId: selectedCustomerId || undefined,
        opportunityFrom: partyType,
        dealSize: Number(dealSize) || 0,
        probability: Number(probability) || 50,
        status: initialStage,
        salesStage: stageConfig?.label || "Qualification",
        salesPerson: assignedSalesPerson,
        expectedClosingDate: expectedCloseDate,
        contactEmail: oppEmail,
        contactPhone: oppPhone,
        notes: oppNotes,
      });

      setIsOppModalOpen(false);
      showSuccess(`Deal "${oppTitle}" created in pipeline!`);
      setOppTitle("");
      setPartyName("");
      setDealSize("");
      setOppNotes("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create deal");
    }
  };

  // Filtered Opportunities
  const filteredOpps = opportunities.filter((o) => {
    if (selectedOwnerFilter !== "ALL" && o.salesPerson !== selectedOwnerFilter) {
      return false;
    }
    if (
      searchTerm &&
      !o.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !o.partyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(o.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalPipeline = filteredOpps.reduce((acc, opp) => acc + (Number(opp.dealSize) || 0), 0);
  const weightedPipeline = filteredOpps.reduce(
    (acc, opp) => acc + (Number(opp.dealSize) * (Number(opp.probability) || 50)) / 100,
    0
  );
  const wonDealsTotal = filteredOpps
    .filter((o) => o.status === "WON")
    .reduce((acc, o) => acc + (Number(o.dealSize) || 0), 0);

  // Available unique sales owners for filter dropdown
  const uniqueOwners = Array.from(
    new Set(opportunities.map((o) => o.salesPerson).filter(Boolean) as string[])
  );

  return (
    <div className="space-y-4 text-slate-800 font-sans text-xs bg-slate-50/40 min-h-screen pb-16">
      {/* Top Navbar & Breadcrumbs */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-slate-500 hover:text-slate-900 flex items-center">
            <Home className="w-4 h-4 text-slate-500" />
          </Link>
          <span className="text-slate-400 font-light">/</span>
          <Link href="/sales" className="text-slate-600 hover:text-slate-900 font-normal">
            Selling
          </Link>
          <span className="text-slate-400 font-light">/</span>
          <span className="font-bold text-slate-900">Visual Opportunity Pipeline</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => (activeTab === "opportunities" ? setIsOppModalOpen(true) : setIsLeadModalOpen(true))}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === "opportunities" ? "Add Opportunity" : "Add Inbound Lead"}</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4 max-w-[1700px] mx-auto">
        {/* Success Banner */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {/* 3 KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline Value</div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(totalPipeline)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{filteredOpps.length} Total Deals Tracked</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weighted Forecast</div>
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {formatCurrency(weightedPipeline)}
            </div>
            <div className="text-[11px] text-indigo-600 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Probability Adjusted Expected Value
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Closed Won Revenue</div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {formatCurrency(wonDealsTotal)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Successfully Converted Deals</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inbound Leads</div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{leads.length} Leads</div>
            <div className="text-[11px] text-slate-500">Unqualified Prospects</div>
          </div>
        </div>

        {/* Filter Bar & Tabs Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          {/* Tabs */}
          <div className="flex gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`pb-2.5 transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "opportunities"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Opportunities Kanban ({opportunities.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`pb-2.5 transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "leads"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Inbound Leads ({leads.length})</span>
            </button>
          </div>

          {/* Filters for Opportunities */}
          {activeTab === "opportunities" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search deals, company, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedOwnerFilter}
                  onChange={(e) => setSelectedOwnerFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="ALL">All Sales Reps</option>
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: VISUAL OPPORTUNITY KANBAN PIPELINE (DRAG & DROP)                   */}
        {/* ========================================================================= */}
        {activeTab === "opportunities" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start">
            {STAGES.map((stage) => {
              const stageOpps = filteredOpps.filter((o) => o.status === stage.key);
              const stageTotal = stageOpps.reduce((acc, o) => acc + (Number(o.dealSize) || 0), 0);
              const stageWeighted = stageOpps.reduce(
                (acc, o) => acc + (Number(o.dealSize) * (Number(o.probability) || 50)) / 100,
                0
              );
              const isOver = dragOverStage === stage.key;

              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  className={`rounded-xl border transition-all min-h-[550px] flex flex-col ${
                    isOver
                      ? "border-2 border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200"
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-3 rounded-t-xl border-b border-slate-200/80 ${stage.bgHeader}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${stage.textColor}`}>{stage.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.badgeBg}`}>
                        {stageOpps.length}
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between text-[11px] font-mono">
                      <span className="font-bold text-slate-800">{formatCurrency(stageTotal)}</span>
                      <span className="text-[10px] text-slate-500" title="Weighted forecast">
                        W: {formatCurrency(stageWeighted)}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[750px]">
                    {stageOpps.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic text-center py-10 border-2 border-dashed border-slate-200/80 rounded-lg">
                        Drag deals here
                      </div>
                    ) : (
                      stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, opp.id)}
                          onClick={() => setSelectedOpp(opp)}
                          className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group space-y-2 relative"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900 text-xs line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {opp.title}
                            </span>
                            <GripVertical className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{opp.partyName}</span>
                          </div>

                          {opp.salesPerson && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <User className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span>{opp.salesPerson}</span>
                            </div>
                          )}

                          {opp.lostReason && stage.key === "LOST" && (
                            <div className="text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 font-medium">
                              Reason: {opp.lostReason}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                            <span className="font-bold text-slate-900 font-mono">
                              {formatCurrency(opp.dealSize)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                opp.probability >= 70
                                  ? "bg-emerald-50 text-emerald-700"
                                  : opp.probability >= 30
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {opp.probability}%
                            </span>
                          </div>

                          {opp.expectedClosingDate && (
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>Target: {formatDate(opp.expectedClosingDate)}</span>
                            </div>
                          )}

                          {/* Quick Actions inside Card */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]"
                          >
                            {stage.key !== "WON" && (
                              <button
                                onClick={() => handleStageChange(opp.id, "WON", "Closed Won")}
                                className="text-emerald-600 hover:text-emerald-800 font-semibold"
                              >
                                ✓ Won
                              </button>
                            )}

                            {stage.key !== "LOST" && (
                              <button
                                onClick={() => {
                                  setOppToMarkLost(opp);
                                  setIsLostModalOpen(true);
                                }}
                                className="text-rose-600 hover:text-rose-800 font-semibold"
                              >
                                ✕ Lost
                              </button>
                            )}

                            <button
                              onClick={() => handleConvertOppToQuote(opp.id)}
                              className="ml-auto px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                              title="Generate Quotation"
                            >
                              <FileText className="h-2.5 w-2.5" />
                              <span>Quote</span>
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

        {/* ========================================================================= */}
        {/* TAB 2: INBOUND LEADS DIRECTORY                                            */}
        {/* ========================================================================= */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Inbound Marketing & Web Leads</span>
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Inbound Lead</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Lead Contact</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Email & Phone</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{lead.leadName}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{lead.companyName || "N/A"}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{lead.email || "No email"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {lead.leadSource}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleConvertLead(lead.id)}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] inline-flex items-center gap-1 border border-indigo-200 transition-colors"
                        >
                          <Sparkles className="h-3 w-3 text-indigo-600" />
                          <span>Convert to Deal</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS & DRAWERS                                                          */}
      {/* ========================================================================= */}

      {/* Deal Detail / Quick View Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">{selectedOpp.title}</h2>
                <div className="text-xs text-slate-500 font-medium">{selectedOpp.partyName}</div>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Deal Value</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {formatCurrency(selectedOpp.dealSize)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Win Probability</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{selectedOpp.probability}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Stage</span>
                <span className="font-semibold text-slate-800">{selectedOpp.salesStage}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sales Representative</span>
                <span className="font-semibold text-slate-800">{selectedOpp.salesPerson || "Unassigned"}</span>
              </div>
            </div>

            {selectedOpp.notes && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-amber-900 text-[11px] block">Activity & Discovery Notes</span>
                <p className="text-slate-700">{selectedOpp.notes}</p>
              </div>
            )}

            {selectedOpp.lostReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-rose-900 text-[11px] block">Closed Lost Reason</span>
                <p className="text-rose-700">{selectedOpp.lostReason}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleConvertOppToQuote(selectedOpp.id)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Create Official Quotation</span>
              </button>

              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closed Lost Reason Modal */}
      {isLostModalOpen && oppToMarkLost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-rose-600" />
                <span>Record Closed Lost Deal</span>
              </h2>
              <button onClick={() => setIsLostModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLostSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Recording <strong>&quot;{oppToMarkLost.title}&quot;</strong> ({oppToMarkLost.partyName}) as Lost. Please specify the
                primary reason:
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Lost Reason Category</label>
                <select
                  value={lostReasonInput}
                  onChange={(e) => setLostReasonInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="">Select Primary Reason...</option>
                  <option value="Price too high / Budget constraints">Price too high / Budget constraints</option>
                  <option value="Selected competitor solution">Selected competitor solution</option>
                  <option value="Project postponed / Cancelled internally">Project postponed / Cancelled internally</option>
                  <option value="Missing required specialized feature">Missing required specialized feature</option>
                  <option value="Decided on in-house custom build">Decided on in-house custom build</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLostModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                >
                  Confirm Closed Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {isOppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <span>Create Opportunity Deal</span>
              </h2>
              <button onClick={() => setIsOppModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 200-User Enterprise Cloud ERP Rollout"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Account Type</label>
                  <select
                    value={partyType}
                    onChange={(e: any) => setPartyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="CUSTOMER">Existing Customer Master</option>
                    <option value="LEAD">Prospect / Inbound Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Account / Client *</label>
                  {partyType === "CUSTOMER" ? (
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        const c = customers.find((cust) => cust.id === e.target.value);
                        if (c) setPartyName(c.customerName);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="">Select Customer Master...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp Prospect"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Value (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={dealSize}
                    onChange={(e) => setDealSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Initial Stage</label>
                  <select
                    value={initialStage}
                    onChange={(e: any) => setInitialStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Expected Closing Date</label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assigned Sales Rep</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={assignedSalesPerson}
                    onChange={(e) => setAssignedSalesPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Discovery & Qualification Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key pain points, existing ERP system, decision timeframe, technical requirements..."
                  value={oppNotes}
                  onChange={(e) => setOppNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOppModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Create Opportunity
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
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>Add Inbound Lead</span>
              </h2>
              <button onClick={() => setIsLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Lead Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Industries Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="Website / Inbound">Website / Inbound</option>
                  <option value="Trade Show / Conference">Trade Show / Conference</option>
                  <option value="Referral / Partner">Referral / Partner</option>
                  <option value="Outbound Sales">Outbound Sales</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
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
