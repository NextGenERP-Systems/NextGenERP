'use client';

import { useEffect, useState } from 'react';
import { Cpu, AlertTriangle, Plus, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function WorkstationsPage() {
  const [downtimeEntries, setDowntimeEntries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [targetWs, setTargetWs] = useState<string>('WS-CNC-01');
  const [category, setCategory] = useState<string>('TOOLING');
  const [durationMins, setDurationMins] = useState<number>(60);
  const [remarks, setRemarks] = useState<string>('Tooling adjustment and calibration.');

  const workstations = [
    { id: 'WS-CNC-01', name: '5-Axis Precision CNC Machining Center', hourlyCost: 65.00, workingHours: 16.0, loadPercent: 75, status: 'Active' },
    { id: 'WS-ASM-01', name: 'Avionics & Harness Assembly Station', hourlyCost: 45.00, workingHours: 8.0, loadPercent: 90, status: 'High Demand' },
    { id: 'WS-TEST-01', name: 'Automated Flight & Quality Test Bench', hourlyCost: 55.00, workingHours: 8.0, loadPercent: 40, status: 'Optimal' }
  ];

  const loadDowntime = async () => {
    const data = await api.getDowntimeEntries();
    setDowntimeEntries(data);
  };

  useEffect(() => {
    loadDowntime();
  }, []);

  const handleLogDowntime = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      downtimeId: `DT-2026-00${downtimeEntries.length + 1}`,
      workstationId: targetWs,
      operatorEmployeeId: 'EMP-101',
      category,
      downtimeInMins: durationMins,
      remarks,
      startTime: new Date().toISOString()
    };
    const res = await api.logDowntime(newEntry);
    setDowntimeEntries([res, ...downtimeEntries]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-blue-600" />
            Workstation Machine Capacity & Downtime Management
          </h1>
          <p className="text-sm text-gray-500">Monitor machine operating costs, working hours, capacity loads, and log maintenance downtime</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
        >
          <AlertTriangle className="w-4 h-4" /> Log Machine Downtime
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workstations.map((ws) => (
          <div key={ws.id} className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-xs font-mono text-blue-600 font-bold">{ws.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {ws.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">{ws.name}</h3>
            </div>

            <div className="space-y-2 text-xs font-mono text-gray-600">
              <div className="flex justify-between">
                <span>Hourly Operating Cost:</span>
                <span className="text-gray-900 font-bold">${ws.hourlyCost.toFixed(2)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span>Shift Hours Limit:</span>
                <span className="text-gray-900 font-bold">{ws.workingHours} hrs/day</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-500">Workstation Capacity Load</span>
                <span className="text-blue-600 font-bold">{ws.loadPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                <div 
                  className={`h-full rounded-full transition-all ${
                    ws.loadPercent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${ws.loadPercent}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Downtime Logs Table */}
      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Recent Workstation Downtime Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Downtime ID</th>
                <th className="py-2.5 px-3">Workstation</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Duration (Mins)</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {downtimeEntries.map((dt, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-amber-600 font-bold">{dt.downtimeId || dt.id}</td>
                  <td className="py-3 px-3 text-gray-900">{dt.workstationId}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {dt.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-700">{dt.downtimeInMins} mins</td>
                  <td className="py-3 px-3 font-sans text-gray-500">{dt.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Downtime Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Log Machine Downtime Event</h3>
            <form onSubmit={handleLogDowntime} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Select Workstation</label>
                <select
                  value={targetWs}
                  onChange={e => setTargetWs(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono"
                >
                  <option value="WS-CNC-01">WS-CNC-01 (5-Axis CNC Machining Center)</option>
                  <option value="WS-ASM-01">WS-ASM-01 (Avionics Assembly Station)</option>
                  <option value="WS-TEST-01">WS-TEST-01 (Quality Test Bench)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Downtime Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono"
                >
                  <option value="BREAKDOWN">BREAKDOWN</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="TOOLING">TOOLING</option>
                  <option value="MATERIAL_SHORTAGE">MATERIAL_SHORTAGE</option>
                  <option value="POWER_OUTAGE">POWER_OUTAGE</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Downtime Duration (Minutes)</label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={e => setDurationMins(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Remarks / Description</label>
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                >
                  Save Downtime Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

