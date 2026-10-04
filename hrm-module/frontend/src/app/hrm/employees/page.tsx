"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building2,
  X,
  CreditCard,
  Trash2,
  Briefcase,
  Award,
  MapPin,
  ShieldCheck,
  ArrowRightLeft,
  UserMinus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  Plus,
  Download,
  LayoutGrid,
  ListFilter,
  CheckSquare,
  Square,
  Laptop,
  Check,
} from "lucide-react";
import {
  getEmployees,
  getDepartments,
  getDesignations,
  createEmployee,
  deleteEmployee,
  MOCK_DEPARTMENTS,
  MOCK_DESIGNATIONS,
} from "@/lib/api";
import { Employee, Department, Designation, Branch } from "@/types/hrm";

// -----------------------------------------------------------------------------
// DYNAMIC DATA TYPES
// -----------------------------------------------------------------------------

interface OnboardingCandidate {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  targetJoinDate: string;
  hrOwner: string;
  tasks: {
    kycDocuments: boolean;
    itHardware: boolean;
    emailAccess: boolean;
    induction: boolean;
    probationTarget: boolean;
  };
  status: "IN_PROGRESS" | "READY_TO_JOIN" | "CONFIRMED";
}

interface BranchLocation {
  id: string;
  branchCode: string;
  branchName: string;
  city: string;
  address: string;
  branchHead: string;
  headcount: number;
  capacity: number;
  timezone: string;
}

interface EmployeeGrade {
  id: string;
  gradeCode: string;
  gradeName: string;
  hierarchyLevel: string;
  salaryBand: string;
  noticePeriodDays: number;
  leaveEntitlementDays: number;
  insuranceCover: string;
  headcount: number;
}

interface SeparationRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  lastWorkingDay: string;
  reason: string;
  noticeDaysRemaining: number;
  itClearance: boolean;
  financeClearance: boolean;
  projectHandover: boolean;
  hrExitInterview: boolean;
  fnfStatus: "PENDING" | "CALCULATED" | "DISBURSED";
  relievingLetterIssued: boolean;
  status: "NOTICE_PERIOD" | "CLEARANCE_STAGE" | "RELIEVED";
}

interface PromotionRecord {
  id: string;
  effectiveDate: string;
  employeeCode: string;
  employeeName: string;
  movementType: "PROMOTION" | "TRANSFER" | "REDESIGNATION";
  prevDesignation: string;
  newDesignation: string;
  prevDepartment: string;
  newDepartment: string;
  salaryHikePercent: number;
  approver: string;
}

// Storage helpers
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

// -----------------------------------------------------------------------------
// WORKSPACE COMPONENT
// -----------------------------------------------------------------------------

