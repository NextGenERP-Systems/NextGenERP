"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getAttendance, punchInEmployee, getEmployees } from "@/lib/api";
import { AttendanceRecord, Employee } from "@/types/hrm";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    async function load() {
      const [attData, empData] = await Promise.all([getAttendance(), getEmployees()]);
      setAttendance(attData);
      setEmployees(empData);
      if (empData.length > 0) {
        setSelectedEmpId(empData[0].id);
      }
    }
    load();
  }, []);

  const handlePunchIn = async () => {
    if (!selectedEmpId) return;
    setPunching(true);
    try {
      const rec = await punchInEmployee(selectedEmpId);
      setAttendance((prev) => [rec, ...prev]);
    } finally {
      setPunching(false);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Attendance & Shift Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-semibold">
            Real-time biometric logs, web check-ins, working hours, and shift roster matrix
          </p>
        </div>

        {/* Punch-In Widget */}
        <div className="flex items-center gap-3 liquid-glass p-2 rounded-full self-start">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-4 py-2 text-xs bg-white/80 border border-white/90 rounded-full text-slate-900 focus:outline-none focus:border-indigo-300 font-bold shadow-xs ml-1"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.employeeCode})
              </option>
            ))}
          </select>

          <button
            onClick={handlePunchIn}
            disabled={punching}
            className="liquid-btn-emerald flex items-center gap-2 px-5 py-2 text-xs disabled:opacity-50 shadow-md"
          >
            <Clock className="w-3.5 h-3.5" />
            {punching ? "Punching..." : "Punch In Now"}
          </button>
        </div>
      </div>

      {/* Date Banner & Summary */}
      <div className="p-5 rounded-3xl liquid-glass flex items-center justify-between">
        <div className="flex items-center gap-3.5 text-xs text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-extrabold text-slate-900">{todayStr}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Shift Cycle: 09:00 AM - 06:00 PM (8.00 hrs)</span>
        </div>
        <div className="text-xs text-emerald-800 font-extrabold bg-emerald-50/80 px-3.5 py-1 rounded-full border border-emerald-300/80 shadow-xs">
          {attendance.filter((a) => a.status === "PRESENT").length} Present Today
        </div>
      </div>

      {/* Table of Attendance Logs */}
      <div className="liquid-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/40 border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">In Time</th>
                <th className="px-6 py-4">Working Hours</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {rec.employee.firstName} {rec.employee.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono font-semibold">{rec.employee.employeeCode}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">
                    {rec.employee.department?.departmentName || "Engineering"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        rec.status === "PRESENT"
                          ? "bg-emerald-50/80 text-emerald-800 border border-emerald-300/80"
                          : rec.status === "WORK_FROM_HOME"
                          ? "bg-blue-50/80 text-blue-800 border border-blue-300/80"
                          : "bg-amber-50/80 text-amber-800 border border-amber-300/80"
                      }`}
                    >
                      {rec.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-800 font-bold">
                    {rec.inTime || "09:00 AM"}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-800 font-bold">
                    {rec.workingHours} hrs
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic font-medium">
                    {rec.remarks || "Standard check-in"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
