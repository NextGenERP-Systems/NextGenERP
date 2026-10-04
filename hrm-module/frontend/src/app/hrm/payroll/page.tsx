"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Banknote,
  Play,
  FileText,
  Printer,
  CheckCircle2,
  Building2,
  CreditCard,
  X,
  Plus,
  Search,
  Filter,
  Users,
  Coins,
  ShieldCheck,
  Download,
  AlertCircle,
} from "lucide-react";
import { getSalarySlips, generateBatchPayroll, getEmployees } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SalarySlip, Employee } from "@/types/hrm";

interface SalaryStructure {
  id: string;
  structureCode: string;
  structureName: string;
  basicPercent: number;
  hraPercent: number;
  specialPercent: number;
  pfPercent: number;
  isActive: boolean;
}

interface StructureAssignment {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  structureName: string;
  baseCtc: number;
  effectiveFrom: string;
  status: "ACTIVE" | "PENDING";
}

interface AdditionalSalary {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  salaryComponent: "PERFORMANCE_BONUS" | "SALES_COMMISSION" | "ARREARS" | "TRAVEL_REIMBURSEMENT" | "PENALTY_DEDUCTION";
  amount: number;
  payrollMonth: string;
  remarks: string;
}

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(`NEXTGEN_HRM_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`NEXTGEN_HRM_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
}

function PayrollContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const validTabs = ["entry", "slips", "structures", "assignments", "additional"];
  const activeTab = validTabs.includes(urlTab || "") ? (urlTab as string) : "entry";

  const handleTabChange = (tab: string) => {
    const url = tab === "entry" ? "/hrm/payroll" : `/hrm/payroll?tab=${tab}`;
    router.push(url);
  };

  // State (100% Dynamic - Zero static seeds)
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>(() =>
    getStorage("SALARY_STRUCTURES", [])
  );
  const [assignments, setAssignments] = useState<StructureAssignment[]>(() =>
    getStorage("STRUCTURE_ASSIGNMENTS", [])
  );
  const [additional, setAdditional] = useState<AdditionalSalary[]>(() =>
    getStorage("ADDITIONAL_SALARY", [])
  );

  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [generating, setGenerating] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState("2026-10");

  // Filters
  const [search, setSearch] = useState("");

  // Modals
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);

  // Form states
  const [newStruct, setNewStruct] = useState({
    code: "",
    name: "",
    basic: 50,
    hra: 20,
    special: 30,
    pf: 12,
  });

  const [newAssign, setNewAssign] = useState({
    empId: "",
    structId: "",
    ctc: 1200000,
    date: new Date().toISOString().split("T")[0],
  });

  const [newAdditional, setNewAdditional] = useState({
    empId: "",
    type: "PERFORMANCE_BONUS" as const,
    amount: 25000,
    month: "2026-10",
    remarks: "Performance incentive",
  });

  const loadData = async () => {
    const [slipData, empData] = await Promise.all([
      getSalarySlips(),
      getEmployees(),
    ]);
    setSlips(slipData || []);
    setEmployees(empData || []);
    if (empData && empData.length > 0) {
      setNewAssign((prev) => ({ ...prev, empId: empData[0].id }));
      setNewAdditional((prev) => ({ ...prev, empId: empData[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      await generateBatchPayroll();
      const updated = await getSalarySlips();
      setSlips(updated);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const struct: SalaryStructure = {
      id: `struct-${Date.now()}`,
      structureCode: newStruct.code || `STR-${Date.now().toString().slice(-3)}`,
      structureName: newStruct.name,
      basicPercent: Number(newStruct.basic) || 50,
      hraPercent: Number(newStruct.hra) || 20,
      specialPercent: Number(newStruct.special) || 30,
      pfPercent: Number(newStruct.pf) || 12,
      isActive: true,
    };
    const updated = [...structures, struct];
    setStructures(updated);
    setStorage("SALARY_STRUCTURES", updated);
    setShowStructureModal(false);
    setNewStruct({ code: "", name: "", basic: 50, hra: 20, special: 30, pf: 12 });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find((e) => e.id === newAssign.empId);
    const matchedStruct = structures.find((s) => s.id === newAssign.structId) || structures[0];
    if (!matched) return;
    const a: StructureAssignment = {
      id: `s-assign-${Date.now()}`,
      employeeId: matched.id,
      employeeCode: matched.employeeCode,
      employeeName: `${matched.firstName} ${matched.lastName}`,
      department: matched.department?.departmentName || "General",
      structureName: matchedStruct ? matchedStruct.structureName : "Executive Standard",
      baseCtc: Number(newAssign.ctc) || 1200000,
      effectiveFrom: newAssign.date,
      status: "ACTIVE",
    };
    const updated = [a, ...assignments];
    setAssignments(updated);
    setStorage("STRUCTURE_ASSIGNMENTS", updated);
    setShowAssignModal(false);
  };

  const handleCreateAdditional = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find((e) => e.id === newAdditional.empId);
    if (!matched) return;
    const item: AdditionalSalary = {
      id: `add-sal-${Date.now()}`,
      employeeId: matched.id,
      employeeCode: matched.employeeCode,
      employeeName: `${matched.firstName} ${matched.lastName}`,
      salaryComponent: newAdditional.type,
      amount: Number(newAdditional.amount) || 0,
      payrollMonth: newAdditional.month,
      remarks: newAdditional.remarks,
    };
    const updated = [item, ...additional];
    setAdditional(updated);
    setStorage("ADDITIONAL_SALARY", updated);
    setShowAdditionalModal(false);
  };

  // Calculations
  const totalGross = slips.reduce((acc, s) => acc + (s.grossPay || 0), 0);
  const totalDeductions = slips.reduce((acc, s) => acc + (s.totalDeductions || 0), 0);
  const totalNet = slips.reduce((acc, s) => acc + (s.netPay || 0), 0);

  // Filtered Slips
  const filteredSlips = useMemo(() => {
    return slips.filter((s) => {
      const name = `${s.employee?.firstName} ${s.employee?.lastName} ${s.employee?.employeeCode} ${s.slipNumber}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }, [slips, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Payroll & Compensation Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 text-white rounded">
              COMPENSATION & TAX
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Batch monthly salary processing, statutory PF/PT/TDS deduction schedules, slips generation, and structure matrices
          </p>
        </div>

        {/* Dynamic Contextual Action */}
        <div className="flex items-center gap-2">
          {activeTab === "entry" && (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-1 rounded-lg">
              <input
                type="month"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-zinc-200 rounded font-mono font-semibold text-zinc-800 focus:outline-none"
              >
              </input>
              <button
                onClick={handleGenerateBatch}
                disabled={generating || employees.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1 bg-zinc-900 hover:bg-black text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {generating ? "Processing..." : "Process Batch Payroll"}
              </button>
            </div>
          )}

          {activeTab === "structures" && (
            <button
              onClick={() => setShowStructureModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Salary Structure
            </button>
          )}

          {activeTab === "assignments" && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Structure to Staff
            </button>
          )}

          {activeTab === "additional" && (
            <button
              onClick={() => setShowAdditionalModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Incentive / Salary Adjustment
            </button>
          )}
        </div>
      </div>

      {/* 2. Dynamic KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Net Disbursed</span>
            <Banknote className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{formatCurrency(totalNet)}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Direct bank payout</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Gross Payroll</span>
            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{formatCurrency(totalGross)}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Pre-deductions sum</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Statutory Deductions</span>
            <Coins className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{formatCurrency(totalDeductions)}</div>
          <div className="text-[10px] text-zinc-500 font-mono">PF, PT, and TDS tax</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Salary Slips</span>
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{slips.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Generated vouchers</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Defined Structures</span>
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{structures.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Formula bands active</div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-0.5 text-xs font-medium">
        <button
          onClick={() => handleTabChange("entry")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "entry"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Payroll Processing Entry
        </button>

        <button
          onClick={() => handleTabChange("slips")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "slips"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Salary Slips
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {slips.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("structures")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "structures"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Salary Structures
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {structures.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("assignments")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "assignments"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Structure Assignments
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("additional")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "additional"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Additional Salary & Incentives
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {additional.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* TAB A: PAYROLL PROCESSING ENTRY */}
      {activeTab === "entry" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Run Monthly Compensation Cycle</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Execute batch salary calculations including attendance loss-of-pay deductions, statutory PF and Professional Tax.
                </p>
              </div>
              <div className="text-xs font-mono font-semibold text-zinc-700">
                Target Cycle: {payrollMonth}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-1">
                <span className="text-[11px] text-zinc-500 font-medium">Eligible Active Employees</span>
                <div className="text-lg font-bold font-mono text-zinc-900">
                  {employees.filter((e) => e.status === "ACTIVE").length} Staff
                </div>
              </div>
              <div className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-1">
                <span className="text-[11px] text-zinc-500 font-medium">Generated Vouchers This Run</span>
                <div className="text-lg font-bold font-mono text-zinc-900">{slips.length} Vouchers</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-1">
                <span className="text-[11px] text-zinc-500 font-medium">Net Disbursed Amount</span>
                <div className="text-lg font-bold font-mono text-zinc-900">{formatCurrency(totalNet)}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Requires active employees to be enrolled in the directory.
              </span>
              <button
                onClick={handleGenerateBatch}
                disabled={generating || employees.length === 0}
                className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50"
              >
                {generating ? "Computing Batch..." : "Execute Monthly Payroll Run"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: SALARY SLIPS REGISTER */}
      {activeTab === "slips" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-zinc-200">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search salary slips by slip number, employee..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md font-medium"
              />
            </div>
          </div>

          {filteredSlips.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Salary Slips Generated</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No salary slips exist for the current records. Go to the "Payroll Processing Entry" tab and execute a batch run.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Slip Voucher No</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Gross Pay</th>
                    <th className="py-2.5 px-3">Deductions</th>
                    <th className="py-2.5 px-3">Net Disbursed</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSlips.map((slip) => (
                    <tr
                      key={slip.id}
                      onClick={() => setSelectedSlip(slip)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{slip.slipNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {slip.employee?.firstName} {slip.employee?.lastName}
                        <span className="block text-[10px] font-mono text-zinc-500">{slip.employee?.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{formatCurrency(slip.grossPay)}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">-{formatCurrency(slip.totalDeductions)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{formatCurrency(slip.netPay)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {slip.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlip(slip);
                          }}
                          className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-semibold"
                        >
                          View Pay Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB C: SALARY STRUCTURES */}
      {activeTab === "structures" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Compensation Component Formulas & Structures</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{structures.length} Defined Structures</span>
          </div>

          {structures.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Salary Structures Defined</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Create structured earnings formulas (Basic, HRA, Special Allowance) and deduction rules.
              </p>
              <button
                onClick={() => setShowStructureModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Create Salary Structure
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Structure Code</th>
                    <th className="py-2.5 px-3">Structure Title</th>
                    <th className="py-2.5 px-3">Basic Pay %</th>
                    <th className="py-2.5 px-3">HRA %</th>
                    <th className="py-2.5 px-3">Special Allowance %</th>
                    <th className="py-2.5 px-3">PF Contribution %</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {structures.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{s.structureCode}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">{s.structureName}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{s.basicPercent}%</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{s.hraPercent}%</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{s.specialPercent}%</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{s.pfPercent}%</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB D: STRUCTURE ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Employee Salary Structure Assignments</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{assignments.length} Mapped Staff</span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Structure Assignments Logged</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Assign salary structure formulas and annual CTC to employees.
              </p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Assign Structure to Staff
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Assigned Structure</th>
                    <th className="py-2.5 px-3">Annual CTC</th>
                    <th className="py-2.5 px-3">Effective Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {a.employeeName}
                        <span className="block text-[10px] font-mono text-zinc-500">{a.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">{a.department}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-800">{a.structureName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{formatCurrency(a.baseCtc)}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{a.effectiveFrom}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB E: ADDITIONAL SALARY & INCENTIVES */}
      {activeTab === "additional" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Bonuses, Commissions & Special Adjustments</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{additional.length} Items</span>
          </div>

          {additional.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Coins className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Additional Salary Records</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Log one-time bonuses, sales commissions, arrears, or deductions to be factored into payroll.
              </p>
              <button
                onClick={() => setShowAdditionalModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Add Incentive / Salary Adjustment
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Salary Component</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Target Month</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {additional.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {item.employeeName}
                        <span className="block text-[10px] font-mono text-zinc-500">{item.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-white">
                          {item.salaryComponent}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{formatCurrency(item.amount)}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{item.payrollMonth}</td>
                      <td className="py-2.5 px-3 text-zinc-600">{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DRAWER: PAY SLIP INSPECTOR */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Enterprise Salary Voucher</h2>
                <p className="text-[11px] text-zinc-500 font-mono">{selectedSlip.slipNumber}</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded border border-zinc-200">
                <div>
                  <span className="text-zinc-500 font-medium">Employee Name</span>
                  <p className="font-bold text-zinc-900 mt-0.5">
                    {selectedSlip.employee?.firstName} {selectedSlip.employee?.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Employee Code</span>
                  <p className="font-mono font-bold text-zinc-800 mt-0.5">{selectedSlip.employee?.employeeCode}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Pay Period</span>
                  <p className="font-mono text-zinc-700 mt-0.5">{selectedSlip.startDate} to {selectedSlip.endDate}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Payment Status</span>
                  <p className="font-mono font-bold text-zinc-900 mt-0.5">{selectedSlip.status}</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                    Earnings Breakup
                  </div>
                  <div className="space-y-1.5 bg-zinc-50 p-3 rounded border border-zinc-200">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Basic Pay</span>
                      <span className="font-mono font-semibold">{formatCurrency(selectedSlip.grossPay * 0.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">House Rent (HRA)</span>
                      <span className="font-mono font-semibold">{formatCurrency(selectedSlip.grossPay * 0.2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Special Allowance</span>
                      <span className="font-mono font-semibold">{formatCurrency(selectedSlip.grossPay * 0.3)}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-900">
                      <span>Total Gross</span>
                      <span className="font-mono">{formatCurrency(selectedSlip.grossPay)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                    Statutory Deductions
                  </div>
                  <div className="space-y-1.5 bg-zinc-50 p-3 rounded border border-zinc-200">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Provident Fund (PF)</span>
                      <span className="font-mono font-semibold">-{formatCurrency(selectedSlip.totalDeductions * 0.6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Professional Tax (PT)</span>
                      <span className="font-mono font-semibold">-₹200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">TDS / Income Tax</span>
                      <span className="font-mono font-semibold">-{formatCurrency(Math.max(0, selectedSlip.totalDeductions * 0.4 - 200))}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-900">
                      <span>Total Deductions</span>
                      <span className="font-mono">-{formatCurrency(selectedSlip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Highlight */}
              <div className="p-4 bg-zinc-900 text-white rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400">Net Take-Home Pay</span>
                  <div className="text-xl font-bold font-mono">{formatCurrency(selectedSlip.netPay)}</div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white text-zinc-900 rounded text-xs font-semibold hover:bg-zinc-100 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Salary Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SALARY STRUCTURE */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Create Salary Structure</h3>
              <button onClick={() => setShowStructureModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Structure Code</label>
                <input
                  type="text"
                  placeholder="STR-ENG"
                  value={newStruct.code}
                  onChange={(e) => setNewStruct({ ...newStruct, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Structure Title</label>
                <input
                  required
                  type="text"
                  placeholder="Senior Engineering Band"
                  value={newStruct.name}
                  onChange={(e) => setNewStruct({ ...newStruct, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Basic Salary %</label>
                  <input
                    type="number"
                    value={newStruct.basic}
                    onChange={(e) => setNewStruct({ ...newStruct, basic: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">HRA %</label>
                  <input
                    type="number"
                    value={newStruct.hra}
                    onChange={(e) => setNewStruct({ ...newStruct, hra: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Special Allowance %</label>
                  <input
                    type="number"
                    value={newStruct.special}
                    onChange={(e) => setNewStruct({ ...newStruct, special: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">PF Contribution %</label>
                  <input
                    type="number"
                    value={newStruct.pf}
                    onChange={(e) => setNewStruct({ ...newStruct, pf: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN STRUCTURE */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Assign Salary Structure</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Employee</label>
                <select
                  value={newAssign.empId}
                  onChange={(e) => setNewAssign({ ...newAssign, empId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Salary Structure</label>
                <select
                  value={newAssign.structId}
                  onChange={(e) => setNewAssign({ ...newAssign, structId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>{s.structureName}</option>
                  ))}
                  {structures.length === 0 && <option value="">Standard Base Formula</option>}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Annual CTC (₹)</label>
                <input
                  type="number"
                  value={newAssign.ctc}
                  onChange={(e) => setNewAssign({ ...newAssign, ctc: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Effective Date</label>
                <input
                  type="date"
                  value={newAssign.date}
                  onChange={(e) => setNewAssign({ ...newAssign, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADDITIONAL SALARY */}
      {showAdditionalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add Special Allowance / Incentive</h3>
              <button onClick={() => setShowAdditionalModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAdditional} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Employee</label>
                <select
                  value={newAdditional.empId}
                  onChange={(e) => setNewAdditional({ ...newAdditional, empId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Component Type</label>
                <select
                  value={newAdditional.type}
                  onChange={(e) => setNewAdditional({ ...newAdditional, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  <option value="PERFORMANCE_BONUS">Performance Bonus</option>
                  <option value="SALES_COMMISSION">Sales Commission</option>
                  <option value="ARREARS">Salary Arrears</option>
                  <option value="TRAVEL_REIMBURSEMENT">Travel Reimbursement</option>
                  <option value="PENALTY_DEDUCTION">Penalty / Deduction</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={newAdditional.amount}
                  onChange={(e) => setNewAdditional({ ...newAdditional, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Reason / justification"
                  value={newAdditional.remarks}
                  onChange={(e) => setNewAdditional({ ...newAdditional, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAdditionalModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Add to Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayrollPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-400 font-mono">
          Loading Payroll Command Center...
        </div>
      }
    >
      <PayrollContent />
    </Suspense>
  );
}
