"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Banknote,
  CalendarCheck,
  Award,
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  CreditCard,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  getEmployees,
  getSalarySlips,
  getAttendance,
  getLeaveApplications,
  getDepartments,
  getDesignations,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Employee, SalarySlip, AttendanceRecord, LeaveApplication, Department, Designation } from "@/types/hrm";

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const validTabs = ["attendance", "payroll", "headcount", "leaves", "anniversaries"];
  const activeTab = validTabs.includes(urlTab || "") ? (urlTab as string) : "attendance";

  const handleTabChange = (tab: string) => {
    const url = tab === "attendance" ? "/hrm/reports" : `/hrm/reports?tab=${tab}`;
    router.push(url);
  };

  // State (100% Dynamic - Zero static seeds)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const loadData = async () => {
    const [empData, slipData, attData, leaveData, deptData, desgData] = await Promise.all([
      getEmployees(),
      getSalarySlips(),
      getAttendance(),
      getLeaveApplications(),
      getDepartments(),
      getDesignations(),
    ]);
    setEmployees(empData || []);
    setSlips(slipData || []);
    setAttendance(attData || []);
    setLeaves(leaveData || []);
    setDepartments(deptData || []);
    setDesignations(desgData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Total Disbursed Net
  const totalNet = slips.reduce((acc, s) => acc + (s.netPay || 0), 0);
  const totalGross = slips.reduce((acc, s) => acc + (s.grossPay || 0), 0);

  // Department Headcount Breakdown
  const deptBreakdown = useMemo(() => {
    return departments.map((d) => {
      const count = employees.filter((e) => e.department?.id === d.id).length;
      const share = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
      return {
        id: d.id,
        code: d.departmentCode,
        name: d.departmentName,
        count,
        share,
      };
    });
  }, [departments, employees]);

  // Attendance rate
  const attendanceRate = attendance.length > 0 && employees.length > 0
    ? Math.round((attendance.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length / attendance.length) * 100)
    : 100;

  // Export CSV
  const handleExportCsv = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Enterprise Reports & Workforce Analytics
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 text-white rounded">
              STATUTORY AUDIT & LEDGER
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Reconciliation registers for monthly payroll, attendance logs, leave accrual balances, and headcount distribution
          </p>
        </div>

        {/* Dynamic Contextual Action */}
        <div className="flex items-center gap-2">
          {activeTab === "attendance" && (
            <button
              onClick={() => {
                const rows = [
                  ["Employee Code", "Employee Name", "Department", "Attendance Date", "Status", "Working Hours"],
                  ...attendance.map((a) => [
                    a.employee?.employeeCode || "",
                    `"${a.employee?.firstName} ${a.employee?.lastName}"`,
                    `"${a.employee?.department?.departmentName || ""}"`,
                    a.attendanceDate || "",
                    a.status || "",
                    String(a.workingHours || 8),
                  ]),
                ];
                handleExportCsv("Monthly_Attendance_Register", rows);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Attendance Register (CSV)
            </button>
          )}

          {activeTab === "payroll" && (
            <button
              onClick={() => {
                const rows = [
                  ["Slip No", "Employee Code", "Employee Name", "Gross Pay", "Total Deductions", "Net Pay", "Status"],
                  ...slips.map((s) => [
                    s.slipNumber || "",
                    s.employee?.employeeCode || "",
                    `"${s.employee?.firstName} ${s.employee?.lastName}"`,
                    String(s.grossPay || 0),
                    String(s.totalDeductions || 0),
                    String(s.netPay || 0),
                    s.status || "",
                  ]),
                ];
                handleExportCsv("Salary_Disbursement_Register", rows);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Salary Register (CSV)
            </button>
          )}

          {activeTab === "headcount" && (
            <button
              onClick={() => {
                const rows = [
                  ["Department Code", "Department Name", "Headcount", "Percentage Share"],
                  ...deptBreakdown.map((d) => [d.code, `"${d.name}"`, String(d.count), `${d.share}%`]),
                ];
                handleExportCsv("Headcount_Distribution_Report", rows);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Headcount Report (CSV)
            </button>
          )}
        </div>
      </div>

      {/* 2. Dynamic KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Total Enrolled Headcount</span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{employees.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Active organizational staff</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Net Disbursed Compensation</span>
            <Banknote className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{formatCurrency(totalNet)}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Payroll vouchers disbursed</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Compliance Attendance Rate</span>
            <CalendarCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{attendanceRate}%</div>
          <div className="text-[10px] text-zinc-500 font-mono">Punctuality and presence</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Active Cost Centers</span>
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{departments.length} Units</div>
          <div className="text-[10px] text-zinc-500 font-mono">Department divisions</div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-0.5 text-xs font-medium">
        <button
          onClick={() => handleTabChange("attendance")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "attendance"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Monthly Attendance Register
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {attendance.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("payroll")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "payroll"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          Monthly Salary Register
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {slips.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("headcount")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "headcount"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Headcount & Distribution
        </button>

        <button
          onClick={() => handleTabChange("leaves")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "leaves"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Leave Balances Summary
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {leaves.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("anniversaries")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "anniversaries"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Work Anniversaries
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {employees.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* TAB A: MONTHLY ATTENDANCE REGISTER */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Comprehensive Daily Attendance Ledger</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{attendance.length} Total Punches</span>
          </div>

          {attendance.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <CalendarCheck className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Attendance Records Logged</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No attendance punch entries have been logged in the system.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">In Time</th>
                    <th className="py-2.5 px-3">Out Time</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{a.attendanceDate}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {a.employee?.firstName} {a.employee?.lastName}
                        <span className="block text-[10px] font-mono text-zinc-500">{a.employee?.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">{a.employee?.department?.departmentName || "General"}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{a.inTime || "09:00"}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{a.outTime || "--:--"}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{a.workingHours || 8} hrs</td>
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

      {/* TAB B: MONTHLY SALARY REGISTER */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Salary Disbursement & Statutory Tax Reconciliation</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{slips.length} Vouchers</span>
          </div>

          {slips.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Banknote className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Salary Slips on Record</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Execute a monthly batch payroll run to generate salary register records.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Slip Voucher</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Gross Pay</th>
                    <th className="py-2.5 px-3">Deductions</th>
                    <th className="py-2.5 px-3">Net Disbursed</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {slips.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{s.slipNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {s.employee?.firstName} {s.employee?.lastName}
                        <span className="block text-[10px] font-mono text-zinc-500">{s.employee?.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">{s.employee?.department?.departmentName || "General"}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{formatCurrency(s.grossPay)}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">-{formatCurrency(s.totalDeductions)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{formatCurrency(s.netPay)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {s.status}
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

      {/* TAB C: HEADCOUNT & DISTRIBUTION */}
      {activeTab === "headcount" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Department Workforce Distribution</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{departments.length} Units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptBreakdown.map((dept) => (
              <div key={dept.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-xs text-zinc-900">{dept.name}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {dept.code}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-bold font-mono text-zinc-900">{dept.count} Members</span>
                  <span className="text-xs font-mono text-zinc-500">{dept.share}% Share</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-900 h-full" style={{ width: `${dept.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: LEAVE BALANCES SUMMARY */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Leave Applications & Utilization Audit</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{leaves.length} Applications</span>
          </div>

          {leaves.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Calendar className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Leave Records Found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No leave requests logged in the system.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Policy Type</th>
                    <th className="py-2.5 px-3">From Date</th>
                    <th className="py-2.5 px-3">To Date</th>
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {leaves.map((l) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB E: WORK ANNIVERSARIES */}
      {activeTab === "anniversaries" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Employee Tenure & Milestone Anniversaries</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{employees.length} Staff Enrolled</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Employee Code</th>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Date of Joining</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{e.employeeCode}</td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700">{e.department?.departmentName || "General"}</td>
                    <td className="py-2.5 px-3 text-zinc-700">{e.designation?.designationName || "Employee"}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{e.dateOfJoining}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-400 font-mono">
          Loading Reports & Analytics Command Center...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
