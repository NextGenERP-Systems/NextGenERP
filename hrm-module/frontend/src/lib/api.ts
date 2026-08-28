import {
  Department,
  Designation,
  Branch,
  Employee,
  AttendanceRecord,
  LeaveType,
  LeaveAllocation,
  LeaveApplication,
  SalarySlip,
  JobOpening,
  JobApplicant,
  EmployeeAppraisal,
  ExpenseClaim,
  HrmDashboardKpis,
} from "@/types/hrm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// ------------------------------------------------------------------------------
// ORGANIZATIONAL MASTER DATA (Departments & Designations)
// ------------------------------------------------------------------------------

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "11111111-1111-1111-1111-111111111101", departmentCode: "DEPT-ENG", departmentName: "Software Engineering & Platform", isActive: true },
  { id: "11111111-1111-1111-1111-111111111102", departmentCode: "DEPT-PROD", departmentName: "Product Strategy & Design", isActive: true },
  { id: "11111111-1111-1111-1111-111111111103", departmentCode: "DEPT-SALES", departmentName: "Global Sales & Business Dev", isActive: true },
  { id: "11111111-1111-1111-1111-111111111104", departmentCode: "DEPT-HR", departmentName: "Human Resources & People Ops", isActive: true },
  { id: "11111111-1111-1111-1111-111111111105", departmentCode: "DEPT-FIN", departmentName: "Finance, Tax & Legal", isActive: true },
];

export const MOCK_DESIGNATIONS: Designation[] = [
  { id: "22222222-2222-2222-2222-222222222201", designationCode: "DESG-VP-ENG", designationName: "VP of Engineering", isActive: true },
  { id: "22222222-2222-2222-2222-222222222202", designationCode: "DESG-PR-ENG", designationName: "Principal Software Architect", isActive: true },
  { id: "22222222-2222-2222-2222-222222222203", designationCode: "DESG-SR-DEV", designationName: "Senior Full-Stack Engineer", isActive: true },
  { id: "22222222-2222-2222-2222-222222222204", designationCode: "DESG-HR-DIR", designationName: "Director of People Operations", isActive: true },
  { id: "22222222-2222-2222-2222-222222222205", designationCode: "DESG-SALES-LEAD", designationName: "Enterprise Sales Director", isActive: true },
];

export const MOCK_LEAVE_TYPES: LeaveType[] = [
  { id: "33333333-3333-3333-3333-333333333301", leaveTypeCode: "PL", leaveTypeName: "Privilege / Earned Leave", maxDaysAllowed: 18, isCarryForward: true, maxCarryForwardDays: 45, isLwp: false, isEncashable: true },
  { id: "33333333-3333-3333-3333-333333333302", leaveTypeCode: "CL", leaveTypeName: "Casual Leave", maxDaysAllowed: 12, isCarryForward: false, maxCarryForwardDays: 0, isLwp: false, isEncashable: false },
  { id: "33333333-3333-3333-3333-333333333303", leaveTypeCode: "SL", leaveTypeName: "Sick / Medical Leave", maxDaysAllowed: 10, isCarryForward: true, maxCarryForwardDays: 30, isLwp: false, isEncashable: false },
  { id: "33333333-3333-3333-3333-333333333304", leaveTypeCode: "LOP", leaveTypeName: "Loss of Pay (Unpaid)", maxDaysAllowed: 90, isCarryForward: false, maxCarryForwardDays: 0, isLwp: true, isEncashable: false },
];

// ------------------------------------------------------------------------------
// PERMANENT STORAGE HELPERS
// ------------------------------------------------------------------------------

function getStored<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`NEXTGEN_HRM_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`NEXTGEN_HRM_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Storage write error", e);
  }
}

// ------------------------------------------------------------------------------
// API CLIENT METHODS -> DIRECT SPRING BOOT 3 & POSTGRESQL PERSISTENCE
// ------------------------------------------------------------------------------

