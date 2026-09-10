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

  const [newAppraisal, setNewAppraisal] = useState<any>({
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
        setNewAppraisal((prev: any) => ({
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
    setAppraisals((prev: EmployeeAppraisal[]) => [created, ...prev]);
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
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs self-start shadow-xs"
        >
          <Award className="w-4 h-4 text-slate-800" />
          Conduct Performance Review
        </button>
      </div>

      {/* Appraisals Grid */}
      {appraisals.length === 0 ? (
        <div className="liquid-glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-slate-700 mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Appraisals Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Start a new appraisal evaluation cycle for your team members to record KRAs, ratings, and salary increments.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="liquid-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-800" />
            Start First Review Cycle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appraisals.map((apr) => (
            <div key={apr.id} className="p-6 rounded-2xl liquid-glass-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {apr.employee?.firstName} {apr.employee?.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {apr.employee?.employeeCode} • {apr.appraisalCycle}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass text-slate-800">
                  {apr.status}
                </span>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl liquid-glass">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Self Rating</span>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{apr.selfScore || 4.5}/5.0</div>
                </div>
                <div className="p-3 rounded-xl liquid-glass">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Manager Rating</span>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{apr.managerScore || 4.8}/5.0</div>
                </div>
                <div className="p-3 rounded-xl liquid-glass">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Final Score</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{apr.finalScore || 4.7}/5.0</div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Manager Remarks & KRA Summary</span>
                <p className="text-slate-600 font-medium italic">&ldquo;{apr.remarks}&rdquo;</p>
              </div>

              <div className="pt-3 border-t border-white/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                  <span>+{apr.incrementPercentage}% Salary Increment</span>
                </div>
                {apr.promotionRecommended && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-800 liquid-glass px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" /> Promoted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Appraisal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/60">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Conduct Performance Appraisal</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Employee</label>
                  <select
                    value={newAppraisal.employeeId}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Review Cycle</label>
                  <input
                    type="text"
                    value={newAppraisal.appraisalCycle}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, appraisalCycle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Self Score (out of 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newAppraisal.selfScore}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, selfScore: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Manager Score (out of 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newAppraisal.managerScore}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, managerScore: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Increment Percentage (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAppraisal.incrementPercentage}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, incrementPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="promo"
                    checked={newAppraisal.promotionRecommended}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, promotionRecommended: e.target.checked })}
                    className="rounded text-slate-800 focus:ring-slate-500 w-4 h-4"
                  />
                  <label htmlFor="promo" className="text-slate-800 font-bold cursor-pointer">
                    Recommend For Promotion
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Manager Evaluation Remarks & KRAs</label>
                <textarea
                  rows={3}
                  value={newAppraisal.remarks}
                  onChange={(e) => setNewAppraisal({ ...newAppraisal, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                />
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
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-xs"
                >
                  Save Performance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
