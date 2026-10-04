"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Calendar,
  Building2,
  Users,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileText,
  ShieldCheck,
} from "lucide-react";
import {
  getLeaveApplications,
  applyLeave,
  approveLeave,
  rejectLeave,
  getEmployees,
  MOCK_LEAVE_TYPES,
} from "@/lib/api";
import { LeaveApplication, Employee, LeaveType } from "@/types/hrm";

interface LeaveAllocationRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  annualQuota: number;
  earnedAllocated: number;
  casualAllocated: number;
  sickAllocated: number;
  leavesConsumed: number;
  remainingBalance: number;
}

interface LeavePeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "UPCOMING" | "CLOSED";
}

interface EnterpriseHoliday {
  id: string;
  holidayName: string;
  holidayDate: string;
  dayOfWeek: string;
  holidayType: "MANDATORY" | "RESTRICTED" | "OPTIONAL";
  description?: string;
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

function LeavesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const validTabs = ["applications", "allocations", "policies", "periods", "holidays"];
  const activeTab = validTabs.includes(urlTab || "") ? (urlTab as string) : "applications";

  const handleTabChange = (tab: string) => {
    const url = tab === "applications" ? "/hrm/leaves" : `/hrm/leaves?tab=${tab}`;
    router.push(url);
  };

