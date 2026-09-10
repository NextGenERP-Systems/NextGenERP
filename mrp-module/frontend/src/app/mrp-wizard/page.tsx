'use client';

import { useState } from 'react';
import { Wand2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MrpWizardPage() {
  const [step, setStep] = useState<number>(1);
  const [bomNo, setBomNo] = useState<string>('BOM-EV-DRONE-001');
  const [plannedQty, setPlannedQty] = useState<number>(10);
  const [calculated, setCalculated] = useState<boolean>(false);

  const mockShortages = [
    { itemCode: 'DRONE-FRAME-SUB', itemName: 'Carbon Fiber Chassis Sub-Assembly', required: 10, inStock: 10, shortage: 0, status: 'STOCK_AVAILABLE' },
    { itemCode: 'DRONE-PROP-SUB', itemName: 'Brushless Motor Sub-Assembly', required: 20, inStock: 5, shortage: 15, status: 'SPAWN_NESTED_WO' },
    { itemCode: 'RAW-BATTERY-PACK', itemName: 'LiFePO4 48V Smart Battery Pack', required: 10, inStock: 2, shortage: 8, status: 'GENERATE_PURCHASE_REQUEST' },
    { itemCode: 'RAW-FLIGHT-CTRL', itemName: 'AI Flight Controller Board v4', required: 10, inStock: 10, shortage: 0, status: 'STOCK_AVAILABLE' }
  ];

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
          Spawn Nested Work Orders
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card p-6 rounded-xl border border-gray-200 space-y-6 shadow-xs">
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
            <button 
              onClick={() => { setCalculated(true); setStep(2); }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              Run CTE Explosion <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 2: PostgreSQL CTE Explosion Analysis</h2>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800">
              ✓ Multi-Level BoM successfully exploded using Postgres Recursive CTE. Total component requirements calculated for {plannedQty} units.
            </div>
            <button 
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              Analyze Inventory Shortages <ArrowRight className="w-4 h-4" />
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
                    <th className="py-2.5 px-3">Required Qty</th>
                    <th className="py-2.5 px-3">Mock In-Stock</th>
                    <th className="py-2.5 px-3">Shortage</th>
                    <th className="py-2.5 px-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {mockShortages.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-blue-600 font-bold">{s.itemCode}</td>
                      <td className="py-3 px-3 font-sans text-gray-900">{s.itemName}</td>
                      <td className="py-3 px-3 text-gray-700">{s.required}</td>
                      <td className="py-3 px-3 text-gray-500">{s.inStock}</td>
                      <td className={`py-3 px-3 font-bold ${s.shortage > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{s.shortage}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'SPAWN_NESTED_WO' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          s.status === 'GENERATE_PURCHASE_REQUEST' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              Generate Work Orders <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 4: Nested Work Orders Generated</h2>
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> MRP Run Completed Successfully!
              </div>
              <p>• Created Parent Work Order: <span className="underline font-bold">WO-2026-0001</span> for 10 units of EV-DRONE-X1.</p>
              <p>• Automatically spawned Nested Child Work Order: <span className="underline font-bold">WO-2026-0002</span> for 15 units of DRONE-PROP-SUB (linked via <span className="font-mono">parent_wo_id</span>).</p>
            </div>
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
