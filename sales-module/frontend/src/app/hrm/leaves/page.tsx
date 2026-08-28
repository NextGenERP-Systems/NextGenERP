"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import {
  getLeaveApplications,
  applyLeave,
  approveLeave,
  rejectLeave,
  getEmployees,
  MOCK_LEAVE_TYPES,
} from "@/lib/api";
import { LeaveApplication, Employee } from "@/types/hrm";

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveTypeId: MOCK_LEAVE_TYPES[0].id,
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    totalLeaveDays: 1,
    isHalfDay: false,
    reason: "",
  });

  useEffect(() => {
    async function load() {
      const [leaveData, empData] = await Promise.all([getLeaveApplications(), getEmployees()]);
      setLeaves(leaveData);
      setEmployees(empData);
      if (empData.length > 0) {
        setNewLeave((prev) => ({ ...prev, employeeId: empData[0].id }));
      }
    }
    load();
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
    if (updated) {
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l)));
    }
  };

  const handleReject = async (id: string) => {
    const updated = await rejectLeave(id);
    if (updated) {
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "REJECTED" } : l)));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Leave Management Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-semibold">
            Leave allocation policies, carry-forward accruals, and manager approval workflows
          </p>
        </div>

        {/* Liquid Primary Action Button */}
        <button
          onClick={() => setShowApplyModal(true)}
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs self-start"
        >
          <PlusCircle className="w-4 h-4 text-indigo-700" />
          Apply For Leave
        </button>
      </div>

      {/* Leave Type Allocation Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MOCK_LEAVE_TYPES.map((type) => (
          <div key={type.id} className="p-6 rounded-3xl liquid-glass-card space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">{type.leaveTypeName}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-slate-700 font-mono text-[10px] font-bold border border-white/90 shadow-xs">
                {type.leaveTypeCode}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{type.maxDaysAllowed} Days</span>
              <span className="text-[11px] text-slate-600 font-semibold">allocated/yr</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">
              {type.isCarryForward ? "✓ Carry Forward Enabled" : "✗ Use it or lose it"}
            </p>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="liquid-glass-card rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-white/60 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            All Leave Applications
          </h2>
          <span className="text-xs text-slate-600 font-bold px-2.5 py-1 rounded-full bg-white/60 border border-white/80">{leaves.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/40 border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">App #</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Total Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-semibold">{leave.applicationNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {leave.employee.firstName} {leave.employee.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/80 text-slate-700 font-mono text-[10px] font-bold border border-white/90 shadow-xs">
                      {leave.leaveType.leaveTypeCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-mono text-[11px] font-semibold">
                    {leave.fromDate} → {leave.toDate}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">{leave.totalLeaveDays} d</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate italic font-medium">
                    &ldquo;{leave.reason}&rdquo;
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        leave.status === "APPROVED"
                          ? "bg-emerald-50/80 text-emerald-800 border border-emerald-300/80 shadow-xs"
                          : leave.status === "PENDING"
                          ? "bg-amber-50/80 text-amber-800 border border-amber-300/80 shadow-xs"
                          : "bg-rose-50/80 text-rose-800 border border-rose-300/80 shadow-xs"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {leave.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="liquid-btn-emerald px-3.5 py-1.5 text-[11px] flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="liquid-btn-rose px-3.5 py-1.5 text-[11px] flex items-center gap-1.5 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-bold">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-3xl bg-white/90">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Submit Leave Application</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Employee</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/80 border border-white/90 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-400 font-semibold shadow-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
                <select
                  value={newLeave.leaveTypeId}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveTypeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/80 border border-white/90 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-400 font-semibold shadow-xs"
                >
                  {MOCK_LEAVE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.leaveTypeName} ({t.leaveTypeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">From Date</label>
                  <input
                    type="date"
                    value={newLeave.fromDate}
                    onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/80 border border-white/90 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-400 font-semibold shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">To Date</label>
                  <input
                    type="date"
                    value={newLeave.toDate}
                    onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/80 border border-white/90 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-400 font-semibold shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Explain the reason for leave..."
                  className="w-full px-3.5 py-2 bg-white/80 border border-white/90 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-400 font-semibold shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="liquid-btn-glass px-5 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2 text-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
