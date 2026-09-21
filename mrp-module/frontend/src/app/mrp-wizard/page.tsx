'use client';

import { useState } from 'react';
import { Wand2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function MrpWizardPage() {
  const [step, setStep] = useState<number>(1);
  const [bomNo, setBomNo] = useState<string>('BOM-EV-DRONE-001');
  const [plannedQty, setPlannedQty] = useState<number>(10);
  const [planningDate, setPlanningDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productionPlan, setProductionPlan] = useState<any | null>(null);
  const [generatedWorkOrders, setGeneratedWorkOrders] = useState<any[]>([]);
  const [mrpResult, setMrpResult] = useState<any>(null);

  const handleRunExplosion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.calculateMrpWizard(bomNo, plannedQty, planningDate);
      setMrpResult(res);
      setStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MRP calculation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Wand2 className="w-6 h-6 text-blue-600" />
            Material Requirement Planning (MRP) Wizard
          </h1>
          <p className="text-sm text-gray-500">4-Step wizard to explode multi-level BoMs, calculate inventory shortages, and spawn nested Work Orders</p>
        </div>
      </div>

      {/* Wizard Progress Steps */}
      <div className="glass-card p-4 rounded-xl border border-gray-200 flex justify-between items-center text-xs font-mono shadow-xs">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>1</span>
          Select Production Target
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>2</span>
          CTE BoM Explosion
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 3 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>3</span>
          Inventory Shortage Analysis
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 ${step >= 4 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 4 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>4</span>
          Planner Review
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card p-6 rounded-xl border border-gray-200 space-y-6 shadow-xs">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <span className="font-semibold">Unable to calculate MRP:</span> {error}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 1: Configure Manufacturing Run</h2>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Select Target BOM</label>
              <select 
                value={bomNo} 
                onChange={e => setBomNo(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="BOM-EV-DRONE-001">BOM-EV-DRONE-001 (Enterprise EV Cargo Drone)</option>
                <option value="BOM-CHASSIS-001">BOM-CHASSIS-001 (Carbon Fiber Chassis)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Planned Production Quantity</label>
              <input 
                type="number" 
                value={plannedQty} 
                onChange={e => setPlannedQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Planning Date</label>
              <input
                type="date"
                value={planningDate}
                onChange={e => setPlanningDate(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="mt-1 text-[10px] text-gray-500">Only BOM revisions effective on this date are included.</p>
            </div>
            <button 
              onClick={handleRunExplosion}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Run CTE Explosion & Dynamic Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 2: PostgreSQL CTE Explosion Analysis</h2>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800">
              ✓ Multi-Level BoM ({bomNo}) successfully exploded using Postgres Recursive CTE. Found {mrpResult?.totalExplodedItems || 0} component requirements for {plannedQty} units.
            </div>
            <button 
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              Analyze Dynamic Stock Shortages <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 3: Inventory Shortage Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Required Total Qty</th>
                    <th className="py-2.5 px-3">Actual In-Stock</th>
                    <th className="py-2.5 px-3">Shortage Qty</th>
                    <th className="py-2.5 px-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {mrpResult?.requirements?.map((s: any, i: number) => {
                    const itemCode = s.item_code || s.itemCode;
                    const itemName = s.item_name || s.itemName;
                    const reqQty = s.required_total_qty ?? s.required;
                    const stock = s.actual_in_stock ?? s.mock_in_stock ?? s.inStock;
                    const shortage = s.shortage_qty ?? s.shortage;
                    const action = s.action_recommended || s.status;

                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-blue-600 font-bold">{itemCode}</td>
                        <td className="py-3 px-3 font-sans text-gray-900">{itemName}</td>
                        <td className="py-3 px-3 text-gray-700">{reqQty}</td>
                        <td className="py-3 px-3 text-gray-500">{stock}</td>
                        <td className={`py-3 px-3 font-bold ${shortage > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{shortage}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            action?.includes('WORK_ORDER') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            action?.includes('PURCHASE') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {action}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              Review MRP Run <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 4: Planner Review</h2>
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> MRP Run Ready for Approval
              </div>
              <p>• Run ID: {mrpResult?.runId || 'Unavailable'}</p>
              <p>• Requirements are persisted for planner review.</p>
              <p>• Release creates an MRP-only production plan lineage; Work Orders are generated from the submitted plan.</p>
            </div>
            <button
              onClick={async () => {
                if (!mrpResult?.runId) return;
                setLoading(true);
                try {
                  const reviewed = await api.reviewMrpRun(mrpResult.runId);
                  setMrpResult((current: any) => ({ ...current, status: reviewed.status }));
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !mrpResult?.runId || mrpResult?.status === 'REVIEWED'}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-50"
            >
              {mrpResult?.status === 'REVIEWED' ? 'Run Reviewed' : 'Mark Run as Reviewed'}
            </button>
            <button
              onClick={async () => {
                if (!mrpResult?.runId || mrpResult?.status !== 'REVIEWED') return;
                setLoading(true);
                setError(null);
                try {
                  const released = await api.releaseMrpRun(mrpResult.runId);
                  setMrpResult((current: any) => ({ ...current, status: released.status }));
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'MRP run release failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || mrpResult?.status !== 'REVIEWED'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-50"
            >
              {mrpResult?.status === 'RELEASED' ? 'Run Released' : 'Release MRP Run'}
            </button>
            <button
              onClick={async () => {
                if (!mrpResult?.runId || mrpResult?.status !== 'RELEASED') return;
                setLoading(true);
                setError(null);
                try {
                  const plan = await api.createProductionPlanFromMrpRun(mrpResult.runId);
                  setProductionPlan(plan);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Production plan creation failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || mrpResult?.status !== 'RELEASED'}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-50"
            >
              {productionPlan?.planId ? `Plan Created: ${productionPlan.planId}` : 'Create Production Plan'}
            </button>
            {productionPlan?.planId && (
              <button
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const submitted = productionPlan.status === 'SUBMITTED'
                      ? productionPlan
                      : await api.submitProductionPlan(productionPlan.planId);
                    setProductionPlan(submitted);
                    const workOrders = await api.generateWorkOrdersFromProductionPlan(productionPlan.planId);
                    setGeneratedWorkOrders(workOrders);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Work Order generation failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || productionPlan.status === 'COMPLETED'}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-50"
              >
                {generatedWorkOrders.length > 0
                  ? `${generatedWorkOrders.length} Work Orders Generated`
                  : 'Submit Plan & Generate Work Orders'}
              </button>
            )}
            <button 
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-800 font-semibold rounded-lg text-xs transition-all"
            >
              Start New MRP Run
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
