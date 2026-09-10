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

const PALETTE = ["#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

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

  // 1. Department Headcount Distribution
  const deptCountMap: { [key: string]: number } = {};
  employees.forEach((emp) => {
    const deptName = emp.department?.departmentName || "Engineering";
    deptCountMap[deptName] = (deptCountMap[deptName] || 0) + 1;
  });

  const deptChartData = Object.entries(deptCountMap).map(([departmentName, count]) => ({
    departmentName: departmentName.length > 22 ? `${departmentName.substring(0, 20)}...` : departmentName,
    fullName: departmentName,
    count,
  }));

  // 2. Monthly Payroll Trajectory
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

  const totalPayrollGross = slips.reduce((acc, s) => acc + (s.grossPay || 0), 0);
  const totalPayrollNet = slips.reduce((acc, s) => acc + (s.netPay || 0), 0);
  const totalTaxPFDeductions = slips.reduce((acc, s) => acc + (s.totalDeductions || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Real-Time HRM Reports & Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Dynamic aggregations computed from active PostgreSQL database tables
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hrm/payroll"
            className="liquid-btn-glass flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
          >
            <Banknote className="w-3.5 h-3.5 text-slate-700" />
            Payroll Slips
          </Link>
          <Link
            href="/hrm/employees"
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-slate-800" />
            Employee 360
          </Link>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Organization Headcount</span>
          <div className="text-3xl font-black text-slate-900">{employees.length} Employees</div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {employees.filter((e) => e.status === "ACTIVE").length} Active on Payroll
          </span>
        </div>

        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Disbursed Payroll</span>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(totalPayrollGross)}</div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Net In-Hand: {formatCurrency(totalPayrollNet)}
          </span>
        </div>

        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Statutory Deductions (PF/PT/TDS)</span>
          <div className="text-3xl font-black text-slate-700">{formatCurrency(totalTaxPFDeductions)}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Withheld & Remitted</span>
        </div>
      </div>

      {/* Live Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Donut Chart */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-700" />
              Department Headcount Distribution
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{deptChartData.length} Departments</span>
          </div>

          {deptChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No employees onboarded to visualize departments.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="fullName"
                  >
                    {deptChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "1rem",
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(12px)",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Payroll Expenditure Bar Chart */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              Monthly Payroll Expenditure
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{payrollChartData.length} Payroll Cycles</span>
          </div>

          {payrollChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No salary slips generated yet. Run batch payroll to visualize monthly trends.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.4)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), "Amount"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "1rem",
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(12px)",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="totalGross" name="Gross Pay" fill="#334155" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalNet" name="Net Take-Home" fill="#64748b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
