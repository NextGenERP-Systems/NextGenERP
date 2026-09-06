'use client';

import { useEffect, useState } from 'react';
import { api, JobCard } from '@/lib/api';
import { Timer, CheckCircle, Plus } from 'lucide-react';

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [consumeItemCode, setConsumeItemCode] = useState<string>('RAW-FLIGHT-CTRL');
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [activeWoId, setActiveWoId] = useState<string>('WO-2026-0001');
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    async function load() {
      const data = await api.getJobCards();
      setJobCards(data);
    }
    load();
  }, []);

  const handleComplete = async (id: string) => {
    await api.completeJobCard(id, 2);
    const updated = await api.getJobCards();
    setJobCards(updated);
    setStatusMsg(`Job Card ${id} updated cleanly!`);
  };

  const handleLogConsumption = async () => {
    await api.logMaterialConsumption(activeWoId, consumeItemCode, consumeQty);
    setStatusMsg(`Logged ${consumeQty} units of ${consumeItemCode} against ${activeWoId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Timer className="w-6 h-6 text-blue-600" />
            Shop Floor Job Cards (Tablet/Mobile Execution)
          </h1>
          <p className="text-sm text-gray-500">Large-button touch UI optimized for shop floor workers, timer logs, and real-time consumption logging</p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {statusMsg}
        </div>
      )}

      {/* Real-time Material Consumption Modal / Panel */}
      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Real-Time Material Consumption & Over-Consumption Logger
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Target Work Order</label>
            <input 
              type="text" 
              value={activeWoId} 
              onChange={e => setActiveWoId(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Material Item Code</label>
            <input 
              type="text" 
              value={consumeItemCode} 
              onChange={e => setConsumeItemCode(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Quantity Consumed</label>
            <input 
              type="number" 
              value={consumeQty} 
              onChange={e => setConsumeQty(Number(e.target.value))}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleLogConsumption}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" /> Log Real-Time Material
            </button>
          </div>
        </div>
      </div>

      {/* Job Card Execution List (Tablet Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobCards.map((jc) => (
          <div key={jc.jobCardId} className="glass-card p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-blue-600">{jc.jobCardId}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                jc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                jc.status === 'WORK_IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
                'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {jc.status}
              </span>
            </div>

            <div>
              <div className="text-xs text-gray-500 font-mono">WO Reference: {jc.workOrderId}</div>
              <div className="text-base font-bold text-gray-900">Operation: {jc.operationId}</div>
              <div className="text-xs text-gray-600">Workstation: {jc.workstationId}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-mono">
              <div>Progress: <span className="text-emerald-700 font-bold">{jc.completedQuantity}</span> / {jc.forQuantity} Units</div>
              <div className="text-gray-500">Logged Time: {jc.totalTimeInMins} mins</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => handleComplete(jc.jobCardId)}
                disabled={jc.status === 'COMPLETED'}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle className="w-5 h-5" /> Complete 2 Units
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
