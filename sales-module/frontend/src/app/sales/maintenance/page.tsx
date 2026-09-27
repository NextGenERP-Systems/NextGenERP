"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  User,
  Building2,
  FileText,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Eye,
  Check,
  X,
  Play,
  Award,
  AlertCircle,
  FileCheck2,
  Activity,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getMaintenanceContracts,
  createMaintenanceContract,
  activateMaintenanceContract,
  cancelMaintenanceContract,
  getMaintenanceVisits,
  createMaintenanceVisit,
  startMaintenanceVisit,
  completeMaintenanceVisit,
  cancelMaintenanceVisit,
  getWarrantyClaims,
  createWarrantyClaim,
  resolveWarrantyClaim,
  closeWarrantyClaim,
  getCustomers,
  getItems,
} from "@/lib/api";
import {
  MaintenanceContract,
  MaintenanceVisit,
  WarrantyClaim,
  Customer,
  CatalogItem,
} from "@/types/sales";

type ActiveTab = "contracts" | "visits" | "claims";

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "contracts";
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // Data states
  const [contracts, setContracts] = useState<MaintenanceContract[]>([]);
  const [visits, setVisits] = useState<MaintenanceVisit[]>([]);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<MaintenanceContract | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isCompleteVisitModalOpen, setIsCompleteVisitModalOpen] = useState(false);
  const [visitToComplete, setVisitToComplete] = useState<MaintenanceVisit | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isResolveClaimModalOpen, setIsResolveClaimModalOpen] = useState(false);
  const [claimToResolve, setClaimToResolve] = useState<WarrantyClaim | null>(null);

  // Contract form state
  const [contractCustomer, setContractCustomer] = useState("");
  const [contractType, setContractType] = useState("AMC");
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [contractEndDate, setContractEndDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]
  );
  const [contractTerms, setContractTerms] = useState("Standard 24x7 hardware and preventative maintenance support.");
  const [contractItems, setContractItems] = useState<
    { itemCode: string; itemName: string; serialNo: string; periodicity: string; noOfVisits: number; rate: number }[]
  >([]);

  // Visit form state
  const [visitCustomer, setVisitCustomer] = useState("");
  const [visitContractId, setVisitContractId] = useState("");
  const [visitType, setVisitType] = useState<"PREVENTIVE_MAINTENANCE" | "BREAKDOWN" | "WARRANTY_CHECK">(
    "PREVENTIVE_MAINTENANCE"
  );
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitServicePerson, setVisitServicePerson] = useState("");
  const [visitItemCode, setVisitItemCode] = useState("");
  const [visitItemName, setVisitItemName] = useState("");
  const [visitSerialNo, setVisitSerialNo] = useState("");
  const [visitWorkDone, setVisitWorkDone] = useState("");

  // Complete visit form state
  const [feedbackInput, setFeedbackInput] = useState("Highly Satisfied");
  const [completionNotesInput, setCompletionNotesInput] = useState("");

  // Claim form state
  const [claimCustomer, setClaimCustomer] = useState("");
  const [claimItemCode, setClaimItemCode] = useState("");
  const [claimItemName, setClaimItemName] = useState("");
  const [claimSerialNo, setClaimSerialNo] = useState("");
  const [claimDescription, setClaimDescription] = useState("");
  const [claimResolutionType, setClaimResolutionType] = useState("REPAIR");

  // Resolve claim form state
  const [resolveTypeInput, setResolveTypeInput] = useState("REPAIR");
  const [resolveNotesInput, setResolveNotesInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, vData, wData, custList, itemList] = await Promise.all([
        getMaintenanceContracts(),
        getMaintenanceVisits(),
        getWarrantyClaims(),
        getCustomers(),
        getItems(),
      ]);
      setContracts(cData || []);
      setVisits(vData || []);
      setClaims(wData || []);
      setCustomers(custList || []);
      setCatalogItems(itemList || []);
    } catch (err) {
      console.error(err);
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

  // Contract actions
  const handleActivateContract = async (id: string) => {
    setActionLoading(true);
    try {
      const updated = await activateMaintenanceContract(id);
      setContracts(contracts.map((c) => (c.id === id ? updated : c)));
      showSuccess(`Contract ${updated.contractNumber} activated successfully!`);
    } catch (err: any) {
      alert(err.message || "Failed to activate contract");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelContract = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this contract?")) return;
    setActionLoading(true);
    try {
      const updated = await cancelMaintenanceContract(id);
      setContracts(contracts.map((c) => (c.id === id ? updated : c)));
      showSuccess(`Contract ${updated.contractNumber} cancelled.`);
    } catch (err: any) {
      alert(err.message || "Failed to cancel contract");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddContractItemRow = () => {
    if (catalogItems.length === 0) return;
    const itm = catalogItems[0];
    setContractItems([
      ...contractItems,
      {
        itemCode: itm.itemCode,
        itemName: itm.itemName,
        serialNo: `SN-${Math.floor(1000 + Math.random() * 9000)}`,
        periodicity: "QUARTERLY",
        noOfVisits: 4,
        rate: 15000,
      },
    ]);
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractCustomer) {
      alert("Please select a Customer");
      return;
    }
    const items =
      contractItems.length > 0
        ? contractItems
        : [
            {
              itemCode: "ERP-SRV-9000",
              itemName: "NextGen Cloud ERP Enterprise Rack Server",
              serialNo: "SRV-2026-901",
              periodicity: "QUARTERLY",
              noOfVisits: 4,
              rate: 45000,
            },
          ];

    try {
      const created = await createMaintenanceContract({
        customerId: contractCustomer,
        contractType,
        startDate: contractStartDate,
        endDate: contractEndDate,
        termsAndConditions: contractTerms,
        items,
      });
      setIsContractModalOpen(false);
      showSuccess(`Maintenance Contract ${created.contractNumber} created!`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create contract");
    }
  };

  // Visit actions
  const handleStartVisit = async (id: string) => {
    setActionLoading(true);
    try {
      const updated = await startMaintenanceVisit(id);
      setVisits(visits.map((v) => (v.id === id ? updated : v)));
      showSuccess(`Visit ${updated.visitNumber} started.`);
    } catch (err: any) {
      alert(err.message || "Failed to start visit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitToComplete) return;
    setActionLoading(true);
    try {
      const updated = await completeMaintenanceVisit(
        visitToComplete.id,
        feedbackInput,
        completionNotesInput || "Maintenance successfully completed. Diagnostic logs verified."
      );
      setVisits(visits.map((v) => (v.id === visitToComplete.id ? updated : v)));
      setIsCompleteVisitModalOpen(false);
      setVisitToComplete(null);
      showSuccess(`Visit ${updated.visitNumber} marked completed!`);
    } catch (err: any) {
      alert(err.message || "Failed to complete visit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelVisit = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this visit?")) return;
    setActionLoading(true);
    try {
      const updated = await cancelMaintenanceVisit(id);
      setVisits(visits.map((v) => (v.id === id ? updated : v)));
      showSuccess(`Visit ${updated.visitNumber} cancelled.`);
    } catch (err: any) {
      alert(err.message || "Failed to cancel visit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitCustomer || !visitServicePerson) {
      alert("Customer and Service Person are required");
      return;
    }
    try {
      const created = await createMaintenanceVisit({
        customerId: visitCustomer,
        maintenanceContractId: visitContractId || undefined,
        maintenanceType: visitType,
        visitDate,
        servicePerson: visitServicePerson,
        items: [
          {
            itemCode: visitItemCode || "ERP-SRV-9000",
            itemName: visitItemName || "Enterprise Rack Server",
            serialNo: visitSerialNo || "SN-8890",
            workDone: visitWorkDone || "Scheduled preventive inspection and diagnostics.",
          },
        ],
      });
      setIsVisitModalOpen(false);
      showSuccess(`Service Visit ${created.visitNumber} scheduled!`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to schedule visit");
    }
  };

  // Claim actions
  const handleResolveClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimToResolve) return;
    setActionLoading(true);
    try {
      const updated = await resolveWarrantyClaim(
        claimToResolve.id,
        resolveTypeInput,
        resolveNotesInput || "Repaired and recalibrated under standard warranty."
      );
      setClaims(claims.map((c) => (c.id === claimToResolve.id ? updated : c)));
      setIsResolveClaimModalOpen(false);
      setClaimToResolve(null);
      showSuccess(`Warranty Claim ${updated.claimNumber} resolved!`);
    } catch (err: any) {
      alert(err.message || "Failed to resolve claim");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseClaim = async (id: string) => {
    setActionLoading(true);
    try {
      const updated = await closeWarrantyClaim(id);
      setClaims(claims.map((c) => (c.id === id ? updated : c)));
      showSuccess(`Warranty Claim ${updated.claimNumber} closed.`);
    } catch (err: any) {
      alert(err.message || "Failed to close claim");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCustomer || !claimItemCode || !claimDescription) {
      alert("Customer, Item Code, and Complaint description are required");
      return;
    }
    try {
      const created = await createWarrantyClaim({
        customerId: claimCustomer,
        itemCode: claimItemCode,
        itemName: claimItemName || claimItemCode,
        serialNo: claimSerialNo,
        complaintDescription: claimDescription,
        resolutionType: claimResolutionType,
      });
      setIsClaimModalOpen(false);
      showSuccess(`Warranty Claim ${created.claimNumber} filed!`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to file claim");
    }
  };

  // Calculate KPIs
  const activeContractsCount = contracts.filter((c) => c.status === "ACTIVE").length;
  const totalContractValue = contracts.reduce((acc, c) => acc + (Number(c.totalAmount) || 0), 0);
  const invoicedContractValue = contracts.reduce((acc, c) => acc + (Number(c.invoicedAmount) || 0), 0);

  const scheduledVisitsCount = visits.filter((v) => v.status === "SCHEDULED").length;
  const inProgressVisitsCount = visits.filter((v) => v.status === "IN_PROGRESS").length;
  const completedVisitsCount = visits.filter((v) => v.status === "COMPLETED").length;

  const openClaimsCount = claims.filter((c) => c.status === "OPEN" || c.status === "IN_INSPECTION").length;
  const resolvedClaimsCount = claims.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Link href="/sales" className="hover:text-blue-600 transition-colors">
              Selling
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Maintenance & AMC</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600" />
            <span>Maintenance, AMC & Warranty Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Annual Maintenance Contracts (AMC), schedule field service engineer visits, and track customer warranty claims.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {activeTab === "contracts" && (
            <button
              onClick={() => {
                if (contractItems.length === 0 && catalogItems.length > 0) {
                  setContractItems([
                    {
                      itemCode: catalogItems[0].itemCode,
                      itemName: catalogItems[0].itemName,
                      serialNo: `SN-${Math.floor(1000 + Math.random() * 9000)}`,
                      periodicity: "QUARTERLY",
                      noOfVisits: 4,
                      rate: 25000,
                    },
                  ]);
                }
                setIsContractModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New AMC Contract</span>
            </button>
          )}

          {activeTab === "visits" && (
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Service Visit</span>
            </button>
          )}

          {activeTab === "claims" && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>File Warranty Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Segmented Tab Bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("contracts");
            setStatusFilter("ALL");
          }}
          className={`pb-3 px-4 font-semibold text-xs transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "contracts"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Annual Maintenance Contracts (AMC)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
            {contracts.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("visits");
            setStatusFilter("ALL");
          }}
          className={`pb-3 px-4 font-semibold text-xs transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "visits"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Service Visits & Reports</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            {visits.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("claims");
            setStatusFilter("ALL");
          }}
          className={`pb-3 px-4 font-semibold text-xs transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "claims"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Warranty Claims</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
            {claims.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MAINTENANCE CONTRACTS (AMC)                                        */}
      {/* ========================================================================= */}
      {activeTab === "contracts" && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Active Contracts
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{activeContractsCount}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Enforced Service SLAs</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Contract Value
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                    {formatCurrency(totalContractValue)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{contracts.length} agreements booked</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Billed / Invoiced Revenue
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-emerald-700">
                    {formatCurrency(invoicedContractValue)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Recognized AMC Income</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <FileCheck2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Draft / Pending
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                    {contracts.filter((c) => c.status === "DRAFT").length}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting Activation</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contracts Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contract number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto">
                {["ALL", "ACTIVE", "DRAFT", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                      statusFilter === st
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Contract #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-center">Items Covered</th>
                    <th className="py-3 px-4 text-right">Contract Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts
                    .filter((c) => {
                      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
                      if (
                        searchTerm &&
                        !c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((contract) => (
                      <tr key={contract.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{contract.contractNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{contract.customerName}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {contract.contractType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                          {contract.items?.length || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(contract.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              contract.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : contract.status === "DRAFT"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {contract.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedContract(contract)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                            >
                              Details
                            </button>
                            {contract.status === "DRAFT" && (
                              <button
                                onClick={() => handleActivateContract(contract.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs"
                              >
                                Activate
                              </button>
                            )}
                            {contract.status === "ACTIVE" && (
                              <button
                                onClick={() => handleCancelContract(contract.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICE VISITS & REPORTS                                           */}
      {/* ========================================================================= */}
      {activeTab === "visits" && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Scheduled Visits
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-blue-600">
                    {scheduledVisitsCount}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium mt-0.5">Upcoming Field Work</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    In Progress
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-amber-600">
                    {inProgressVisitsCount}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium mt-0.5">Technicians on Site</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Completed Visits
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-emerald-700">
                    {completedVisitsCount}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Signed-off by Clients</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Service Logs
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{visits.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Audit history</div>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Wrench className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visits Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search visit number, engineer, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto">
                {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                      statusFilter === st
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Visit #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Service Engineer</th>
                    <th className="py-3 px-4">Feedback</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits
                    .filter((v) => {
                      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
                      if (
                        searchTerm &&
                        !v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !v.servicePerson.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{visit.visitNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div>{visit.customerName}</div>
                          {visit.items?.[0] && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              {visit.items[0].itemName} ({visit.items[0].serialNo || "No S/N"})
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              visit.maintenanceType === "BREAKDOWN"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : visit.maintenanceType === "WARRANTY_CHECK"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {visit.maintenanceType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{formatDate(visit.visitDate)}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-1.5 pt-4">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{visit.servicePerson}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {visit.customerFeedback ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                              <Award className="h-2.5 w-2.5" />
                              <span>{visit.customerFeedback}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              visit.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : visit.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : visit.status === "SCHEDULED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {visit.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {visit.status === "SCHEDULED" && (
                              <button
                                onClick={() => handleStartVisit(visit.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                              >
                                <Play className="h-2.5 w-2.5 fill-white" />
                                <span>Start</span>
                              </button>
                            )}
                            {visit.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => {
                                  setVisitToComplete(visit);
                                  setIsCompleteVisitModalOpen(true);
                                }}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
                                <span>Complete</span>
                              </button>
                            )}
                            {visit.status !== "COMPLETED" && visit.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleCancelVisit(visit.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WARRANTY CLAIMS                                                    */}
      {/* ========================================================================= */}
      {activeTab === "claims" && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Open Claims
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-rose-600">
                    {openClaimsCount}
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium mt-0.5">Awaiting Resolution</div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Resolved Claims
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono text-emerald-700">
                    {resolvedClaimsCount}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Repairs & Replacements Completed</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Inspection Bench
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                    {claims.filter((c) => c.status === "IN_INSPECTION").length}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium mt-0.5">Under Technician Analysis</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Claims
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{claims.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Warranty history</div>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Layers className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Claims Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search claim, item code, serial no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto">
                {["ALL", "OPEN", "IN_INSPECTION", "RESOLVED", "CLOSED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                      statusFilter === st
                        ? "bg-rose-600 text-white"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Item & Serial</th>
                    <th className="py-3 px-4">Complaint Description</th>
                    <th className="py-3 px-4">Reported</th>
                    <th className="py-3 px-4 text-center">Resolution</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims
                    .filter((c) => {
                      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
                      if (
                        searchTerm &&
                        !c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !c.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !(c.serialNo || "").toLowerCase().includes(searchTerm.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{claim.claimNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{claim.customerName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{claim.itemName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {claim.itemCode} • S/N: {claim.serialNo || "N/A"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={claim.complaintDescription}>
                          {claim.complaintDescription}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{formatDate(claim.reportedDate)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {claim.resolutionType || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              claim.status === "RESOLVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : claim.status === "IN_INSPECTION"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : claim.status === "OPEN"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status !== "RESOLVED" && claim.status !== "CLOSED" && (
                              <button
                                onClick={() => {
                                  setClaimToResolve(claim);
                                  setIsResolveClaimModalOpen(true);
                                }}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-2xs"
                              >
                                Resolve
                              </button>
                            )}
                            {claim.status === "RESOLVED" && (
                              <button
                                onClick={() => handleCloseClaim(claim.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px]"
                              >
                                Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* New Maintenance Contract Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Create Annual Maintenance Contract (AMC)</span>
              </h2>
              <button onClick={() => setIsContractModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleContractSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Customer *</label>
                  <select
                    required
                    value={contractCustomer}
                    onChange={(e) => setContractCustomer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="">Select Customer Master...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contract Type</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="AMC">Standard AMC (Preventative + Breakdown)</option>
                    <option value="COMPREHENSIVE_AMC">Comprehensive AMC (Includes Spares)</option>
                    <option value="LABOUR_ONLY">Labour & Service Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date *</label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Covered Equipment Lines</span>
                  <button
                    type="button"
                    onClick={handleAddContractItemRow}
                    className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold flex items-center gap-1 border border-indigo-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Equipment</span>
                  </button>
                </div>

                {contractItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 space-y-0.5">
                      <label className="text-[10px] text-slate-400">Equipment Item</label>
                      <select
                        value={item.itemCode}
                        onChange={(e) => {
                          const itm = catalogItems.find((ci) => ci.itemCode === e.target.value);
                          const updated = [...contractItems];
                          updated[idx].itemCode = e.target.value;
                          if (itm) updated[idx].itemName = itm.itemName;
                          setContractItems(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-medium"
                      >
                        {catalogItems.map((ci) => (
                          <option key={ci.id} value={ci.itemCode}>
                            {ci.itemName} ({ci.itemCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <label className="text-[10px] text-slate-400">Serial Number</label>
                      <input
                        type="text"
                        value={item.serialNo}
                        onChange={(e) => {
                          const updated = [...contractItems];
                          updated[idx].serialNo = e.target.value;
                          setContractItems(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[10px] text-slate-400">Periodicity</label>
                      <select
                        value={item.periodicity}
                        onChange={(e) => {
                          const updated = [...contractItems];
                          updated[idx].periodicity = e.target.value;
                          setContractItems(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-medium"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="HALF_YEARLY">Half Yearly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[10px] text-slate-400">AMC Rate (₹)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => {
                          const updated = [...contractItems];
                          updated[idx].rate = Number(e.target.value) || 0;
                          setContractItems(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-right font-bold"
                      />
                    </div>
                    <div className="col-span-1 text-center pt-3">
                      <button
                        type="button"
                        onClick={() => setContractItems(contractItems.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between font-semibold text-slate-700 text-xs">
                  <span>Total AMC Annual Value:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {formatCurrency(contractItems.reduce((acc, i) => acc + i.rate, 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Terms & SLA Notes</label>
                <textarea
                  rows={2}
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{selectedContract.contractNumber}</h2>
                <div className="text-xs text-slate-500 font-medium">{selectedContract.customerName}</div>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Start Date</span>
                <span className="font-mono font-semibold">{formatDate(selectedContract.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">End Date</span>
                <span className="font-mono font-semibold">{formatDate(selectedContract.endDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Contract Value</span>
                <span className="font-mono font-bold text-indigo-700">{formatCurrency(selectedContract.totalAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="font-bold text-emerald-700">{selectedContract.status}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 text-[11px] block">Equipment Covered</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedContract.items?.map((item, idx) => (
                  <div key={idx} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{item.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.itemCode} • S/N: {item.serialNo || "N/A"} • {item.periodicity} ({item.noOfVisits} visits)
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">{formatCurrency(item.rate)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Terms & SLA: </span>
              {selectedContract.termsAndConditions}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Service Visit Modal */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-emerald-600" />
                <span>Schedule Field Service Visit</span>
              </h2>
              <button onClick={() => setIsVisitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer *</label>
                <select
                  required
                  value={visitCustomer}
                  onChange={(e) => setVisitCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="">Select Customer Master...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e: any) => setVisitType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="PREVENTIVE_MAINTENANCE">Preventive Maintenance (AMC)</option>
                    <option value="BREAKDOWN">Breakdown / Emergency Repair</option>
                    <option value="WARRANTY_CHECK">Warranty Inspection</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Linked Contract (Optional)</label>
                  <select
                    value={visitContractId}
                    onChange={(e) => setVisitContractId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="">None / Standalone Visit</option>
                    {contracts
                      .filter((c) => !visitCustomer || c.customerId === visitCustomer)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.contractNumber} ({c.contractType})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Service Engineer / Tech *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Patel"
                    value={visitServicePerson}
                    onChange={(e) => setVisitServicePerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-semibold text-slate-700 text-[11px] block">Equipment Information</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Equipment Item</label>
                    <select
                      value={visitItemCode}
                      onChange={(e) => {
                        const itm = catalogItems.find((ci) => ci.itemCode === e.target.value);
                        setVisitItemCode(e.target.value);
                        if (itm) setVisitItemName(itm.itemName);
                      }}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium"
                    >
                      <option value="">Select Equipment Item...</option>
                      {catalogItems.map((ci) => (
                        <option key={ci.id} value={ci.itemCode}>
                          {ci.itemName} ({ci.itemCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Serial Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SRV-2026-081"
                      value={visitSerialNo}
                      onChange={(e) => setVisitSerialNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Work / Inspection Plan</label>
                  <input
                    type="text"
                    placeholder="e.g. Quarterly diagnostic tests and power supply calibration"
                    value={visitWorkDone}
                    onChange={(e) => setVisitWorkDone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Visit & Log Feedback Modal */}
      {isCompleteVisitModalOpen && visitToComplete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Complete Visit {visitToComplete.visitNumber}</span>
              </h2>
              <button onClick={() => setIsCompleteVisitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteVisitSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer Feedback & Rating</label>
                <select
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="Highly Satisfied">★★★★★ Highly Satisfied</option>
                  <option value="Satisfied">★★★★☆ Satisfied</option>
                  <option value="Neutral">★★★☆☆ Neutral</option>
                  <option value="Unsatisfied">★★☆☆☆ Unsatisfied</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Service Completion & Diagnostic Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe resolution, replaced components, firmware updates, and client sign-off..."
                  value={completionNotesInput}
                  onChange={(e) => setCompletionNotesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteVisitModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Warranty Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-600" />
                <span>File Customer Warranty Claim</span>
              </h2>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer *</label>
                <select
                  required
                  value={claimCustomer}
                  onChange={(e) => setClaimCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="">Select Customer Master...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Equipment Item *</label>
                  <select
                    required
                    value={claimItemCode}
                    onChange={(e) => {
                      const itm = catalogItems.find((ci) => ci.itemCode === e.target.value);
                      setClaimItemCode(e.target.value);
                      if (itm) setClaimItemName(itm.itemName);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="">Select Item...</option>
                    {catalogItems.map((ci) => (
                      <option key={ci.id} value={ci.itemCode}>
                        {ci.itemName} ({ci.itemCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SCN-4410"
                    value={claimSerialNo}
                    onChange={(e) => setClaimSerialNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Complaint / Defect Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail customer defect symptoms, failure conditions, and operating environment..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Requested Resolution</label>
                <select
                  value={claimResolutionType}
                  onChange={(e) => setClaimResolutionType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="REPAIR">Component Repair</option>
                  <option value="REPLACEMENT">Hardware Replacement</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
                >
                  File Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Warranty Claim Modal */}
      {isResolveClaimModalOpen && claimToResolve && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Resolve Claim {claimToResolve.claimNumber}</span>
              </h2>
              <button onClick={() => setIsResolveClaimModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResolveClaimSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resolution Action</label>
                <select
                  value={resolveTypeInput}
                  onChange={(e) => setResolveTypeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="REPAIR">Repair Performed (Bench Calibration)</option>
                  <option value="REPLACEMENT">Replaced with New Unit</option>
                  <option value="REJECTED">Claim Rejected (User Damage/Out of Scope)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resolution Notes & Technician Findings</label>
                <textarea
                  rows={3}
                  placeholder="Record parts replaced, calibration steps, and final testing results..."
                  value={resolveNotesInput}
                  onChange={(e) => setResolveNotesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveClaimModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Maintenance Hub...</div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