function Employee360Content() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const urlTab = searchParams.get("tab");
  const validTabs = [
    "directory",
    "onboarding",
    "designations",
    "departments",
    "branch",
    "grade",
    "promotions",
    "separation",
  ];

  const activeTab = validTabs.includes(urlTab || "") ? (urlTab as string) : "directory";

  const handleTabChange = (tab: string) => {
    const url = tab === "directory" ? "/hrm/employees" : `/hrm/employees?tab=${tab}`;
    router.push(url);
  };

  // State (All empty by default - NO static seeds)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [grades, setGrades] = useState<EmployeeGrade[]>([]);
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [separations, setSeparations] = useState<SeparationRecord[]>([]);
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Modals & Drawers
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddDesgModal, setShowAddDesgModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showSeparationModal, setShowSeparationModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // Form State
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    cellNumber: "",
    departmentId: "",
    designationId: "",
    panNumber: "",
    bankName: "HDFC Bank Ltd",
    bankAccountNumber: "",
    ifscCode: "HDFC0000123",
  });

  const [newDeptForm, setNewDeptForm] = useState({ code: "", name: "" });
  const [newDesgForm, setNewDesgForm] = useState({ code: "", title: "", description: "" });
  const [newBranchForm, setNewBranchForm] = useState({ code: "", name: "", city: "", address: "", head: "", capacity: 30 });
  const [newGradeForm, setNewGradeForm] = useState({ code: "", name: "", level: "Tier 1", salaryBand: "", noticeDays: 30, leaves: 20 });
  const [newCandidateForm, setNewCandidateForm] = useState({ name: "", email: "", phone: "", dept: "", desg: "", date: "", hrOwner: "HR Desk" });
  const [newSeparationForm, setNewSeparationForm] = useState({ empId: "", reason: "Career Growth", lastDate: "", noticeDays: 30 });
  const [newPromotionForm, setNewPromotionForm] = useState({ empId: "", newDesgId: "", newDeptId: "", hike: 15, approver: "Management Board" });

  // Initialize and load real data
  const loadData = async () => {
    // Clean up any legacy dummy mock keys from previous sessions
    if (typeof window !== "undefined") {
      const storedOnb = localStorage.getItem("NEXTGEN_HRM_ONBOARDING");
      if (storedOnb && (storedOnb.includes("Aditya Verma") || storedOnb.includes("Rhea Sen"))) {
        localStorage.removeItem("NEXTGEN_HRM_ONBOARDING");
      }
      const storedSep = localStorage.getItem("NEXTGEN_HRM_SEPARATIONS");
      if (storedSep && (storedSep.includes("Kavita Singhania") || storedSep.includes("Rohan Deshmukh"))) {
        localStorage.removeItem("NEXTGEN_HRM_SEPARATIONS");
      }
      const storedProm = localStorage.getItem("NEXTGEN_HRM_PROMOTIONS");
      if (storedProm && (storedProm.includes("Hitanshu Panchal") || storedProm.includes("Ananya Iyer"))) {
        localStorage.removeItem("NEXTGEN_HRM_PROMOTIONS");
      }
      const storedBr = localStorage.getItem("NEXTGEN_HRM_BRANCHES");
      if (storedBr && storedBr.includes("BR-MUM-HQ")) {
        localStorage.removeItem("NEXTGEN_HRM_BRANCHES");
      }
      const storedGr = localStorage.getItem("NEXTGEN_HRM_GRADES");
      if (storedGr && storedGr.includes("GR-L6")) {
        localStorage.removeItem("NEXTGEN_HRM_GRADES");
      }
    }

    const [empData, deptData, desgData] = await Promise.all([
      getEmployees(),
      getDepartments(),
      getDesignations(),
    ]);

    setEmployees(empData || []);
    setDepartments(deptData || []);
    setDesignations(desgData || []);

    if (deptData && deptData.length > 0) {
      setNewEmp((prev) => ({ ...prev, departmentId: prev.departmentId || deptData[0].id }));
      setNewCandidateForm((prev) => ({ ...prev, dept: prev.dept || deptData[0].departmentName }));
      setNewPromotionForm((prev) => ({ ...prev, newDeptId: prev.newDeptId || deptData[0].id }));
    }
    if (desgData && desgData.length > 0) {
      setNewEmp((prev) => ({ ...prev, designationId: prev.designationId || desgData[0].id }));
      setNewCandidateForm((prev) => ({ ...prev, desg: prev.desg || desgData[0].designationName }));
      setNewPromotionForm((prev) => ({ ...prev, newDesgId: prev.newDesgId || desgData[0].id }));
    }

    // User-persisted dynamic collections
    setCandidates(getStorage<OnboardingCandidate[]>("ONBOARDING", []));
    setSeparations(getStorage<SeparationRecord[]>("SEPARATIONS", []));
    setPromotions(getStorage<PromotionRecord[]>("PROMOTIONS", []));
    setBranches(getStorage<BranchLocation[]>("BRANCHES", []));
    setGrades(getStorage<EmployeeGrade[]>("GRADES", []));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEmployee({
      ...newEmp,
      departmentId: newEmp.departmentId || (departments[0]?.id ?? ""),
      designationId: newEmp.designationId || (designations[0]?.id ?? ""),
    });
    const updated = await getEmployees();
    setEmployees(updated);
    setShowAddEmpModal(false);
    setNewEmp({
      firstName: "",
      lastName: "",
      workEmail: "",
      cellNumber: "",
      departmentId: departments[0]?.id ?? "",
      designationId: designations[0]?.id ?? "",
      panNumber: "",
      bankName: "HDFC Bank Ltd",
      bankAccountNumber: "",
      ifscCode: "HDFC0000123",
    });
  };

  const handleDeleteEmployee = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure you want to delete this employee record?")) {
      await deleteEmployee(id);
      const updated = await getEmployees();
      setEmployees(updated);
      if (selectedEmp?.id === id) setSelectedEmp(null);
    }
  };

  const handleToggleOnboardingTask = (candidateId: string, taskKey: keyof OnboardingCandidate["tasks"]) => {
    const updated = candidates.map((cand) => {
      if (cand.id !== candidateId) return cand;
      const tasks = { ...cand.tasks, [taskKey]: !cand.tasks[taskKey] };
      const allDone = Object.values(tasks).every(Boolean);
      return {
        ...cand,
        tasks,
        status: allDone ? ("READY_TO_JOIN" as const) : ("IN_PROGRESS" as const),
      };
    });
    setCandidates(updated);
    setStorage("ONBOARDING", updated);
  };

  const handleConvertCandidateToEmployee = async (cand: OnboardingCandidate) => {
    const parts = cand.candidateName.split(" ");
    const fName = parts[0] || "Candidate";
    const lName = parts.slice(1).join(" ") || "Employee";

    const matchedDept = departments.find((d) => d.departmentName === cand.department) || departments[0];
    const matchedDesg = designations.find((d) => d.designationName === cand.designation) || designations[0];

    await createEmployee({
      firstName: fName,
      lastName: lName,
      workEmail: cand.email,
      cellNumber: cand.phone,
      departmentId: matchedDept ? matchedDept.id : undefined,
      designationId: matchedDesg ? matchedDesg.id : undefined,
      status: "ACTIVE",
    });

    const updatedCandidates = candidates.filter((c) => c.id !== cand.id);
    setCandidates(updatedCandidates);
    setStorage("ONBOARDING", updatedCandidates);
    const updatedEmps = await getEmployees();
    setEmployees(updatedEmps);
    alert(`Candidate ${cand.candidateName} successfully onboarded into Employee 360 Master!`);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      departmentCode: newDeptForm.code || `DEPT-${Date.now().toString().slice(-4)}`,
      departmentName: newDeptForm.name,
      isActive: true,
    };
    const updated = [...departments, newDept];
    setDepartments(updated);
    setShowAddDeptModal(false);
    setNewDeptForm({ code: "", name: "" });
  };

  const handleCreateDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDesg: Designation = {
      id: `desg-${Date.now()}`,
      designationCode: newDesgForm.code || `DESG-${Date.now().toString().slice(-4)}`,
      designationName: newDesgForm.title,
      description: newDesgForm.description,
      isActive: true,
    };
    const updated = [...designations, newDesg];
    setDesignations(updated);
    setShowAddDesgModal(false);
    setNewDesgForm({ code: "", title: "", description: "" });
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBr: BranchLocation = {
      id: `br-${Date.now()}`,
      branchCode: newBranchForm.code || `BR-${Date.now().toString().slice(-3)}`,
      branchName: newBranchForm.name,
      city: newBranchForm.city,
      address: newBranchForm.address,
      branchHead: newBranchForm.head || "Branch Head",
      headcount: 0,
      capacity: Number(newBranchForm.capacity) || 30,
      timezone: "IST (UTC+5:30)",
    };
    const updated = [...branches, newBr];
    setBranches(updated);
    setStorage("BRANCHES", updated);
    setShowAddBranchModal(false);
    setNewBranchForm({ code: "", name: "", city: "", address: "", head: "", capacity: 30 });
  };

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const newGr: EmployeeGrade = {
      id: `gr-${Date.now()}`,
      gradeCode: newGradeForm.code || `GR-L${grades.length + 1}`,
      gradeName: newGradeForm.name,
      hierarchyLevel: newGradeForm.level,
      salaryBand: newGradeForm.salaryBand || "Standard Compensation Band",
      noticePeriodDays: Number(newGradeForm.noticeDays) || 30,
      leaveEntitlementDays: Number(newGradeForm.leaves) || 20,
      insuranceCover: "Enterprise Standard Cover",
      headcount: 0,
    };
    const updated = [...grades, newGr];
    setGrades(updated);
    setStorage("GRADES", updated);
    setShowAddGradeModal(false);
    setNewGradeForm({ code: "", name: "", level: "Tier 1", salaryBand: "", noticeDays: 30, leaves: 20 });
  };

  const handleCreateOnboardingCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCand: OnboardingCandidate = {
      id: `onb-${Date.now()}`,
      candidateName: newCandidateForm.name,
      email: newCandidateForm.email,
      phone: newCandidateForm.phone || "",
      department: newCandidateForm.dept || (departments[0]?.departmentName ?? "General"),
      designation: newCandidateForm.desg || (designations[0]?.designationName ?? "Staff"),
      targetJoinDate: newCandidateForm.date || new Date().toISOString().split("T")[0],
      hrOwner: newCandidateForm.hrOwner || "HR Desk",
      tasks: {
        kycDocuments: false,
        itHardware: false,
        emailAccess: false,
        induction: false,
        probationTarget: false,
      },
      status: "IN_PROGRESS",
    };
    const updated = [newCand, ...candidates];
    setCandidates(updated);
    setStorage("ONBOARDING", updated);
    setShowOnboardModal(false);
    setNewCandidateForm({
      name: "",
      email: "",
      phone: "",
      dept: departments[0]?.departmentName ?? "",
      desg: designations[0]?.designationName ?? "",
      date: "",
      hrOwner: "HR Desk",
    });
  };

  const handleToggleClearance = (sepId: string, field: "itClearance" | "financeClearance" | "projectHandover" | "hrExitInterview") => {
    const updated = separations.map((s) => {
      if (s.id !== sepId) return s;
      const nextVal = !s[field];
      const nextObj = { ...s, [field]: nextVal };
      const allDone = nextObj.itClearance && nextObj.financeClearance && nextObj.projectHandover && nextObj.hrExitInterview;
      return {
        ...nextObj,
        status: allDone ? ("CLEARANCE_STAGE" as const) : ("NOTICE_PERIOD" as const),
      };
    });
    setSeparations(updated);
    setStorage("SEPARATIONS", updated);
  };

  const handleDisburseFnF = (sepId: string) => {
    const updated = separations.map((s) => {
      if (s.id !== sepId) return s;
      return {
        ...s,
        fnfStatus: "DISBURSED" as const,
        relievingLetterIssued: true,
        status: "RELIEVED" as const,
      };
    });
    setSeparations(updated);
    setStorage("SEPARATIONS", updated);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch = `${emp.firstName} ${emp.lastName} ${emp.employeeCode} ${emp.workEmail}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchDept = selectedDept === "ALL" || emp.department?.id === selectedDept;
      const matchStatus = selectedStatus === "ALL" || emp.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, selectedDept, selectedStatus]);

  // Dynamic Metrics derived 100% from state
  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;
  const inProgressOnboarding = candidates.filter((c) => c.status !== "CONFIRMED").length;
  const pendingSeparations = separations.filter((s) => s.status !== "RELIEVED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ------------------------------------------------------------------- */}
      {/* 1. INDUSTRIAL HEADER BAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Employee 360 & Lifecycle Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 text-white rounded">
              ENTERPRISE MASTER
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Centralized organizational directory, workforce hierarchy, onboarding pipeline, and lifecycle governance
          </p>
        </div>

        {/* Dynamic Contextual Action Button */}
        <div className="flex items-center gap-2">
          {activeTab === "directory" && (
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Onboard Employee
            </button>
          )}

          {activeTab === "onboarding" && (
            <button
              onClick={() => setShowOnboardModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Initiate Candidate Onboarding
            </button>
          )}

          {activeTab === "departments" && (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Department
            </button>
          )}

          {activeTab === "designations" && (
            <button
              onClick={() => setShowAddDesgModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Designation
            </button>
          )}

          {activeTab === "branch" && (
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Office Location
            </button>
          )}

          {activeTab === "grade" && (
            <button
              onClick={() => setShowAddGradeModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Grade Level
            </button>
          )}

          {activeTab === "promotions" && (
            <button
              onClick={() => setShowPromotionModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Record Mobility / Promotion
            </button>
          )}

          {activeTab === "separation" && (
            <button
              onClick={() => setShowSeparationModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <UserMinus className="w-3.5 h-3.5" />
              Initiate Separation
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. DYNAMIC MONOCHROME KPI SUMMARY STRIP */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Total Workforce</span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{employees.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Headcount enrolled</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Active Headcount</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{activeCount}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Operational & active</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Onboarding Pipeline</span>
            <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{inProgressOnboarding}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Pending joining & KYC</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Department Units</span>
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{departments.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Active cost centers</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Notice & Clearance</span>
            <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{pendingSeparations}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Exit & FnF pipeline</div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MONOCHROME TAB NAVIGATION BAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-0.5 text-xs font-medium">
        <button
          onClick={() => handleTabChange("directory")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "directory"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Directory (360)
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("onboarding")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "onboarding"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Onboarding
          {inProgressOnboarding > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-zinc-900 text-white text-[10px] font-mono rounded">
              {inProgressOnboarding}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("departments")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "departments"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Departments
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("designations")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "designations"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Designations
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {designations.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("branch")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "branch"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Branches
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {branches.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("grade")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "grade"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Employee Grades
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {grades.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("promotions")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "promotions"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Mobility & Promotions
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {promotions.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("separation")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "separation"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <UserMinus className="w-3.5 h-3.5" />
          Separation & Exit
          {pendingSeparations > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-zinc-200 text-zinc-800 text-[10px] font-mono rounded font-bold">
              {pendingSeparations}
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. TAB VIEWS CONTENT */}
      {/* ------------------------------------------------------------------- */}

      {/* =================================================================== */}
      {/* TAB A: DIRECTORY (360) */}
      {/* =================================================================== */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code, name, designation, email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 font-medium"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-800 focus:outline-none font-medium"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-800 focus:outline-none font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PROBATION">Probation</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="LEFT">Left / Relieved</option>
              </select>
            </div>

            <div className="flex items-center gap-1 border-l border-zinc-200 pl-3 self-end sm:self-center">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded text-xs ${
                  viewMode === "GRID" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded text-xs ${
                  viewMode === "TABLE" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="Industrial Table"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Directory Content */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No matching employees found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No active records match the selected department or query criteria.
              </p>
              <button
                onClick={() => setShowAddEmpModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                Onboard New Employee
              </button>
            </div>
          ) : viewMode === "GRID" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg p-4 cursor-pointer space-y-3 transition-colors group relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {emp.firstName ? emp.firstName[0] : "E"}
                        {emp.lastName ? emp.lastName[0] : ""}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-zinc-900 group-hover:text-black">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">{emp.employeeCode}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {emp.status}
                      </span>
                      <button
                        onClick={(e) => handleDeleteEmployee(emp.id, e)}
                        title="Delete Profile"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="font-medium text-zinc-800">{emp.designation?.designationName}</div>
                    <div className="text-[11px] text-zinc-500">{emp.department?.departmentName}</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      {emp.workEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {emp.cellNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee Code</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Joining Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmp(emp)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{emp.employeeCode}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {emp.firstName} {emp.lastName}
                        <div className="text-[11px] text-zinc-500 font-normal">{emp.workEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">{emp.department?.departmentName}</td>
                      <td className="py-2.5 px-3 text-zinc-700">{emp.designation?.designationName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{emp.dateOfJoining}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => handleDeleteEmployee(emp.id, e)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* =================================================================== */}
      {/* TAB B: ONBOARDING PIPELINE */}
      {/* =================================================================== */}
      {activeTab === "onboarding" && (
        <div className="space-y-5">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-xs text-zinc-900">New Hire Onboarding & Induction Lifecycle</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Track compliance checklists across Identity KYC, Workstation Provisioning, Enterprise ERP Access, and Probation targets.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-600 font-semibold">
                {candidates.length} Candidate(s) in Onboarding
              </span>
            </div>
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <UserPlus className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Candidates in Onboarding Pipeline</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Track new hires, document collection, hardware allocation, and induction checklists by initiating an onboarding workflow.
              </p>
              <button
                onClick={() => setShowOnboardModal(true)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs rounded-md font-semibold"
              >
                + Initiate Candidate Onboarding
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => {
                const completedTasksCount = Object.values(cand.tasks).filter(Boolean).length;
                const percent = Math.round((completedTasksCount / 5) * 100);

                return (
                  <div key={cand.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-xs text-zinc-900 flex items-center gap-2">
                          {cand.candidateName}
                          {cand.status === "READY_TO_JOIN" && (
                            <span className="px-1.5 py-0.2 bg-zinc-900 text-white text-[9px] font-mono rounded">
                              READY FOR ENROLLMENT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">{cand.designation}</div>
                        <div className="text-[10px] text-zinc-400">{cand.department}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-zinc-900">{percent}%</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Target: {cand.targetJoinDate}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-900 h-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Checklist */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 text-zinc-600">
                        <input
                          type="checkbox"
                          checked={cand.tasks.kycDocuments}
                          onChange={() => handleToggleOnboardingTask(cand.id, "kycDocuments")}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>KYC Documentation & Academic Background Verification</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 text-zinc-600">
                        <input
                          type="checkbox"
                          checked={cand.tasks.itHardware}
                          onChange={() => handleToggleOnboardingTask(cand.id, "itHardware")}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>IT Workstation & Laptop Provisioning</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 text-zinc-600">
                        <input
                          type="checkbox"
                          checked={cand.tasks.emailAccess}
                          onChange={() => handleToggleOnboardingTask(cand.id, "emailAccess")}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>Enterprise Work Email & ERP Role Permissions</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 text-zinc-600">
                        <input
                          type="checkbox"
                          checked={cand.tasks.induction}
                          onChange={() => handleToggleOnboardingTask(cand.id, "induction")}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>HR Orientation & Company Policy Induction</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 text-zinc-600">
                        <input
                          type="checkbox"
                          checked={cand.tasks.probationTarget}
                          onChange={() => handleToggleOnboardingTask(cand.id, "probationTarget")}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>90-Day Probation Goal Setting & Manager Alignment</span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-mono">HR POC: {cand.hrOwner}</span>
                      <button
                        onClick={() => handleConvertCandidateToEmployee(cand)}
                        className="px-3 py-1 bg-zinc-900 hover:bg-black text-white rounded text-xs font-semibold"
                      >
                        Convert to Active Employee
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB C: DEPARTMENTS */}
      {/* =================================================================== */}
      {activeTab === "departments" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-xs text-zinc-900">
              Department Master & Organizational Units
            </div>
            <span className="text-zinc-500 text-[11px] font-mono font-semibold">
              {departments.length} Units Active
            </span>
          </div>
          {departments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Departments Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Create organizational units and cost centers to categorize your workforce.
              </p>
              <button
                onClick={() => setShowAddDeptModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Add Department
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Dept Code</th>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3">Enrolled Headcount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {departments.map((dept) => {
                  const count = employees.filter((e) => e.department?.id === dept.id).length;
                  return (
                    <tr key={dept.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{dept.departmentCode}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">{dept.departmentName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{count} Employees</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB D: DESIGNATIONS */}
      {/* =================================================================== */}
      {activeTab === "designations" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-xs text-zinc-900">
              Designation Master & Role Hierarchy
            </div>
            <span className="text-zinc-500 text-[11px] font-mono font-semibold">
              {designations.length} Defined Roles
            </span>
          </div>
          {designations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Award className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Designations Defined</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Define job titles and role specifications for enterprise workforce hierarchy.
              </p>
              <button
                onClick={() => setShowAddDesgModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Add Designation
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Role Code</th>
                  <th className="py-2.5 px-3">Designation Title</th>
                  <th className="py-2.5 px-3">Role Scope / Description</th>
                  <th className="py-2.5 px-3">Active Headcount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {designations.map((desg) => {
                  const count = employees.filter((e) => e.designation?.id === desg.id).length;
                  return (
                    <tr key={desg.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{desg.designationCode}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">{desg.designationName}</td>
                      <td className="py-2.5 px-3 text-zinc-600">
                        {desg.description || "Core organizational functional capacity"}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{count} Members</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB E: BRANCHES & LOCATIONS */}
      {/* =================================================================== */}
      {activeTab === "branch" && (
        <div>
          {branches.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <MapPin className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Office Locations Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Set up branch offices, headquarters, or remote work clusters to map employee physical placements.
              </p>
              <button
                onClick={() => setShowAddBranchModal(true)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs rounded-md font-semibold"
              >
                + Add Office Location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div key={b.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-xs text-zinc-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {b.branchName}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{b.branchCode}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {b.timezone}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-600">
                    <div className="font-medium text-zinc-800">{b.city}</div>
                    <div className="text-[11px] text-zinc-500">{b.address}</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-500">Branch Head: </span>
                      <span className="font-semibold text-zinc-800">{b.branchHead}</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-700">
                      Capacity: {b.capacity} Seats
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB F: EMPLOYEE GRADES */}
      {/* =================================================================== */}
      {activeTab === "grade" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-xs text-zinc-900">
              Compensation Bands & Grade Hierarchy
            </div>
            <span className="text-zinc-500 text-[11px] font-mono font-semibold">
              {grades.length} Hierarchy Tiers
            </span>
          </div>
          {grades.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Grade Bands Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Define seniority tiers, compensation bands, and notice policies for structured workforce governance.
              </p>
              <button
                onClick={() => setShowAddGradeModal(true)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs rounded-md font-semibold"
              >
                + Add Grade Level
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Grade Code</th>
                  <th className="py-2.5 px-3">Grade Band Title</th>
                  <th className="py-2.5 px-3">Hierarchy Level</th>
                  <th className="py-2.5 px-3">Annual CTC Scale</th>
                  <th className="py-2.5 px-3">Notice Policy</th>
                  <th className="py-2.5 px-3">Annual Leaves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {grades.map((gr) => (
                  <tr key={gr.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{gr.gradeCode}</td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">{gr.gradeName}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{gr.hierarchyLevel}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-zinc-900">{gr.salaryBand}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-600">{gr.noticePeriodDays} Days</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-600">{gr.leaveEntitlementDays} Days/Yr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB G: PROMOTIONS & INTERNAL MOBILITY */}
      {/* =================================================================== */}
      {activeTab === "promotions" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-xs text-zinc-900">
              Internal Mobility, Promotions & Reassignment Audit Trail
            </div>
            <span className="text-zinc-500 text-[11px] font-mono font-semibold">
              {promotions.length} Career Milestone Logs
            </span>
          </div>
          {promotions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ArrowRightLeft className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Internal Mobility Records</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Log promotions, transfers, and designation upgrades to maintain historical records of career progression.
              </p>
              <button
                onClick={() => setShowPromotionModal(true)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs rounded-md font-semibold"
              >
                + Record Mobility / Promotion
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Effective Date</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Mobility Type</th>
                  <th className="py-2.5 px-3">Designation Transition</th>
                  <th className="py-2.5 px-3">Department Transition</th>
                  <th className="py-2.5 px-3">Increment %</th>
                  <th className="py-2.5 px-3">Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {promotions.map((prom) => (
                  <tr key={prom.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-3 font-mono text-zinc-700">{prom.effectiveDate}</td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">
                      {prom.employeeName}
                      <span className="block text-[10px] font-mono text-zinc-500">{prom.employeeCode}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-white">
                        {prom.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700">
                      <span className="text-zinc-400 line-through text-[11px]">{prom.prevDesignation}</span>
                      <div className="font-medium text-zinc-900">{prom.newDesignation}</div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700">
                      <div className="text-[11px] text-zinc-800">{prom.newDepartment}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                      +{prom.salaryHikePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 font-medium">{prom.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB H: SEPARATION & EXIT MANAGEMENT */}
      {/* =================================================================== */}
      {activeTab === "separation" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-xs text-zinc-900">
                Employee Separation, Asset Clearance & Final Settlement (FnF)
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Automated notice period tracking, departmental asset return clearance, exit interviews, and FnF disbursement.
              </p>
            </div>
            <div className="font-mono text-xs font-semibold text-zinc-700">
              {separations.length} Active Exit Workflow(s)
            </div>
          </div>

          {separations.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <UserMinus className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Active Separation Workflows</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                All employees are currently active and in good standing. Start a separation workflow when an employee submits their resignation.
              </p>
              <button
                onClick={() => setShowSeparationModal(true)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs rounded-md font-semibold"
              >
                + Initiate Separation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {separations.map((sep) => (
                <div key={sep.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div>
                      <div className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                        {sep.employeeName}
                        <span className="font-mono text-[10px] text-zinc-500 font-normal">({sep.employeeCode})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {sep.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {sep.designation} · {sep.department}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Resignation Date</span>
                        <span className="text-zinc-800">{sep.resignationDate}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Last Working Day</span>
                        <span className="text-zinc-900 font-bold">{sep.lastWorkingDay}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Notice Status</span>
                        <span className="text-zinc-900 font-bold">{sep.noticeDaysRemaining} Days Left</span>
                      </div>
                    </div>
                  </div>

                  {/* Clearance Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div
                      onClick={() => handleToggleClearance(sep.id, "itClearance")}
                      className={`p-2.5 rounded border cursor-pointer transition-colors ${
                        sep.itClearance
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px]">IT & Asset Return</span>
                        {sep.itClearance ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Laptop, Security Token</div>
                    </div>

                    <div
                      onClick={() => handleToggleClearance(sep.id, "financeClearance")}
                      className={`p-2.5 rounded border cursor-pointer transition-colors ${
                        sep.financeClearance
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px]">Finance & Accounts</span>
                        {sep.financeClearance ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Travel advances, corporate card</div>
                    </div>

                    <div
                      onClick={() => handleToggleClearance(sep.id, "projectHandover")}
                      className={`p-2.5 rounded border cursor-pointer transition-colors ${
                        sep.projectHandover
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px]">Work & Handover</span>
                        {sep.projectHandover ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Project KT & Code commit</div>
                    </div>

                    <div
                      onClick={() => handleToggleClearance(sep.id, "hrExitInterview")}
                      className={`p-2.5 rounded border cursor-pointer transition-colors ${
                        sep.hrExitInterview
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px]">HR Exit Interview</span>
                        {sep.hrExitInterview ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">NDA signing & Feedback</div>
                    </div>
                  </div>

                  {/* Settlement Actions */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 font-mono">FnF Status:</span>
                      <span className="font-mono font-bold text-zinc-800 text-[11px]">
                        {sep.fnfStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sep.fnfStatus !== "DISBURSED" ? (
                        <button
                          onClick={() => handleDisburseFnF(sep.id)}
                          className="px-3 py-1 bg-zinc-900 hover:bg-black text-white rounded text-xs font-semibold"
                        >
                          Authorize & Disburse Settlement
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 border border-zinc-300 rounded text-xs font-semibold font-mono">
                          ✓ Relieving Letter Issued & Disbursed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. 360 DRAWER INSPECTOR FOR SELECTED EMPLOYEE */}
      {/* ------------------------------------------------------------------- */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-zinc-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-zinc-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                  {selectedEmp.firstName ? selectedEmp.firstName[0] : "E"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-mono">{selectedEmp.employeeCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEmployee(selectedEmp.id)}
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-900"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEmp(null)}
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="space-y-4 text-xs">
              <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Organizational Placement
              </div>
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-500 font-medium">Department</span>
                  <p className="font-bold text-zinc-800 mt-0.5">{selectedEmp.department?.departmentName || "Unassigned"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Designation</span>
                  <p className="font-bold text-zinc-800 mt-0.5">{selectedEmp.designation?.designationName || "Unassigned"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Employment Type</span>
                  <p className="font-bold text-zinc-800 mt-0.5">{selectedEmp.employmentType || "FULL_TIME"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Date of Joining</span>
                  <p className="font-bold text-zinc-800 mt-0.5 font-mono">{selectedEmp.dateOfJoining}</p>
                </div>
              </div>

              <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Statutory & Bank Compensation
              </div>
              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Income Tax PAN</span>
                  <span className="font-mono font-bold text-zinc-800">{selectedEmp.panNumber || "Not Provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Bank Name</span>
                  <span className="font-semibold text-zinc-800">{selectedEmp.bankName || "HDFC Bank Ltd"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Bank Account Number</span>
                  <span className="font-mono font-bold text-zinc-800">{selectedEmp.bankAccountNumber || "Not Provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">IFSC Code</span>
                  <span className="font-mono font-bold text-zinc-800">{selectedEmp.ifscCode || "Not Provided"}</span>
                </div>
              </div>

              <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Contact & Communication
              </div>
              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Official Work Email</span>
                  <span className="font-medium text-zinc-800">{selectedEmp.workEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Mobile Phone</span>
                  <span className="font-medium text-zinc-800">{selectedEmp.cellNumber}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 border border-zinc-300 text-zinc-800 rounded-md text-xs font-semibold hover:bg-zinc-50"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 6. MODAL: ONBOARD NEW EMPLOYEE (DIRECTORY) */}
      {/* ------------------------------------------------------------------- */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Onboard New Employee</h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter first name"
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-600 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Work Email</label>
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    value={newEmp.workEmail}
                    onChange={(e) => setNewEmp({ ...newEmp, workEmail: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Mobile Phone</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={newEmp.cellNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, cellNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Department</label>
                  <select
                    value={newEmp.departmentId}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Designation</label>
                  <select
                    value={newEmp.designationId}
                    onChange={(e) => setNewEmp({ ...newEmp, designationId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-none"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.designationName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Income Tax PAN</label>
                  <input
                    type="text"
                    placeholder="PAN Number"
                    value={newEmp.panNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, panNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Bank Account No.</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={newEmp.bankAccountNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-md font-semibold"
                >
                  Save & Enroll Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 7. MODAL: ADD DEPARTMENT */}
      {/* ------------------------------------------------------------------- */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add New Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Department Code</label>
                <input
                  type="text"
                  placeholder="DEPT-NEW"
                  value={newDeptForm.code}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Department Name</label>
                <input
                  required
                  type="text"
                  placeholder="Department Name"
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. MODAL: ADD DESIGNATION */}
      {/* ------------------------------------------------------------------- */}
      {showAddDesgModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add New Designation</h3>
              <button onClick={() => setShowAddDesgModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDesignation} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Designation Code</label>
                <input
                  type="text"
                  placeholder="DESG-NEW"
                  value={newDesgForm.code}
                  onChange={(e) => setNewDesgForm({ ...newDesgForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Designation Title</label>
                <input
                  required
                  type="text"
                  placeholder="Designation Title"
                  value={newDesgForm.title}
                  onChange={(e) => setNewDesgForm({ ...newDesgForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Role Description</label>
                <input
                  type="text"
                  placeholder="Role responsibilities and scope"
                  value={newDesgForm.description}
                  onChange={(e) => setNewDesgForm({ ...newDesgForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddDesgModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Create Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. MODAL: ADD BRANCH */}
      {/* ------------------------------------------------------------------- */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add Office Branch</h3>
              <button onClick={() => setShowAddBranchModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Branch Code</label>
                <input
                  type="text"
                  placeholder="BR-LOC-01"
                  value={newBranchForm.code}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Branch Name</label>
                <input
                  required
                  type="text"
                  placeholder="Branch Name"
                  value={newBranchForm.name}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">City</label>
                  <input
                    required
                    type="text"
                    placeholder="City, Country"
                    value={newBranchForm.city}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newBranchForm.capacity}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Office address"
                  value={newBranchForm.address}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. MODAL: ADD GRADE */}
      {/* ------------------------------------------------------------------- */}
      {showAddGradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add Employee Grade</h3>
              <button onClick={() => setShowAddGradeModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGrade} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Grade Code</label>
                <input
                  type="text"
                  placeholder="GR-L1"
                  value={newGradeForm.code}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Grade Name</label>
                <input
                  required
                  type="text"
                  placeholder="Grade Title"
                  value={newGradeForm.name}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Notice (Days)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newGradeForm.noticeDays}
                    onChange={(e) => setNewGradeForm({ ...newGradeForm, noticeDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Annual Leaves</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={newGradeForm.leaves}
                    onChange={(e) => setNewGradeForm({ ...newGradeForm, leaves: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Add Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 11. MODAL: INITIATE CANDIDATE ONBOARDING */}
      {/* ------------------------------------------------------------------- */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Initiate Candidate Onboarding</h3>
              <button onClick={() => setShowOnboardModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOnboardingCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Candidate Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Candidate Name"
                  value={newCandidateForm.name}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Official Email</label>
                  <input
                    required
                    type="email"
                    placeholder="email@company.com"
                    value={newCandidateForm.email}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={newCandidateForm.phone}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Target Department</label>
                  <select
                    value={newCandidateForm.dept}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, dept: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Role / Designation</label>
                  <select
                    value={newCandidateForm.desg}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, desg: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.designationName}>{d.designationName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Target Joining Date</label>
                <input
                  type="date"
                  value={newCandidateForm.date}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Initiate Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 12. MODAL: INITIATE SEPARATION */}
      {/* ------------------------------------------------------------------- */}
      {showSeparationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Initiate Employee Separation</h3>
              <button onClick={() => setShowSeparationModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const matched = employees.find((x) => x.id === newSeparationForm.empId);
                if (!matched) return;
                const newSep: SeparationRecord = {
                  id: `sep-${Date.now()}`,
                  employeeCode: matched.employeeCode,
                  employeeName: `${matched.firstName} ${matched.lastName}`,
                  department: matched.department?.departmentName || "General",
                  designation: matched.designation?.designationName || "Employee",
                  resignationDate: new Date().toISOString().split("T")[0],
                  lastWorkingDay: newSeparationForm.lastDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                  reason: newSeparationForm.reason,
                  noticeDaysRemaining: Number(newSeparationForm.noticeDays) || 30,
                  itClearance: false,
                  financeClearance: false,
                  projectHandover: false,
                  hrExitInterview: false,
                  fnfStatus: "PENDING",
                  relievingLetterIssued: false,
                  status: "NOTICE_PERIOD",
                };
                const updated = [newSep, ...separations];
                setSeparations(updated);
                setStorage("SEPARATIONS", updated);
                setShowSeparationModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Select Exiting Employee</label>
                <select
                  required
                  value={newSeparationForm.empId}
                  onChange={(e) => setNewSeparationForm({ ...newSeparationForm, empId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  <option value="">Choose Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Reason for Separation</label>
                <select
                  value={newSeparationForm.reason}
                  onChange={(e) => setNewSeparationForm({ ...newSeparationForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  <option value="Career Advancement / Better Offer">Career Advancement / Better Offer</option>
                  <option value="Higher Education / University">Higher Education / University</option>
                  <option value="Personal / Relocation">Personal / Relocation</option>
                  <option value="Health / Medical Reasons">Health / Medical Reasons</option>
                  <option value="Retirement">Retirement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Last Working Day</label>
                  <input
                    type="date"
                    value={newSeparationForm.lastDate}
                    onChange={(e) => setNewSeparationForm({ ...newSeparationForm, lastDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={newSeparationForm.noticeDays}
                    onChange={(e) => setNewSeparationForm({ ...newSeparationForm, noticeDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowSeparationModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Start Notice & Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 13. MODAL: RECORD PROMOTION / MOBILITY */}
      {/* ------------------------------------------------------------------- */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Record Internal Mobility / Promotion</h3>
              <button onClick={() => setShowPromotionModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const matched = employees.find((x) => x.id === newPromotionForm.empId);
                if (!matched) return;
                const targetDesg = designations.find((d) => d.id === newPromotionForm.newDesgId) || designations[0];
                const targetDept = departments.find((d) => d.id === newPromotionForm.newDeptId) || departments[0];

                const newProm: PromotionRecord = {
                  id: `prom-${Date.now()}`,
                  effectiveDate: new Date().toISOString().split("T")[0],
                  employeeCode: matched.employeeCode,
                  employeeName: `${matched.firstName} ${matched.lastName}`,
                  movementType: "PROMOTION",
                  prevDesignation: matched.designation?.designationName || "Staff",
                  newDesignation: targetDesg ? targetDesg.designationName : "Promoted Role",
                  prevDepartment: matched.department?.departmentName || "General",
                  newDepartment: targetDept ? targetDept.departmentName : "General",
                  salaryHikePercent: Number(newPromotionForm.hike) || 15,
                  approver: newPromotionForm.approver || "Board & People Ops",
                };
                const updated = [newProm, ...promotions];
                setPromotions(updated);
                setStorage("PROMOTIONS", updated);
                setShowPromotionModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Select Employee</label>
                <select
                  required
                  value={newPromotionForm.empId}
                  onChange={(e) => setNewPromotionForm({ ...newPromotionForm, empId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  <option value="">Choose Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">New Promoted Designation</label>
                <select
                  value={newPromotionForm.newDesgId}
                  onChange={(e) => setNewPromotionForm({ ...newPromotionForm, newDesgId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.designationName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Department Placement</label>
                <select
                  value={newPromotionForm.newDeptId}
                  onChange={(e) => setNewPromotionForm({ ...newPromotionForm, newDeptId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Revised Salary Hike (%)</label>
                  <input
                    type="number"
                    value={newPromotionForm.hike}
                    onChange={(e) => setNewPromotionForm({ ...newPromotionForm, hike: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Approving Authority</label>
                  <input
                    type="text"
                    value={newPromotionForm.approver}
                    onChange={(e) => setNewPromotionForm({ ...newPromotionForm, approver: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowPromotionModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Execute Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-400 font-mono">
          Loading Employee 360 Workspace...
        </div>
      }
    >
      <Employee360Content />
    </Suspense>
  );
}
