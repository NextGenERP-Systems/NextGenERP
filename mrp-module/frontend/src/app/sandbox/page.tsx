'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SandboxPage() {
  const [teardownResult, setTeardownResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mockRole, setMockRole] = useState<string>('mrp_production_manager');

  const handleTeardown = async () => {
    setLoading(true);
    const msg = await api.teardownSandbox();
    setTeardownResult(msg);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-rose-600" />
            Sandbox Teardown & PostgreSQL RLS Security
          </h1>
          <p className="text-sm text-gray-500">Purge mock testing states cleanly and test Row Level Security policies for role-based access</p>
        </div>
      </div>

      {/* RLS Role Security Inspector */}
      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          PostgreSQL Row Level Security (RLS) Policy Tester
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div 
            onClick={() => setMockRole('mrp_production_manager')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mockRole === 'mrp_production_manager' 
                ? 'bg-blue-50 border-blue-600 shadow-2xs' 
                : 'glass-card border-gray-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-blue-700 mb-1">
              <span>Role: mrp_production_manager</span>
              {mockRole === 'mrp_production_manager' && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <p className="text-gray-600 font-sans text-xs">Full RLS Policy Access: Can create/update BoMs, spawn Work Orders, run MRP Wizard, and view standard cost variances.</p>
          </div>

          <div 
            onClick={() => setMockRole('mrp_shop_floor_worker')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mockRole === 'mrp_shop_floor_worker' 
                ? 'bg-amber-50 border-amber-600 shadow-2xs' 
                : 'glass-card border-gray-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-amber-700 mb-1">
              <span>Role: mrp_shop_floor_worker</span>
              {mockRole === 'mrp_shop_floor_worker' && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <p className="text-gray-600 font-sans text-xs">Restricted RLS Policy Access: Restricted to Job Card timers and logging real-time raw material consumption on shop floor tablets.</p>
          </div>
        </div>
      </div>

      {/* Sandbox Teardown Section */}
      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          Data Teardown Script Execution
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed">
          Running data teardown will execute <span className="font-mono text-gray-900 font-semibold">teardown-sandbox.sql</span> via PostgreSQL, cleanly truncating all <span className="font-mono text-gray-900 font-semibold">mrp_job_card</span>, <span className="font-mono text-gray-900 font-semibold">mrp_work_order</span>, and mock stock ledger tables to reset testing state.
        </p>

        {teardownResult && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {teardownResult}
          </div>
        )}

        <button 
          onClick={handleTeardown}
          disabled={loading}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Executing Teardown Script...' : 'Purge & Truncate MRP Sandbox State'}
        </button>
      </div>
    </div>
  );
}
