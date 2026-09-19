'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, Plus, ArrowRight, CheckCircle2, Calendar, Layers } from 'lucide-react';

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemCode, setItemCode] = useState('EV-DRONE-X1');
  const [bomNo, setBomNo] = useState('BOM-EV-DRONE-001');
  const [plannedQty, setPlannedQty] = useState(25);
  const [scheduleDate, setScheduleDate] = useState('2026-10-01');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getMpsSchedules();
    setSchedules(data);
    setLoading(false);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createMpsSchedule({
      itemCode,
      bomNo,
      plannedQty,
      scheduleDate,
      sourceType: 'FORECAST',
      status: 'SUBMITTED'
    });
    await loadData();
  };

  const handleConvertToPlan = async (mpsId: string) => {
    await api.convertMpsToPlan(mpsId);
    await loadData();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#1f272e]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Master Production Schedule (MPS) & Demand Forecast
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Drive long-term manufacturing operations from sales forecasts and capacity planning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create MPS Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-fit space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            New Schedule Entry
          </h2>
          <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Production Item Code</label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">BOM Number</label>
              <input
                type="text"
                value={bomNo}
                onChange={(e) => setBomNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Target Planned Qty</label>
              <input
                type="number"
                value={plannedQty}
                onChange={(e) => setPlannedQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Target Schedule Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors shadow-xs"
            >
              Add to MPS
            </button>
          </form>
        </div>

        {/* MPS List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Active MPS Records
            </span>
            <span className="text-xs text-gray-500 font-normal">{schedules.length} Items</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading MPS entries...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 border-y border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">MPS ID</th>
                    <th className="px-4 py-3">Item / BOM</th>
                    <th className="px-4 py-3">Schedule Date</th>
                    <th className="px-4 py-3">Planned Qty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedules.map((item) => (
                    <tr key={item.mpsId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-blue-600">{item.mpsId}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{item.itemCode}</div>
                        <div className="text-[11px] text-gray-500">{item.bomNo}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{item.scheduleDate}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.plannedQty}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleConvertToPlan(item.mpsId)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded-md text-[11px] transition-colors"
                          >
                            Convert to Plan <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Plan Generated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
