'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function QualityPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [workOrderId, setWorkOrderId] = useState<string>('WO-2026-0001');
  const [inspectionType, setInspectionType] = useState<string>('In-Process');
  const [inspectedBy, setInspectedBy] = useState<string>('Marcus Vance (EMP-103)');
  const [inspectedQty, setInspectedQty] = useState<number>(2);
  const [hoverReading, setHoverReading] = useState<number>(2.5);
  const [voltageReading, setVoltageReading] = useState<number>(48.2);
  const [remarks, setRemarks] = useState<string>('All quality thresholds satisfied.');

  const loadInspections = async () => {
    const data = await api.getQualityInspections();
    setInspections(data);
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoverPassed = hoverReading >= 0.0 && hoverReading <= 5.0;
    const voltagePassed = voltageReading >= 47.5 && voltageReading <= 52.0;

    const newInspection = {
      inspectionId: `QI-2026-00${inspections.length + 1}`,
      workOrderId,
      inspectionType,
      inspectedBy,
      inspectedQty,
      remarks,
      readings: [
        { parameterName: 'Hover Stability Drift (cm)', readingValue: hoverReading, status: hoverPassed ? 'PASSED' : 'FAILED' },
        { parameterName: 'Battery Voltage Full Load (V)', readingValue: voltageReading, status: voltagePassed ? 'PASSED' : 'FAILED' }
      ]
    };

    const result = await api.submitQualityInspection(newInspection);
    setInspections([result, ...inspections]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Quality Check & Inspection Management
          </h1>
          <p className="text-sm text-gray-500">Quality templates, parameter thresholds, and Work Order completion gating</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Perform New Inspection
        </button>
      </div>

      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quality Inspection Logs</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Target WO</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Inspector</th>
                <th className="py-2.5 px-3">Qty Inspected</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {inspections.map((q) => {
                const id = q.inspectionId || q.id;
                const woId = q.workOrderId || q.woId;
                const type = q.inspectionType || q.type;
                const inspector = q.inspectedBy || q.inspector;
                const qty = q.inspectedQty || q.qty;
                const isPassed = q.status === 'PASSED';

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-blue-600 font-bold">{id}</td>
                    <td className="py-3 px-3 text-gray-900">{woId}</td>
                    <td className="py-3 px-3 text-gray-500">{type}</td>
                    <td className="py-3 px-3 font-sans text-gray-900">{inspector}</td>
                    <td className="py-3 px-3 text-gray-700">{qty} Units</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                        isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isPassed ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-gray-500 max-w-xs truncate">{q.remarks || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perform Inspection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Record Shop Floor Quality Inspection</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Work Order ID</label>
                <input
                  type="text"
                  value={workOrderId}
                  onChange={e => setWorkOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Inspected Quantity</label>
                <input
                  type="number"
                  value={inspectedQty}
                  onChange={e => setInspectedQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                <span className="font-bold text-gray-700 block">Quality Readings (Template: QT-EV-DRONE)</span>
                <div>
                  <label className="block text-gray-500">Hover Stability Drift (cm) [Target: 0 - 5 cm]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hoverReading}
                    onChange={e => setHoverReading(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-500">Battery Voltage Full Load (V) [Target: 47.5 - 52.0 V]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={voltageReading}
                    onChange={e => setVoltageReading(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-sans"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Submit Inspection Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

