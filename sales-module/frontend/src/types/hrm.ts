export type EmployeeStatus = "ACTIVE" | "PROBATION" | "SUSPENDED" | "LEFT";
export type GenderType = "MALE" | "FEMALE" | "OTHER";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE" | "WORK_FROM_HOME";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type SalarySlipStatus = "DRAFT" | "SUBMITTED" | "PAID" | "CANCELLED";
export type JobStatus = "OPEN" | "ON_HOLD" | "CLOSED";
export type ApplicantStage = "APPLIED" | "SCREENING" | "TECH_INTERVIEW" | "HR_INTERVIEW" | "OFFER_MADE" | "HIRED" | "REJECTED";
export type AppraisalStatus = "DRAFT" | "SELF_APPRAISAL_PENDING" | "MANAGER_REVIEW_PENDING" | "COMPLETED";
export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";

export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentHeadId?: string;
  isActive: boolean;
}

export interface Designation {
  id: string;
  designationCode: string;
  designationName: string;
  description?: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: GenderType;
  dateOfBirth?: string;
  dateOfJoining: string;
  dateOfLeaving?: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  department: Department;
  designation: Designation;
  branch?: Branch;
  workEmail: string;
  personalEmail?: string;
  cellNumber: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  panNumber?: string;
  pfNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  avatarUrl?: string;
  noticePeriodDays?: number;
}

export interface ShiftType {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingHours: number;
}

export interface AttendanceRecord {
  id: string;
  employee: Employee;
  attendanceDate: string;
  status: AttendanceStatus;
  workingHours: number;
  inTime?: string;
  outTime?: string;
  lateEntryMinutes?: number;
  earlyExitMinutes?: number;
  overtimeHours?: number;
  remarks?: string;
}

export interface LeaveType {
  id: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  maxDaysAllowed: number;
  isCarryForward: boolean;
  maxCarryForwardDays?: number;
  isLwp: boolean;
  isEncashable?: boolean;
}

export interface LeaveAllocation {
  id: string;
  employee: Employee;
  leaveType: LeaveType;
  fiscalYear: number;
  totalAllocated: number;
  usedLeaves: number;
  pendingLeaves: number;
  remainingLeaves: number;
}

export interface LeaveApplication {
  id: string;
  applicationNumber: string;
  employee: Employee;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  totalLeaveDays: number;
  isHalfDay: boolean;
  reason: string;
  status: LeaveStatus;
  approvedBy?: Employee;
  rejectionReason?: string;
}

export interface SalarySlipItem {
  id?: string;
  componentName: string;
  type: "EARNING" | "DEDUCTION";
  amount: number;
}

export interface SalarySlip {
  id: string;
  slipNumber: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  postingDate: string;
  totalWorkingDays: number;
  paymentDays: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  roundedTotal: number;
  inWords?: string;
  status: SalarySlipStatus;
  bankAccountNumber?: string;
  paymentReference?: string;
  items?: SalarySlipItem[];
}

export interface JobOpening {
  id: string;
  jobTitle: string;
  jobCode: string;
  department: Department;
  designation?: Designation;
  vacancies: number;
  status: JobStatus;
  location: string;
  minExperienceYears: number;
  description?: string;
  postedDate?: string;
}

export interface JobApplicant {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  jobOpening?: JobOpening;
  currentCompany?: string;
  currentCtc?: number;
  expectedCtc?: number;
  stage: ApplicantStage;
  rating: number;
  notes?: string;
  appliedDate?: string;
}

export interface EmployeeAppraisal {
  id: string;
  appraisalCycle: string;
  employee: Employee;
  manager: Employee;
  status: AppraisalStatus;
  selfScore?: number;
  managerScore?: number;
  finalScore?: number;
  remarks?: string;
  promotionRecommended: boolean;
  incrementPercentage: number;
  // Sales Performance Integration
  salesTarget?: number;
  salesBooked?: number;
  salesAchievementPct?: number;
  dealsClosed?: number;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employee: Employee;
  claimDate: string;
  expenseType: string;
  totalAmount: number;
  sanctionedAmount: number;
  status: ExpenseStatus;
  description?: string;
  paymentReference?: string;
  // Sales Integration
  customerId?: string;
  customerName?: string;
  salesOrderId?: string;
  isBillable?: boolean;
}

export interface SalesCommissionDetail {
  voucherId?: string;
  voucherType?: string;
  voucherNumber: string;
  allocatedAmount: number;
  commissionRate: number;
  incentiveAmount: number;
}

export interface SalesRepPerformance {
  employeeCode: string;
  salesPersonName: string;
  targetAmount: number;
  bookedAmount: number;
  achievementPercentage: number;
  commissionEarned: number;
  dealsClosed: number;
  performanceRating: "EXCEEDS" | "MEETS" | "NEEDS_IMPROVEMENT";
}

export interface CustomerSummaryOption {
  id: string;
  customerCode: string;
  customerName: string;
  territoryName?: string;
}

export interface HrmDashboardKpis {
  totalEmployees: number;
  activeEmployees: number;
  probationEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  monthlyPayrollExpenditure: number;
  openJobOpenings: number;
  departmentDistribution: { departmentName: string; count: number }[];
  payrollTrends: { month: string; totalGross: number; totalNet: number; slipsCount: number }[];
}

