'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { api, ProductionPlan } from '@/lib/api';

const statusClass = (status: string) => status === 'SUBMITTED'
  ? 'bg-blue-50 text-blue-700 border-blue-200'
  : status === 'COMPLETED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

export default function ProductionPlansPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandMessage, setCommandMessage] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.getProductionPlans()
      .then(setPlans)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load persisted Production Plans'))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = useMemo(() => {
    const term = search.trim().toLowerCase();
    return plans.filter((plan) => !term || [plan.planId, plan.status, plan.sourceMrpRunId, ...plan.items.map((item) => item.itemCode)]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [plans, search]);
  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const pagedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  async function submitPlan(plan: ProductionPlan) {
    setBusyPlan(plan.planId);
    setCommandMessage(null);
    try {
      const updated = await api.submitProductionPlan(plan.planId);
      setPlans((current) => current.map((item) => item.planId === plan.planId ? { ...item, ...updated } : item));
      setCommandMessage(`${plan.planId} submitted successfully.`);
    } catch (reason) {
      setCommandMessage(reason instanceof Error ? reason.message : 'Unable to submit Production Plan');
    } finally {
      setBusyPlan(null);
    }
  }

  async function generateWorkOrders(plan: ProductionPlan) {
    setBusyPlan(plan.planId);
    setCommandMessage(null);
    try {
      await api.generateWorkOrdersFromProductionPlan(plan.planId);
      setCommandMessage(`Work Orders generated for ${plan.planId}.`);
    } catch (reason) {
      setCommandMessage(reason instanceof Error ? reason.message : 'Unable to generate Work Orders');
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-blue-600" /> Production Plans
        </h1>
        <p className="text-sm text-gray-500">Operational view of persisted MRP production plans and controlled execution commands</p>
      </div>

      {loading && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">Loading persisted Production Plans…</div>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {commandMessage && <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">{commandMessage}</div>}
      {!loading && !error && plans.length === 0 && <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">No production plans have been persisted yet.</div>}

      <div className="flex items-center gap-3">
        <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search plan, source run, item, or status..." className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
        <span className="text-xs text-gray-500">{filteredPlans.length} plans</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {pagedPlans.map((plan) => (
          <section key={plan.planId} className="glass-card rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div><div className="font-mono text-xs font-bold text-blue-600">{plan.planId}</div><div className="mt-1 text-sm font-semibold text-gray-900">Posting date: {plan.postingDate}</div></div>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusClass(plan.status)}`}>{plan.status}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 text-xs text-gray-500">
              <div>Source MRP run: <span className="font-mono text-gray-900">{plan.sourceMrpRunId || '—'}</span></div>
              <div>Items: <span className="font-semibold text-gray-900">{plan.items.length}</span></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-gray-200 text-[10px] uppercase text-gray-500"><th className="py-2 pr-3">Item</th><th className="py-2 pr-3">BoM</th><th className="py-2 pr-3">Planned</th><th className="py-2">Produced</th></tr></thead><tbody className="divide-y divide-gray-100">{plan.items.map((item) => <tr key={item.id || `${plan.planId}-${item.itemCode}`}><td className="py-2 pr-3 font-mono font-semibold text-gray-900">{item.itemCode}</td><td className="py-2 pr-3 font-mono text-gray-600">{item.bomNo}</td><td className="py-2 pr-3">{item.plannedQty}</td><td className="py-2 text-emerald-700">{item.producedQty}</td></tr>)}</tbody></table></div>
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
              {plan.status === 'DRAFT' && <button disabled={busyPlan === plan.planId} onClick={() => submitPlan(plan)} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyPlan === plan.planId ? 'Submitting…' : 'Submit Plan'}</button>}
              {plan.status === 'SUBMITTED' && <button disabled={busyPlan === plan.planId} onClick={() => generateWorkOrders(plan)} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyPlan === plan.planId ? 'Generating…' : 'Generate Work Orders'}</button>}
            </div>
          </section>
        ))}
      </div>
      {pageCount > 1 && <div className="flex items-center justify-between text-xs text-gray-500"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}
    </div>
  );
}