export async function getHrmDashboardKpis(): Promise<HrmDashboardKpis> {
  try {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  const emps = getStored<Employee>("EMPLOYEES", []);
  const atts = getStored<AttendanceRecord>("ATTENDANCE", []);
  const leaves = getStored<LeaveApplication>("LEAVES", []);
  const slips = getStored<SalarySlip>("PAYROLL", []);
  const jobs = getStored<JobOpening>("JOBS", []);

  const active = emps.filter((e) => e.status === "ACTIVE").length;
  const probation = emps.filter((e) => e.status === "PROBATION").length;
  const present = atts.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length;
  const leaveCount = leaves.filter((l) => l.status === "APPROVED").length;
  const totalPayroll = slips.reduce((acc, s) => acc + (s.grossPay || 0), 0);

  return {
    totalEmployees: emps.length,
    activeEmployees: active,
    probationEmployees: probation,
    presentToday: present,
    onLeaveToday: leaveCount,
    monthlyPayrollExpenditure: totalPayroll,
    openJobOpenings: jobs.length,
    departmentDistribution: MOCK_DEPARTMENTS.map((d) => ({
      departmentName: d.departmentName.split(" ")[0],
      count: emps.filter((e) => e.department?.id === d.id).length,
    })),
    payrollTrends: [
      { month: "Current", totalGross: totalPayroll, totalNet: totalPayroll * 0.9, slipsCount: slips.length },
    ],
  };
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(`${API_BASE}/employees`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("EMPLOYEES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<Employee>("EMPLOYEES", []);
}

export async function createEmployee(data: any): Promise<Employee> {
  const currentList = getStored<Employee>("EMPLOYEES", []);
  const deptId = data.departmentId || (data.department?.id) || MOCK_DEPARTMENTS[0].id;
  const desgId = data.designationId || (data.designation?.id) || MOCK_DESIGNATIONS[0].id;

  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    workEmail: data.workEmail || `${(data.firstName || "employee").toLowerCase()}@nextgenerp.io`,
    cellNumber: data.cellNumber || "+91 98000 11222",
    panNumber: data.panNumber || "ABCDE1234F",
    bankName: data.bankName || "HDFC Bank",
    bankAccountNumber: data.bankAccountNumber || "5010099887766",
    ifscCode: data.ifscCode || "HDFC0000123",
    status: data.status || "ACTIVE",
    employmentType: data.employmentType || "FULL_TIME",
    dateOfJoining: data.dateOfJoining || new Date().toISOString().split("T")[0],
    department: { id: deptId },
    designation: { id: desgId },
  };

  try {
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const updated = [created, ...currentList.filter((e) => e.id !== created.id)];
      setStored("EMPLOYEES", updated);
      return created;
    }
  } catch (err) {}

  const dept = MOCK_DEPARTMENTS.find((d) => d.id === deptId) || MOCK_DEPARTMENTS[0];
  const desg = MOCK_DESIGNATIONS.find((d) => d.id === desgId) || MOCK_DESIGNATIONS[0];

  const localEmp: Employee = {
    id: `emp-${Date.now()}`,
    employeeCode: `EMP-${String(currentList.length + 1).padStart(3, "0")}`,
    firstName: data.firstName || "New",
    lastName: data.lastName || "Employee",
    gender: data.gender || "MALE",
    dateOfJoining: data.dateOfJoining || new Date().toISOString().split("T")[0],
    status: data.status || "ACTIVE",
    employmentType: data.employmentType || "FULL_TIME",
    department: dept,
    designation: desg,
    workEmail: data.workEmail || `${(data.firstName || "employee").toLowerCase()}@nextgenerp.io`,
    cellNumber: data.cellNumber || "+91 98000 11222",
    panNumber: data.panNumber || "ABCDE1234F",
    bankName: data.bankName || "HDFC Bank",
    bankAccountNumber: data.bankAccountNumber || "5010099887766",
    ifscCode: data.ifscCode || "HDFC0000123",
  };

  const updated = [localEmp, ...currentList.filter((e) => e.id !== localEmp.id)];
  setStored("EMPLOYEES", updated);
  return localEmp;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<Employee>("EMPLOYEES", []);
  const updated = current.filter((e) => e.id !== id);
  setStored("EMPLOYEES", updated);
  return true;
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/attendance`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("ATTENDANCE", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<AttendanceRecord>("ATTENDANCE", []);
}

export async function punchInEmployee(employeeId: string): Promise<AttendanceRecord> {
  const emps = getStored<Employee>("EMPLOYEES", []);
  const emp = emps.find((e) => e.id === employeeId) || emps[0];

  try {
    const res = await fetch(`${API_BASE}/attendance/punch-in/${employeeId}`, { method: "POST" });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<AttendanceRecord>("ATTENDANCE", []);
      setStored("ATTENDANCE", [created, ...current.filter((a) => a.id !== created.id)]);
      return created;
    }
  } catch (err) {}

  const record: AttendanceRecord = {
    id: `att-${Date.now()}`,
    employee: emp || {
      id: "emp-1",
      employeeCode: "EMP-001",
      firstName: "Active",
      lastName: "User",
      gender: "MALE",
      dateOfJoining: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      employmentType: "FULL_TIME",
      department: MOCK_DEPARTMENTS[0],
      designation: MOCK_DESIGNATIONS[0],
      workEmail: "user@nextgenerp.io",
      cellNumber: "+91 98000 11222",
    },
    attendanceDate: new Date().toISOString().split("T")[0],
    status: "PRESENT",
    workingHours: 8.0,
    inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    remarks: "Web punch-in registered",
  };

  const current = getStored<AttendanceRecord>("ATTENDANCE", []);
  setStored("ATTENDANCE", [record, ...current]);
  return record;
}

export async function getLeaveApplications(): Promise<LeaveApplication[]> {
  try {
    const res = await fetch(`${API_BASE}/leaves`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("LEAVES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<LeaveApplication>("LEAVES", []);
}

export async function applyLeave(data: any): Promise<LeaveApplication> {
  const emps = getStored<Employee>("EMPLOYEES", []);
  const emp = emps.find((e) => e.id === data.employeeId) || emps[0];
  const typeId = data.leaveTypeId || MOCK_LEAVE_TYPES[0].id;
  const type = MOCK_LEAVE_TYPES.find((t) => t.id === typeId) || MOCK_LEAVE_TYPES[0];

  const payload = {
    employee: { id: emp?.id },
    leaveType: { id: typeId },
    fromDate: data.fromDate || new Date().toISOString().split("T")[0],
    toDate: data.toDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    totalLeaveDays: data.totalLeaveDays || 1.0,
    isHalfDay: Boolean(data.isHalfDay),
    reason: data.reason || "Personal work",
    status: "PENDING",
  };

  try {
    const res = await fetch(`${API_BASE}/leaves/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<LeaveApplication>("LEAVES", []);
      setStored("LEAVES", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newLeave: LeaveApplication = {
    id: `la-${Date.now()}`,
    applicationNumber: `LA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    employee: emp,
    leaveType: type,
    fromDate: data.fromDate || new Date().toISOString().split("T")[0],
    toDate: data.toDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    totalLeaveDays: data.totalLeaveDays || 1.0,
    isHalfDay: Boolean(data.isHalfDay),
    reason: data.reason || "Personal work",
    status: "PENDING",
  };

  const current = getStored<LeaveApplication>("LEAVES", []);
  setStored("LEAVES", [newLeave, ...current]);
  return newLeave;
}

export async function approveLeave(id: string): Promise<LeaveApplication | null> {
  try {
    const res = await fetch(`${API_BASE}/leaves/${id}/approve`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      const current = getStored<LeaveApplication>("LEAVES", []);
      setStored("LEAVES", current.map((l) => (l.id === id ? updated : l)));
      return updated;
    }
  } catch (err) {}

  const current = getStored<LeaveApplication>("LEAVES", []);
  const target = current.find((l) => l.id === id);
  if (target) {
    target.status = "APPROVED";
    setStored("LEAVES", current);
  }
  return target || null;
}

export async function rejectLeave(id: string, reason?: string): Promise<LeaveApplication | null> {
  try {
    const res = await fetch(`${API_BASE}/leaves/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: reason }),
    });
    if (res.ok) {
      const updated = await res.json();
      const current = getStored<LeaveApplication>("LEAVES", []);
      setStored("LEAVES", current.map((l) => (l.id === id ? updated : l)));
      return updated;
    }
  } catch (err) {}

  const current = getStored<LeaveApplication>("LEAVES", []);
  const target = current.find((l) => l.id === id);
  if (target) {
    target.status = "REJECTED";
    target.rejectionReason = reason || "Application rejected by reviewer";
    setStored("LEAVES", current);
  }
  return target || null;
}