  // State (100% Dynamic - Zero static seeds)
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(MOCK_LEAVE_TYPES);
  const [allocations, setAllocations] = useState<LeaveAllocationRecord[]>(() =>
    getStorage("LEAVE_ALLOCATIONS", [])
  );
  const [periods, setPeriods] = useState<LeavePeriod[]>(() =>
    getStorage("LEAVE_PERIODS", [])
  );
  const [holidays, setHolidays] = useState<EnterpriseHoliday[]>(() =>
    getStorage("ENTERPRISE_HOLIDAYS", [])
  );

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  // Form states
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveTypeId: MOCK_LEAVE_TYPES[0].id,
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    totalLeaveDays: 1,
    isHalfDay: false,
    reason: "",
  });

  const [newAlloc, setNewAlloc] = useState({
    empId: "",
    quota: 24,
    pl: 12,
    cl: 6,
    sl: 6,
  });

  const [newTypeForm, setNewTypeForm] = useState({
    code: "",
    name: "",
    maxDays: 15,
    carryForward: true,
    isLwp: false,
  });

  const [newPeriodForm, setNewPeriodForm] = useState({
    name: "FY 2026-2027",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
  });

  const [newHolidayForm, setNewHolidayForm] = useState({
    name: "",
    date: "",
    type: "MANDATORY" as const,
    description: "",
  });

  const loadData = async () => {
    const [leaveData, empData] = await Promise.all([
      getLeaveApplications(),
      getEmployees(),
    ]);
    setLeaves(leaveData || []);
    setEmployees(empData || []);
    if (empData && empData.length > 0) {
      setNewLeave((prev) => ({ ...prev, employeeId: empData[0].id }));
      setNewAlloc((prev) => ({ ...prev, empId: empData[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await applyLeave(newLeave);
    setLeaves((prev) => [created, ...prev]);
    setShowApplyModal(false);
    setNewLeave({
      employeeId: employees[0]?.id || "",
      leaveTypeId: MOCK_LEAVE_TYPES[0].id,
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      totalLeaveDays: 1,
      isHalfDay: false,
      reason: "",
    });
  };

  const handleApprove = async (id: string) => {
    const updated = await approveLeave(id);
    setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const handleReject = async (id: string) => {
    const updated = await rejectLeave(id);
    setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find((e) => e.id === newAlloc.empId);
    if (!matched) return;
    const total = Number(newAlloc.pl) + Number(newAlloc.cl) + Number(newAlloc.sl);
    const alloc: LeaveAllocationRecord = {
      id: `alloc-${Date.now()}`,
      employeeId: matched.id,
      employeeCode: matched.employeeCode,
      employeeName: `${matched.firstName} ${matched.lastName}`,
      department: matched.department?.departmentName || "General",
      annualQuota: total,
      earnedAllocated: Number(newAlloc.pl),
      casualAllocated: Number(newAlloc.cl),
      sickAllocated: Number(newAlloc.sl),
      leavesConsumed: 0,
      remainingBalance: total,
    };
    const updated = [alloc, ...allocations];
    setAllocations(updated);
    setStorage("LEAVE_ALLOCATIONS", updated);
    setShowAllocModal(false);
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: LeaveType = {
      id: `type-${Date.now()}`,
      leaveTypeCode: newTypeForm.code || `LT-${Date.now().toString().slice(-3)}`,
      leaveTypeName: newTypeForm.name,
      maxDaysAllowed: Number(newTypeForm.maxDays) || 10,
      isCarryForward: newTypeForm.carryForward,
      isLwp: newTypeForm.isLwp,
      isEncashable: true,
    };
    const updated = [...leaveTypes, newT];
    setLeaveTypes(updated);
    setShowTypeModal(false);
    setNewTypeForm({ code: "", name: "", maxDays: 15, carryForward: true, isLwp: false });
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const p: LeavePeriod = {
      id: `per-${Date.now()}`,
      periodName: newPeriodForm.name,
      startDate: newPeriodForm.startDate,
      endDate: newPeriodForm.endDate,
      status: "ACTIVE",
    };
    const updated = [p, ...periods];
    setPeriods(updated);
    setStorage("LEAVE_PERIODS", updated);
    setShowPeriodModal(false);
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date(newHolidayForm.date);
    const dayName = isNaN(d.getTime()) ? "Weekday" : d.toLocaleDateString("en-US", { weekday: "long" });
    const h: EnterpriseHoliday = {
      id: `hol-${Date.now()}`,
      holidayName: newHolidayForm.name,
      holidayDate: newHolidayForm.date,
      dayOfWeek: dayName,
      holidayType: newHolidayForm.type,
      description: newHolidayForm.description,
    };
    const updated = [h, ...holidays];
    setHolidays(updated);
    setStorage("ENTERPRISE_HOLIDAYS", updated);
    setShowHolidayModal(false);
    setNewHolidayForm({ name: "", date: "", type: "MANDATORY", description: "" });
  };

  // Filtered applications
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const name = `${l.employee?.firstName} ${l.employee?.lastName} ${l.employee?.employeeCode}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leaves, search, statusFilter]);

  // Dynamic Metrics
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Leaves & Holidays Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 text-white rounded">
              TIME OFF & POLICY
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Enterprise leave approval engine, annual quota balance allocations, statutory policies, and holiday schedules
          </p>
        </div>

        {/* Dynamic Contextual Action */}
        <div className="flex items-center gap-2">
          {activeTab === "applications" && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply for Leave
            </button>
          )}

          {activeTab === "allocations" && (
            <button
              onClick={() => setShowAllocModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Allocate Annual Leaves
            </button>
          )}

          {activeTab === "policies" && (
            <button
              onClick={() => setShowTypeModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Leave Type
            </button>
          )}

          {activeTab === "periods" && (
            <button
              onClick={() => setShowPeriodModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Define Leave Period
            </button>
          )}

          {activeTab === "holidays" && (
            <button
              onClick={() => setShowHolidayModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Enterprise Holiday
            </button>
          )}
        </div>
      </div>

      {/* 2. Dynamic KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{pendingCount}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Awaiting manager action</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Approved Applications</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{approvedCount}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Processed & sanctioned</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Configured Policies</span>
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{leaveTypes.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">PL, CL, Medical & LOP</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Enterprise Holidays</span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{holidays.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Calendar year gazetted</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Staff Balance Mapped</span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{allocations.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Quota balances active</div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-0.5 text-xs font-medium">
        <button
          onClick={() => handleTabChange("applications")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "applications"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Leave Applications
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {leaves.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("allocations")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "allocations"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Leave Allocations & Balances
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {allocations.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("policies")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "policies"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Leave Policies & Types
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {leaveTypes.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("periods")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "periods"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Leave Periods
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {periods.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("holidays")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "holidays"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Enterprise Holiday List
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {holidays.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* TAB A: LEAVE APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by applicant name, code..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-800 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <CalendarDays className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Leave Applications Found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No leave requests match the current filters. Click "Apply for Leave" to submit a new time-off application.
              </p>
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Apply for Leave
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">From Date</th>
                    <th className="py-2.5 px-3">To Date</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {l.employee?.firstName} {l.employee?.lastName}
                        <span className="block text-[10px] font-mono text-zinc-500">{l.employee?.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-800 font-medium">
                        {l.leaveType?.leaveTypeName || "Privilege Leave"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{l.fromDate}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{l.toDate}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{l.totalLeaveDays} Days</td>
                      <td className="py-2.5 px-3 text-zinc-600 max-w-xs truncate">{l.reason}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {l.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(l.id)}
                              className="px-2 py-0.5 bg-zinc-900 hover:bg-black text-white rounded text-[11px] font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(l.id)}
                              className="px-2 py-0.5 border border-zinc-300 text-zinc-700 rounded text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[10px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB B: LEAVE ALLOCATIONS */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Annual Leave Quota Allocation & Entitlements</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{allocations.length} Active Allocations</span>
          </div>

          {allocations.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Leave Quotas Allocated</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Allocate annual paid leave balances (PL, CL, SL) across your enrolled employees.
              </p>
              <button
                onClick={() => setShowAllocModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Allocate Annual Leaves
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Annual Quota</th>
                    <th className="py-2.5 px-3">Earned (PL)</th>
                    <th className="py-2.5 px-3">Casual (CL)</th>
                    <th className="py-2.5 px-3">Sick (SL)</th>
                    <th className="py-2.5 px-3">Availed</th>
                    <th className="py-2.5 px-3 font-bold">Balance Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {a.employeeName}
                        <span className="block text-[10px] font-mono text-zinc-500">{a.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">{a.department}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{a.annualQuota} Days</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{a.earnedAllocated}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{a.casualAllocated}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{a.sickAllocated}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{a.leavesConsumed}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{a.remainingBalance} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB C: LEAVE POLICIES & TYPES */}
      {activeTab === "policies" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-xs text-zinc-900">
              Statutory Leave Policies & Accrual Rules
            </div>
            <span className="text-zinc-500 text-[11px] font-mono font-semibold">
              {leaveTypes.length} Policies Configured
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Policy Code</th>
                <th className="py-2.5 px-3">Leave Type Name</th>
                <th className="py-2.5 px-3">Annual Max Days</th>
                <th className="py-2.5 px-3">Carry Forward</th>
                <th className="py-2.5 px-3">Salary Deductible (LWP)</th>
                <th className="py-2.5 px-3">Encashable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leaveTypes.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/80">
                  <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{t.leaveTypeCode}</td>
                  <td className="py-2.5 px-3 font-medium text-zinc-900">{t.leaveTypeName}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{t.maxDaysAllowed} Days/Yr</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-700">{t.isCarryForward ? "Allowed" : "No"}</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-700">{t.isLwp ? "Yes (Unpaid)" : "No (Paid)"}</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-700">{t.isEncashable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB D: LEAVE PERIODS */}
      {activeTab === "periods" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Leave Calendar & Financial Year Periods</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{periods.length} Periods</span>
          </div>

          {periods.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Clock className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Leave Periods Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Define the annual cycle (e.g. 01 Apr to 31 Mar) during which employee leaves accrue and reset.
              </p>
              <button
                onClick={() => setShowPeriodModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Define Leave Period
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Period Name</th>
                    <th className="py-2.5 px-3">Start Date</th>
                    <th className="py-2.5 px-3">End Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {periods.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{p.periodName}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{p.startDate}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{p.endDate}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {p.status}
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

      {/* TAB E: ENTERPRISE HOLIDAYS */}
      {activeTab === "holidays" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Official Gazetted Enterprise Holidays</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{holidays.length} Holidays Configured</span>
          </div>

          {holidays.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Calendar className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Holidays Registered</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Add mandatory and regional holidays to the corporate leave calendar.
              </p>
              <button
                onClick={() => setShowHolidayModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Add Enterprise Holiday
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Holiday Name</th>
                    <th className="py-2.5 px-3">Day of Week</th>
                    <th className="py-2.5 px-3">Holiday Type</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{h.holidayDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{h.holidayName}</td>
                      <td className="py-2.5 px-3 text-zinc-600">{h.dayOfWeek}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {h.holidayType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500">{h.description || "General Holiday"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: APPLY FOR LEAVE */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Applying Employee</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Leave Policy Type</label>
                <select
                  value={newLeave.leaveTypeId}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                >
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.leaveTypeName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    value={newLeave.fromDate}
                    onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    value={newLeave.toDate}
                    onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={newLeave.totalLeaveDays}
                  onChange={(e) => setNewLeave({ ...newLeave, totalLeaveDays: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Provide reason for time off"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATE LEAVES */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Allocate Annual Leave Quota</h3>
              <button onClick={() => setShowAllocModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAllocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Employee</label>
                <select
                  value={newAlloc.empId}
                  onChange={(e) => setNewAlloc({ ...newAlloc, empId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Earned (PL)</label>
                  <input
                    type="number"
                    value={newAlloc.pl}
                    onChange={(e) => setNewAlloc({ ...newAlloc, pl: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Casual (CL)</label>
                  <input
                    type="number"
                    value={newAlloc.cl}
                    onChange={(e) => setNewAlloc({ ...newAlloc, cl: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Sick (SL)</label>
                  <input
                    type="number"
                    value={newAlloc.sl}
                    onChange={(e) => setNewAlloc({ ...newAlloc, sl: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEAVE TYPE */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Define Leave Type Policy</h3>
              <button onClick={() => setShowTypeModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Code</label>
                <input
                  type="text"
                  placeholder="ML"
                  value={newTypeForm.code}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Leave Type Name</label>
                <input
                  required
                  type="text"
                  placeholder="Maternity / Paternity Leave"
                  value={newTypeForm.name}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Annual Days Allowed</label>
                <input
                  type="number"
                  value={newTypeForm.maxDays}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, maxDays: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PERIOD */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Define Leave Period</h3>
              <button onClick={() => setShowPeriodModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePeriod} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Period Title</label>
                <input
                  required
                  type="text"
                  placeholder="FY 2026-2027"
                  value={newPeriodForm.name}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newPeriodForm.startDate}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={newPeriodForm.endDate}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD HOLIDAY */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add Enterprise Holiday</h3>
              <button onClick={() => setShowHolidayModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateHoliday} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Holiday Name</label>
                <input
                  required
                  type="text"
                  placeholder="Independence Day / Diwali"
                  value={newHolidayForm.name}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Holiday Date</label>
                <input
                  required
                  type="date"
                  value={newHolidayForm.date}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Type</label>
                <select
                  value={newHolidayForm.type}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  <option value="MANDATORY">Mandatory Gazetted</option>
                  <option value="RESTRICTED">Restricted / Optional</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeavesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-400 font-mono">
          Loading Leaves & Holidays Command Center...
        </div>
      }
    >
      <LeavesContent />
    </Suspense>
  );
}
