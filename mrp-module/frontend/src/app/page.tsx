'use client';

import { useEffect, useState } from 'react';
import { api, WorkOrder, JobCard } from '@/lib/api';
import { 
  Factory, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function MRPDashboard() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);

  useEffect(() => {
    async function loadData() {
      const woData = await api.getWorkOrders();
      const jcData = await api.getJobCards();
      setWorkOrders(woData);
      setJobCards(jcData);
    }
    loadData();
  }, []);

  const totalPlannedCost = workOrders.reduce((acc, wo) => acc + (wo.plannedMaterialCost || 0), 0);
  const totalActualCost = workOrders.reduce((acc, wo) => acc + (wo.actualMaterialCost || 0), 0);
  const costVariance = totalActualCost - totalPlannedCost;

  const statusData = [
    { name: 'Completed', value: workOrders.filter(w => w.status === 'COMPLETED').length, color: '#10b981' },
    { name: 'In Progress', value: workOrders.filter(w => w.status === 'IN_PROGRESS').length, color: '#2563eb' },
    { name: 'Draft / Planned', value: workOrders.filter(w => w.status === 'DRAFT' || w.status === 'SUBMITTED').length, color: '#f59e0b' },
  ];

  const costComparisonData = workOrders.map(wo => ({
    name: wo.workOrderId,
    Planned: wo.plannedMaterialCost,
    Actual: wo.actualMaterialCost
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Factory className="w-6 h-6 text-blue-600" />
            Manufacturing & Production Command Center
          </h1>
          <p className="text-sm text-gray-500">Real-time status of Work Orders, Job Cards, and Standard Cost Variances</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active WOs</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{workOrders.length}</div>
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" /> Parent & Sub-Assembly Linked
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Planned Standard Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalPlannedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Standard Cost Baseline</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Actual Material Cost</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className={`text-xs mt-1 font-semibold flex items-center gap-1 ${costVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {costVariance > 0 ? `+$${costVariance.toFixed(2)} Variance` : 'On Target'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Job Card Timers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{jobCards.length} Cards</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Real-time Logging
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Planned vs Actual Cost Variance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
                <Bar dataKey="Planned" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Work Order Status Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