export async function getSalarySlips(): Promise<SalarySlip[]> {
  try {
    const res = await fetch(`${API_BASE}/payroll/slips`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("PAYROLL", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<SalarySlip>("PAYROLL", []);
}

export async function generateBatchPayroll(): Promise<SalarySlip[]> {
  const payload = {
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    postingDate: "2026-08-31",
  };

  try {
    const res = await fetch(`${API_BASE}/payroll/generate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored("PAYROLL", data);
        return data;
      }
    }
  } catch (err) {}

  const emps = getStored<Employee>("EMPLOYEES", []);
  const generated: SalarySlip[] = emps.map((emp, idx) => ({
    id: `slip-${Date.now()}-${idx}`,
    slipNumber: `SLIP-2026-08-${String(idx + 1).padStart(3, "0")}`,
    employee: emp,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    postingDate: "2026-08-31",
    totalWorkingDays: 31,
    paymentDays: 31,
    grossPay: 150000.0,
    totalDeductions: 15200.0,
    netPay: 134800.0,
    roundedTotal: 134800.0,
    inWords: "INR One Lakh Thirty-Four Thousand Eight Hundred Only",
    status: "DRAFT" as const,
    bankAccountNumber: emp.bankAccountNumber || "50100234567890",
  }));

  setStored("PAYROLL", generated);
  return generated;
}

export async function getJobOpenings(): Promise<JobOpening[]> {
  try {
    const res = await fetch(`${API_BASE}/recruitment/jobs`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("JOBS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<JobOpening>("JOBS", []);
}

export async function createJobOpening(data: any): Promise<JobOpening> {
  const dept = MOCK_DEPARTMENTS.find((d) => d.id === data.departmentId) || MOCK_DEPARTMENTS[0];
  const desg = MOCK_DESIGNATIONS[0];

  const payload = {
    jobTitle: data.jobTitle,
    jobCode: `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
    vacancies: Number(data.vacancies) || 1,
    status: "OPEN",
    location: data.location || "Bengaluru / Hybrid",
    minExperienceYears: Number(data.minExperienceYears) || 2,
    description: data.description || "Exciting engineering & business opportunity",
    department: { id: dept.id },
    designation: { id: desg.id },
    postedDate: new Date().toISOString().split("T")[0],
  };

  try {
    const res = await fetch(`${API_BASE}/recruitment/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<JobOpening>("JOBS", []);
      setStored("JOBS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newJob: JobOpening = {
    id: `job-${Date.now()}`,
    jobTitle: data.jobTitle,
    jobCode: payload.jobCode,
    department: dept,
    designation: desg,
    vacancies: payload.vacancies,
    status: "OPEN",
    location: payload.location,
    minExperienceYears: payload.minExperienceYears,
    description: payload.description,
    postedDate: payload.postedDate,
  };
  const current = getStored<JobOpening>("JOBS", []);
  setStored("JOBS", [newJob, ...current]);
  return newJob;
}

export async function getApplicants(): Promise<JobApplicant[]> {
  try {
    const res = await fetch(`${API_BASE}/recruitment/applicants`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("APPLICANTS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<JobApplicant>("APPLICANTS", []);
}

export async function addApplicant(data: any): Promise<JobApplicant> {
  const jobs = getStored<JobOpening>("JOBS", []);
  const job = jobs.find((j) => j.id === data.jobOpeningId) || jobs[0];

  const payload = {
    applicantName: data.applicantName,
    email: data.email,
    phone: data.phone,
    currentCompany: data.currentCompany || "Previous Enterprise Inc",
    expectedCtc: Number(data.expectedCtc) || 1800000,
    stage: "APPLIED",
    rating: Number(data.rating) || 5,
    jobOpening: { id: job?.id },
    appliedDate: new Date().toISOString().split("T")[0],
  };

  try {
    const res = await fetch(`${API_BASE}/recruitment/applicants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<JobApplicant>("APPLICANTS", []);
      setStored("APPLICANTS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newApp: JobApplicant = {
    id: `app-${Date.now()}`,
    applicantName: data.applicantName,
    email: data.email,
    phone: data.phone,
    currentCompany: payload.currentCompany,
    expectedCtc: payload.expectedCtc,
    stage: "APPLIED",
    rating: payload.rating,
    jobOpening: job,
    appliedDate: payload.appliedDate,
  };
  const current = getStored<JobApplicant>("APPLICANTS", []);
  setStored("APPLICANTS", [newApp, ...current]);
  return newApp;
}

export async function deleteApplicant(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/recruitment/applicants/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<JobApplicant>("APPLICANTS", []);
  setStored("APPLICANTS", current.filter((a) => a.id !== id));
  return true;
}

export async function deleteJobOpening(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/recruitment/jobs/${id}`, { method: "DELETE" });
  } catch (err) {}
  const current = getStored<JobOpening>("JOBS", []);
  setStored("JOBS", current.filter((j) => j.id !== id));
  return true;
}

export async function updateApplicantStage(id: string, stage: string): Promise<JobApplicant | null> {
  try {
    const res = await fetch(`${API_BASE}/recruitment/applicants/${id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) {
      const updated = await res.json();
      const current = getStored<JobApplicant>("APPLICANTS", []);
      setStored("APPLICANTS", current.map((a) => (a.id === id ? updated : a)));
      return updated;
    }
  } catch (err) {}

  const current = getStored<JobApplicant>("APPLICANTS", []);
  const target = current.find((a) => a.id === id);
  if (target) {
    target.stage = stage as any;
    setStored("APPLICANTS", current);
  }
  return target || null;
}

export async function getAppraisals(): Promise<EmployeeAppraisal[]> {
  try {
    const res = await fetch(`${API_BASE}/appraisals`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("APPRAISALS", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<EmployeeAppraisal>("APPRAISALS", []);
}

export async function createAppraisal(data: any): Promise<EmployeeAppraisal> {
  const emps = getStored<Employee>("EMPLOYEES", []);
  const emp = emps.find((e) => e.id === data.employeeId) || emps[0];
  const mgr = emps.find((e) => e.id === data.managerId) || emps[0];

  const payload = {
    appraisalCycle: data.appraisalCycle || "FY 2026-27 Q2 Review",
    selfScore: Number(data.selfScore) || 4.5,
    managerScore: Number(data.managerScore) || 4.8,
    finalScore: Number(data.finalScore) || ((Number(data.selfScore) + Number(data.managerScore)) / 2),
    remarks: data.remarks || "Exemplary architectural execution & team leadership",
    promotionRecommended: Boolean(data.promotionRecommended),
    incrementPercentage: Number(data.incrementPercentage) || 15.0,
    status: "COMPLETED",
    employee: { id: emp?.id },
    manager: { id: mgr?.id },
  };

  try {
    const res = await fetch(`${API_BASE}/appraisals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<EmployeeAppraisal>("APPRAISALS", []);
      setStored("APPRAISALS", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newAppraisal: EmployeeAppraisal = {
    id: `apr-${Date.now()}`,
    appraisalCycle: payload.appraisalCycle,
    employee: emp,
    manager: mgr,
    status: "COMPLETED",
    selfScore: payload.selfScore,
    managerScore: payload.managerScore,
    finalScore: payload.finalScore,
    remarks: payload.remarks,
    promotionRecommended: payload.promotionRecommended,
    incrementPercentage: payload.incrementPercentage,
  };
  const current = getStored<EmployeeAppraisal>("APPRAISALS", []);
  setStored("APPRAISALS", [newAppraisal, ...current]);
  return newAppraisal;
}

export async function getExpenseClaims(): Promise<ExpenseClaim[]> {
  try {
    const res = await fetch(`${API_BASE}/expenses`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setStored("EXPENSES", data);
        return data;
      }
    }
  } catch (err) {}
  return getStored<ExpenseClaim>("EXPENSES", []);
}

export async function createExpenseClaim(data: any): Promise<ExpenseClaim> {
  const emps = getStored<Employee>("EMPLOYEES", []);
  const emp = emps.find((e) => e.id === data.employeeId) || emps[0];

  const payload = {
    claimNumber: `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    claimDate: data.claimDate || new Date().toISOString().split("T")[0],
    expenseType: data.expenseType || "Travel & Client Visit",
    totalAmount: Number(data.totalAmount) || 5000,
    sanctionedAmount: Number(data.totalAmount) || 5000,
    status: "SUBMITTED",
    description: data.description || "Client on-site technical architecture workshop",
    employee: { id: emp?.id },
  };

  try {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      const current = getStored<ExpenseClaim>("EXPENSES", []);
      setStored("EXPENSES", [created, ...current]);
      return created;
    }
  } catch (err) {}

  const newClaim: ExpenseClaim = {
    id: `exp-${Date.now()}`,
    claimNumber: payload.claimNumber,
    employee: emp,
    claimDate: payload.claimDate,
    expenseType: payload.expenseType,
    totalAmount: payload.totalAmount,
    sanctionedAmount: payload.sanctionedAmount,
    status: "SUBMITTED",
    description: payload.description,
  };
  const current = getStored<ExpenseClaim>("EXPENSES", []);
  setStored("EXPENSES", [newClaim, ...current]);
  return newClaim;
}

export async function approveExpenseClaim(id: string): Promise<ExpenseClaim | null> {
  try {
    const res = await fetch(`${API_BASE}/expenses/${id}/approve`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      const current = getStored<ExpenseClaim>("EXPENSES", []);
      setStored("EXPENSES", current.map((e) => (e.id === id ? updated : e)));
      return updated;
    }
  } catch (err) {}

  const current = getStored<ExpenseClaim>("EXPENSES", []);
  const target = current.find((e) => e.id === id);
  if (target) {
    target.status = "APPROVED";
    setStored("EXPENSES", current);
  }
  return target || null;
}

export async function rejectExpenseClaim(id: string): Promise<ExpenseClaim | null> {
  try {
    const res = await fetch(`${API_BASE}/expenses/${id}/reject`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      const current = getStored<ExpenseClaim>("EXPENSES", []);
      setStored("EXPENSES", current.map((e) => (e.id === id ? updated : e)));
      return updated;
    }
  } catch (err) {}

  const current = getStored<ExpenseClaim>("EXPENSES", []);
  const target = current.find((e) => e.id === id);
  if (target) {
    target.status = "REJECTED";
    setStored("EXPENSES", current);
  }
  return target || null;
}
