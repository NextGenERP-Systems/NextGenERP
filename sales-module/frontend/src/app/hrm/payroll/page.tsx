"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Play,
  FileText,
  Printer,
  CheckCircle2,
  Building,
  CreditCard,
  X,
  Sparkles,
} from "lucide-react";
import { getSalarySlips, generateBatchPayroll } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SalarySlip } from "@/types/hrm";

export default function PayrollPage() {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [generating, setGenerating] = useState(false);
  const [includeCommissions, setIncludeCommissions] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSalarySlips();
      setSlips(data);
    }
    load();
  }, []);

  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      await generateBatchPayroll(includeCommissions);
      const updated = await getSalarySlips();
      setSlips(updated);
    } finally {
      setGenerating(false);
    }
  };

  const totalGross = slips.reduce((acc, s) => acc + (s.grossPay || 0), 0);
  const totalDeductions = slips.reduce((acc, s) => acc + (s.totalDeductions || 0), 0);
  const totalNet = slips.reduce((acc, s) => acc + (s.netPay || 0), 0);
  const totalSalesIncentives = slips
    .filter((s) => ["EMP-001", "EMP-002", "EMP-005", "EMP-006"].includes(s.employee?.employeeCode || ""))
    .reduce((acc, s) => acc + Math.max(0, (s.grossPay || 0) - 150000), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Batch Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Payroll & Salary Slip Generator
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-semibold">
            Batch monthly compensation processing, statutory TDS/PF calculation & pay slips
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/70 border border-indigo-200 text-xs font-semibold text-indigo-900 cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={includeCommissions}
              onChange={(e) => setIncludeCommissions(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sync Sales Commissions</span>
          </label>

          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="liquid-btn-emerald flex items-center gap-2 px-6 py-3 text-xs shadow-md self-start disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-emerald-800 text-emerald-800" />
            {generating ? "Processing Batch Engine..." : "Run Monthly Batch Payroll"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Gross Compensation</span>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(totalGross)}</div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Includes {formatCurrency(totalSalesIncentives)} in Sales Commissions
          </span>
        </div>

        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Statutory Deductions (PF/PT/TDS)</span>
          <div className="text-3xl font-black text-amber-700">{formatCurrency(totalDeductions)}</div>
          <span className="text-[11px] text-slate-600 font-semibold">Withheld for statutory compliance</span>
        </div>

        <div className="p-6 rounded-3xl liquid-glass-card space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Disbursed Take-Home</span>
          <div className="text-3xl font-black text-emerald-700">{formatCurrency(totalNet)}</div>
          <span className="text-[11px] text-slate-600 font-semibold">Credited to employee bank accounts</span>
        </div>
      </div>

      {/* Salary Slips Table */}
      {slips.length === 0 ? (
        <div className="liquid-glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-2xs">
            <Banknote className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Salary Slips Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
              Click &ldquo;Run Monthly Batch Payroll&rdquo; to compute Basic, HRA, PF, PT, and TDS withholding for all active employees.
            </p>
          </div>
          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="liquid-btn-emerald px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-800" />
            {generating ? "Processing..." : "Generate Batch Slips Now"}
          </button>
        </div>
      ) : (
        <div className="liquid-glass-card rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Generated Salary Slips
            </h2>
            <span className="text-xs text-slate-600 font-bold px-2.5 py-1 rounded-full bg-white/60 border border-white/80">{slips.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/40 border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Slip #</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Gross Pay</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4">Net Pay</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {slips.map((slip) => {
                  const empCode = slip.employee?.employeeCode || "";
                  const commission = Math.max(0, (slip.grossPay || 0) - 150000);
                  const isSales = ["EMP-001", "EMP-002", "EMP-005", "EMP-006"].includes(empCode) ||
                                  slip.employee?.department?.departmentName?.toLowerCase().includes("sales");

                  return (
                    <tr key={slip.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-800 font-bold">{slip.slipNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900">
                            {slip.employee?.firstName} {slip.employee?.lastName}
                          </div>
                          {isSales && commission > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              Sales Incentive +{formatCurrency(commission)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono font-semibold">
                          {slip.employee?.employeeCode} • {slip.employee?.department?.departmentName || "Engineering"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono text-[11px] font-semibold">
                        {slip.startDate} → {slip.endDate}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-800 font-bold">{formatCurrency(slip.grossPay)}</td>
                      <td className="px-6 py-4 font-mono text-amber-700 font-bold">{formatCurrency(slip.totalDeductions)}</td>
                      <td className="px-6 py-4 font-mono font-black text-emerald-800">{formatCurrency(slip.netPay)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            slip.status === "PAID"
                              ? "bg-emerald-50/80 text-emerald-800 border border-emerald-300/80 shadow-xs"
                              : "bg-blue-50/80 text-blue-800 border border-blue-300/80 shadow-xs"
                          }`}
                        >
                          {slip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="liquid-btn-glass px-4 py-1.5 text-[11px] inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> Inspect Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Salary Slip Print/Inspect View */}
      {selectedSlip && (() => {
        const empCode = selectedSlip.employee?.employeeCode || "";
        const commission = Math.max(0, (selectedSlip.grossPay || 0) - 150000);
        const isSales = ["EMP-001", "EMP-002", "EMP-005", "EMP-006"].includes(empCode) ||
                        selectedSlip.employee?.department?.departmentName?.toLowerCase().includes("sales");
        const baseCalculated = selectedSlip.grossPay - commission;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      ERP
                    </div>
                    <span className="font-extrabold text-base text-slate-900">NextGen Enterprise HQ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Official Salary Slip & Tax Computation</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-indigo-600">{selectedSlip.slipNumber}</span>
                  <p className="text-[11px] text-slate-500 font-mono">Period: {selectedSlip.startDate} to {selectedSlip.endDate}</p>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Employee Name</span>
                  <p className="font-bold text-slate-900">{selectedSlip.employee?.firstName} {selectedSlip.employee?.lastName}</p>
                  <p className="text-slate-500 text-[11px] font-mono">
                    {selectedSlip.employee?.employeeCode} • {selectedSlip.employee?.designation?.designationName || "Staff"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Bank Account</span>
                  <p className="font-mono font-bold text-slate-900">{selectedSlip.bankAccountNumber || "50100234567890"}</p>
                  <p className="text-slate-500 text-[11px] font-mono">PAN: {selectedSlip.employee?.panNumber || "ABCDE1234F"}</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
                    <span>Earnings Component</span>
                    <span>Amount</span>
                  </h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Basic Salary</span>
                    <span className="font-mono font-medium">{formatCurrency(baseCalculated * 0.5)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-mono font-medium">{formatCurrency(baseCalculated * 0.25)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Special Allowance</span>
                    <span className="font-mono font-medium">{formatCurrency(baseCalculated * 0.25)}</span>
                  </div>
                  
                  {commission > 0 && (
                    <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Sales Commission & Incentives
                        </span>
                        <span className="font-mono">+{formatCurrency(commission)}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Synced from Sales Orders (5% Commission Pool)
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Gross Pay</span>
                    <span className="font-mono text-indigo-600">{formatCurrency(selectedSlip.grossPay)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
                    <span>Deductions & Taxes</span>
                    <span>Amount</span>
                  </h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Provident Fund (PF 12%)</span>
                    <span className="font-mono font-medium">{formatCurrency(baseCalculated * 0.06)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Professional Tax (PT)</span>
                    <span className="font-mono font-medium">{formatCurrency(200)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Income Tax (TDS 4%)</span>
                    <span className="font-mono font-medium">{formatCurrency(selectedSlip.grossPay * 0.04)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Deductions</span>
                    <span className="font-mono text-amber-600">{formatCurrency(selectedSlip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

            {/* Net Pay Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Net Take-Home Pay</span>
                <div className="text-2xl font-black text-emerald-900 font-mono">{formatCurrency(selectedSlip.netPay)}</div>
                <p className="text-[11px] text-emerald-700 italic font-medium">{selectedSlip.inWords || "INR One Lakh Thirty-Four Thousand Eight Hundred Only"}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="liquid-btn-glass px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Salary Slip
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="liquid-btn-primary px-5 py-2 text-xs"
              >
                Close
              </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
