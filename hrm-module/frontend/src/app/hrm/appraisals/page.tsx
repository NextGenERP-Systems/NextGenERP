"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Building,
  UserCheck,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { getAppraisals, createAppraisal, getEmployees } from "@/lib/api";
import { EmployeeAppraisal, Employee } from "@/types/hrm";

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState<EmployeeAppraisal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [newAppraisal, setNewAppraisal] = useState({
    employeeId: "",
    managerId: "",
    appraisalCycle: "FY 2026-27 Q2 Review",
    selfScore: 4.5,
    managerScore: 4.8,
    remarks: "Exemplary performance, delivered major platform deliverables ahead of schedule.",
    promotionRecommended: true,
    incrementPercentage: 15.0,
  });

  useEffect(() => {
    async function load() {
      const [aprData, empData] = await Promise.all([getAppraisals(), getEmployees()]);
      setAppraisals(aprData);
      setEmployees(empData);
      if (empData.length > 0) {
        setNewAppraisal((prev) => ({
          ...prev,
          employeeId: empData[0].id,
          managerId: empData[0].id,
        }));
      }
    }
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createAppraisal(newAppraisal);
    setAppraisals((prev) => [created, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Performance Reviews & Appraisals
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            KRA evaluation scorecards, peer feedback, manager ratings & promotion recommendations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-md self-start"
        >
          <Award className="w-4 h-4 text-white" />
          + Conduct Performance Review
        </button>
      </div>

      {/* Appraisals Grid */}
      {appraisals.length === 0 ? (
        <div className="liquid-glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Appraisals Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
              Start a new appraisal evaluation cycle for your team members to record KRAs, ratings, and salary increments.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="liquid-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-white" />
            Conduct First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appraisals.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl liquid-glass-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200 shadow-2xs">
                    {app.appraisalCycle}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {app.employee?.firstName} {app.employee?.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-medium">
                    {app.employee?.employeeCode} • {app.employee?.designation?.designationName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600">{app.finalScore} / 5.0</div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Consolidated Score</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Self Evaluation</span>
                  <p className="font-bold text-slate-900">{app.selfScore} / 5.0</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Manager Evaluation</span>
                  <p className="font-bold text-slate-900">{app.managerScore} / 5.0</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-3 font-medium">
                &ldquo;{app.remarks}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/40 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-800 font-bold bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-300/80 shadow-2xs">
                    {app.promotionRecommended ? "✓ Promotion Recommended" : "Standard Cycle"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> +{app.incrementPercentage}% Increment
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Conduct Performance Review */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Conduct Performance Review</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Employee</label>
                <select
                  value={newAppraisal.employeeId}
                  onChange={(e) => setNewAppraisal({ ...newAppraisal, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode} - {emp.designation?.designationName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Appraisal Cycle</label>
                  <input
                    type="text"
                    value={newAppraisal.appraisalCycle}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, appraisalCycle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Proposed Increment (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAppraisal.incrementPercentage}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, incrementPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Self Rating (out of 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newAppraisal.selfScore}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, selfScore: parseFloat(e.target.value) || 4.5 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Manager Rating (out of 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newAppraisal.managerScore}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, managerScore: parseFloat(e.target.value) || 4.8 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Evaluation Feedback & KRA Remarks</label>
                <textarea
                  rows={3}
                  value={newAppraisal.remarks}
                  onChange={(e) => setNewAppraisal({ ...newAppraisal, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promo"
                  checked={newAppraisal.promotionRecommended}
                  onChange={(e) => setNewAppraisal({ ...newAppraisal, promotionRecommended: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="promo" className="text-slate-800 font-semibold cursor-pointer">
                  Recommend for Promotion & Band Upgrade
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="liquid-btn-glass px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-md"
                >
                  Submit Performance Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
