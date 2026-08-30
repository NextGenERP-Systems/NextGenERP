"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  User,
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
      const record = await punchInEmployee(selectedEmpId);
      setAttendance((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
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
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Real-time biometric logs, web check-ins, working hours, and shift roster matrix
          </p>
        </div>

        {/* Punch-In Widget */}
        <div className="flex items-center gap-2.5 liquid-glass p-2 rounded-full self-start">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-4 py-2 text-xs bg-white/60 border border-white/70 rounded-full text-slate-900 focus:outline-none font-bold ml-1"
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
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2 text-xs disabled:opacity-50 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-800" />
            {punching ? "Punching..." : "Punch In Now"}
          </button>
        </div>
      </div>

      {/* Date Banner & Summary */}
      <div className="p-5 rounded-2xl liquid-glass flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-700">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-900">{todayStr}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Shift: 09:00 AM - 06:00 PM (8.00 hrs)</span>
        </div>
        <div className="text-xs text-slate-800 font-bold liquid-glass px-3.5 py-1 rounded-full">
          {attendance.filter((a) => a.status === "PRESENT").length} Present Today
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="liquid-glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/60 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daily Attendance Logs
          </h2>
          <span className="text-xs text-slate-500 font-medium">{attendance.length} Total Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">In Time</th>
                <th className="px-6 py-4">Working Hours</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {rec.employee?.firstName} {rec.employee?.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{rec.employee?.employeeCode}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {rec.employee?.designation?.designationName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{rec.attendanceDate}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{rec.inTime || "09:00 AM"}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">{rec.workingHours || 8.0} hrs</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass text-slate-800">
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>{rec.remarks || "Web Punch-In Verified"}</span>
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
