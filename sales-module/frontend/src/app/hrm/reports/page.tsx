"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  Building,
  Banknote,
  CalendarCheck,
  Award,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getEmployees,
  getSalarySlips,
  getAttendance,
  getLeaveApplications,
  MOCK_DEPARTMENTS,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Employee, SalarySlip, AttendanceRecord, LeaveApplication } from "@/types/hrm";

const PALETTE = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, slipData, attData, leaveData] = await Promise.all([
          getEmployees(),
          getSalarySlips(),
          getAttendance(),
          getLeaveApplications(),
        ]);
        setEmployees(empData);
        setSlips(slipData);
        setAttendance(attData);
        setLeaves(leaveData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 1. Department Headcount Distribution (Computed 100% dynamically from live employees)
  const deptCountMap: { [key: string]: number } = {};
  employees.forEach((emp) => {
    const deptName = emp.department?.departmentName || "General Engineering";
    deptCountMap[deptName] = (deptCountMap[deptName] || 0) + 1;
  });

  const deptChartData = Object.entries(deptCountMap).map(([departmentName, count]) => ({
    departmentName: departmentName.length > 22 ? `${departmentName.substring(0, 20)}...` : departmentName,
    fullName: departmentName,
    count,
  }));

  // 2. Dynamic Monthly Payroll Trajectory (Computed from real salary slips)
  const payrollMonthMap: { [key: string]: { totalGross: number; totalNet: number; totalDeductions: number; count: number } } = {};
  slips.forEach((slip) => {
    const month = slip.startDate ? new Date(slip.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Aug 2026";
    if (!payrollMonthMap[month]) {
      payrollMonthMap[month] = { totalGross: 0, totalNet: 0, totalDeductions: 0, count: 0 };
    }
    payrollMonthMap[month].totalGross += slip.grossPay || 0;
    payrollMonthMap[month].totalNet += slip.netPay || 0;
    payrollMonthMap[month].totalDeductions += slip.totalDeductions || 0;
    payrollMonthMap[month].count += 1;
  });

  const payrollChartData = Object.entries(payrollMonthMap).map(([month, stats]) => ({
    month,
    totalGross: stats.totalGross,
    totalNet: stats.totalNet,
    totalDeductions: stats.totalDeductions,
    slipsCount: stats.count,
  }));

  // Summary Metrics
  const totalGrossDisbursed = slips.reduce((sum, s) => sum + (s.grossPay || 0), 0);
  const totalNetDisbursed = slips.reduce((sum, s) => sum + (s.netPay || 0), 0);
  const totalStatutoryDeductions = slips.reduce((sum, s) => sum + (s.totalDeductions || 0), 0);
  const avgGrossPerEmployee = employees.length > 0 ? totalGrossDisbursed / employees.length : 0;
  const presentCount = attendance.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            HR Analytics & Headcount Velocity
            <span className="text-xs px-3 py-0.5 rounded-full bg-indigo-500/15 text-indigo-800 border border-indigo-400/50 font-bold backdrop-blur-md">
              Real-Time Dynamic
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Live database aggregations: Department distribution, payroll disbursements, and attendance metrics
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl liquid-glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Headcount</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{employees.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            {employees.filter((e) => e.status === "ACTIVE").length} Active in Database
          </p>
        </div>

        <div className="p-6 rounded-2xl liquid-glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Gross Disbursed</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalGrossDisbursed)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Across {slips.length} Generated Salary Slips
          </p>
        </div>

        <div className="p-6 rounded-2xl liquid-glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Statutory Taxes (PF/PT/TDS)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalStatutoryDeductions)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Net In-Hand: {formatCurrency(totalNetDisbursed)}
          </p>
        </div>

        <div className="p-6 rounded-2xl liquid-glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Today&apos;s Attendance</span>
            <CalendarCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{attendance.length} Logs</div>
          <p className="text-[11px] text-slate-500 font-medium">
            {leaves.filter((l) => l.status === "APPROVED").length} Approved on Leave
          </p>
        </div>
      </div>

      {/* Grid: Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payroll Expenditure Chart */}
        <div className="p-6 rounded-2xl liquid-glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Payroll Expenditure (INR)</h3>
              <p className="text-xs text-slate-500 font-medium">Gross vs Net Disbursed Compensation</p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold">{slips.length} Slips Total</span>
          </div>

          {payrollChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <Banknote className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">No Payroll Generated Yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Generate salary slips to see live financial trajectories</p>
              </div>
              <Link
                href="/hrm/payroll"
                className="liquid-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                Go to Payroll Engine <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "16px", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Bar dataKey="totalGross" name="Gross Pay" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="totalNet" name="Net Disbursed" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Headcount Distribution Chart */}
        <div className="p-6 rounded-2xl liquid-glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount Distribution</h3>
              <p className="text-xs text-slate-500 font-medium">Computed live from active employee profiles</p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold">{employees.length} Members</span>
          </div>

          {deptChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">No Employees Found</p>
                <p className="text-xs text-slate-400 mt-0.5">Onboard team members to see functional departmental distribution</p>
              </div>
              <Link
                href="/hrm/employees"
                className="liquid-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                Onboard Employee <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    dataKey="count"
                    nameKey="fullName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label={({ fullName, percent }) => `${fullName.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deptChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "16px", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
