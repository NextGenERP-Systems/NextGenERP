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
            <span className="text-xs px-3 py-0.5 rounded-full liquid-glass text-slate-800 font-bold">
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
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-slate-800" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="liquid-glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-xl liquid-glass text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{employees.length}</span>
            {employees.length > 0 && (
              <span className="text-xs text-slate-700 font-bold flex items-center liquid-glass px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Live
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
            <div className="p-2 rounded-xl liquid-glass text-slate-700">
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
            <div className="p-2 rounded-xl liquid-glass text-slate-700">
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
            <div className="p-2 rounded-xl liquid-glass text-slate-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{kpis?.openJobOpenings || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Active Postings</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Engineering & Enterprise Roles
          </p>
        </div>
      </div>

      {/* Quick Launchpad & Pending Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Submodules Quick Launchpad */}
        <div className="lg:col-span-2 liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              HR Core Modules Launchpad
            </h2>
            <span className="text-xs text-slate-500 font-medium">9 active sub-modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              href="/hrm/employees"
              className="p-4 rounded-2xl liquid-glass hover:bg-white/60 transition-all flex items-start gap-3.5 group shadow-2xs"
            >
              <div className="p-3 rounded-xl liquid-glass text-slate-800">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Employee 360</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Profiles, hierarchy, statutory info & documents</p>
              </div>
            </Link>

            <Link
              href="/hrm/attendance"
              className="p-4 rounded-2xl liquid-glass hover:bg-white/60 transition-all flex items-start gap-3.5 group shadow-2xs"
            >
              <div className="p-3 rounded-xl liquid-glass text-slate-800">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Attendance & Shifts</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Punch-in logs, shifts, working hours & overtime</p>
              </div>
            </Link>

            <Link
              href="/hrm/leaves"
              className="p-4 rounded-2xl liquid-glass hover:bg-white/60 transition-all flex items-start gap-3.5 group shadow-2xs"
            >
              <div className="p-3 rounded-xl liquid-glass text-slate-800">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Leave Balance Engine</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Policy limits, PL/CL/SL requests & approval flows</p>
              </div>
            </Link>

            <Link
              href="/hrm/payroll"
              className="p-4 rounded-2xl liquid-glass hover:bg-white/60 transition-all flex items-start gap-3.5 group shadow-2xs"
            >
              <div className="p-3 rounded-xl liquid-glass text-slate-800">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Batch Payroll & Slips</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Batch execution, PF/PT/TDS & printable pay slips</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Pending Action Center */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Pending Actions
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full liquid-glass text-slate-700">
              {leaves.filter((l) => l.status === "PENDING").length} Requests
            </span>
          </div>

          <div className="space-y-3">
            {leaves.filter((l) => l.status === "PENDING").length === 0 ? (
              <div className="p-6 rounded-2xl liquid-glass text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">All Clear!</p>
                <p className="text-[11px] text-slate-500">No pending leave applications or approvals.</p>
              </div>
            ) : (
              leaves
                .filter((l) => l.status === "PENDING")
                .map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-2xl liquid-glass space-y-2 border border-white/70"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leave.leaveType?.leaveTypeName} • {leave.totalLeaveDays} Days
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md liquid-glass text-slate-700">
                        {leave.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/40">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {leave.fromDate} → {leave.toDate}
                      </span>
                      <button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="liquid-btn-primary px-3 py-1 text-[11px] font-bold shadow-2xs"
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
