"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getHrmDashboardKpis,
  getEmployees,
  getAttendance,
  getLeaveApplications,
  approveLeave,
  punchInEmployee,
} from "@/lib/api";
import {
  HrmDashboardKpis,
  Employee,
  AttendanceRecord,
  LeaveApplication,
} from "@/types/hrm";

export default function HrmDashboardPage() {
  const [kpis, setKpis] = useState<HrmDashboardKpis | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiData, empData, attData, leaveData] = await Promise.all([
          getHrmDashboardKpis(),
          getEmployees(),
          getAttendance(),
          getLeaveApplications(),
        ]);
        setKpis(kpiData);
        setEmployees(empData);
        setAttendance(attData);
        setLeaves(leaveData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApproveLeave = async (id: string) => {
    const updated = await approveLeave(id);
    if (updated) {
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l)));
    }
  };

  const handlePunchIn = async () => {
    if (employees.length > 0) {
      const record = await punchInEmployee(employees[0].id);
      setAttendance((prev) => [record, ...prev]);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Human Resources Management
            <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-400/50 font-bold backdrop-blur-md">
              Live Operations
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Enterprise People 360, Shift Attendance, Leave Balance Engine & Automated Payroll
          </p>
        </div>

        <div className="flex items-center gap-3">
          {employees.length > 0 && (
            <button
              onClick={handlePunchIn}
              className="liquid-btn-glass flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              Quick Punch-In
            </button>
          )}
          <Link
            href="/hrm/employees"
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-md"
          >
            <UserPlus className="w-4 h-4 text-white" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards (Apple Liquid Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="liquid-glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50/80 text-indigo-700 border border-indigo-100/80 shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{employees.length}</span>
            {employees.length > 0 && (
              <span className="text-xs text-emerald-700 font-bold flex items-center bg-emerald-50/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +100% Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {employees.filter((e) => e.status === "ACTIVE").length} Active • {employees.filter((e) => e.status === "PROBATION").length} On Probation
          </p>
        </div>

        <div className="liquid-glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50/80 text-emerald-700 border border-emerald-100/80 shadow-2xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{attendance.length}</span>
            <span className="text-xs text-slate-500 font-medium">
              of {employees.length} logged
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {leaves.filter((l) => l.status === "APPROVED").length} Approved On Leave
          </p>
        </div>

        <div className="liquid-glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll Cost</span>
            <div className="p-2.5 rounded-2xl bg-slate-100/80 text-slate-700 border border-slate-200/80 shadow-2xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis?.monthlyPayrollExpenditure || 0)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Gross Disbursed with Statutory Deductions
          </p>
        </div>

        <div className="liquid-glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Vacancies</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50/80 text-indigo-700 border border-indigo-100/80 shadow-2xs">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{kpis?.openJobOpenings || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Active Postings</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Engineering & Enterprise Sales
          </p>
        </div>
      </div>

      {/* Grid: Attendance Stream & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Attendance Log */}
        <div className="lg:col-span-2 p-6 liquid-glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Today&apos;s Shift Attendance Logs</h2>
              <p className="text-xs text-slate-500 font-medium">Biometric & Web Check-in punches</p>
            </div>
            <Link
              href="/hrm/attendance"
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 transition-colors"
            >
              View Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attendance.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 space-y-3">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-bold text-slate-700 text-sm">No attendance records yet today</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Onboard an employee or record a punch to see live shifts</p>
              </div>
              {employees.length === 0 ? (
                <Link
                  href="/hrm/employees"
                  className="liquid-btn-primary px-4 py-2 text-xs inline-flex"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Create Your First Employee
                </Link>
              ) : (
                <button
                  onClick={handlePunchIn}
                  className="liquid-btn-glass px-4 py-2 text-xs inline-flex"
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Punch-In Now
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/40">
              {attendance.slice(0, 5).map((record) => (
                <div key={record.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/90 flex items-center justify-center font-bold text-slate-800 shadow-2xs">
                      {record.employee.firstName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {record.employee.firstName} {record.employee.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">{record.employee.designation?.designationName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === "PRESENT"
                          ? "bg-emerald-50/90 text-emerald-800 border border-emerald-300/80"
                          : record.status === "WORK_FROM_HOME"
                          ? "bg-blue-50/90 text-blue-800 border border-blue-300/80"
                          : "bg-amber-50/90 text-amber-800 border border-amber-300/80"
                      }`}
                    >
                      {record.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-600 font-mono font-bold">{record.inTime || "09:00 AM"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Leave Requests */}
        <div className="p-6 liquid-glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Pending Leave Requests</h2>
              <p className="text-xs text-slate-500 font-medium">Awaiting HR manager action</p>
            </div>
            <Link
              href="/hrm/leaves"
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 transition-colors"
            >
              All Leaves <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {leaves.filter((l) => l.status === "PENDING").length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-slate-800">All caught up!</p>
                <p className="text-[11px]">No pending leave applications</p>
              </div>
            ) : (
              leaves
                .filter((l) => l.status === "PENDING")
                .map((leave) => (
                  <div key={leave.id} className="p-4 rounded-2xl liquid-glass space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[10px] text-slate-700 font-bold border border-white/90 shadow-2xs">
                        {leave.leaveType.leaveTypeCode} ({leave.totalLeaveDays}d)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">&ldquo;{leave.reason}&rdquo;</p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/40 text-[11px]">
                      <span className="text-slate-500 font-medium">{leave.fromDate}</span>
                      <button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="liquid-btn-emerald px-3.5 py-1.5 text-xs shadow-xs"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
