'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { api, MrpRun } from '@/lib/api';

const statusClass = (status: string) => status === 'RELEASED'
  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
  : status === 'REVIEWED'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

export default function MrpRunsPage() {
  const [runs, setRuns] = useState<MrpRun[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandMessage, setCommandMessage] = useState<string | null>(null);
  const [busyRun, setBusyRun] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.getMrpRuns()
      .then(setRuns)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load persisted MRP runs'))
      .finally(() => setLoading(false));
  }, []);

  const visibleRuns = useMemo(() => {
    const term = search.trim().toLowerCase();
    return runs.filter((run) => !term || [run.runId, run.bomNo, run.status, run.planningDate]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [runs, search]);
  const pageCount = Math.max(1, Math.ceil(visibleRuns.length / pageSize));
  const pagedRuns = visibleRuns.slice((page - 1) * pageSize, page * pageSize);

  async function runCommand(run: MrpRun, command: 'review' | 'release' | 'plan') {
    setBusyRun(run.runId);
    setCommandMessage(null);
    try {
      if (command === 'review') await api.reviewMrpRun(run.runId);
      if (command === 'release') await api.releaseMrpRun(run.runId);
      if (command === 'plan') await api.createProductionPlanFromMrpRun(run.runId);
      if (command === 'review' || command === 'release') {
        setRuns((current) => current.map((item) => item.runId === run.runId ? { ...item, status: command === 'review' ? 'REVIEWED' : 'RELEASED' } : item));
      }
      setCommandMessage(command === 'plan' ? `Production Plan created from ${run.runId}.` : `${run.runId} ${command} completed successfully.`);
    } catch (reason) {
      setCommandMessage(reason instanceof Error ? reason.message : `Unable to ${command} MRP run`);
    } finally {
      setBusyRun(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900"><Activity className="h-6 w-6 text-blue-600" /> MRP Runs</h1>
        <p className="text-sm text-gray-500">Review persisted planning snapshots, shortage totals and release readiness</p>
      </div>
      {loading && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">Loading persisted MRP runs…</div>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {commandMessage && <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">{commandMessage}</div>}
      {!loading && !error && runs.length === 0 && <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">No MRP runs have been persisted yet.</div>}
      <div className="flex items-center gap-3"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search run, BoM, date, or status..." className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><span className="text-xs text-gray-500">{visibleRuns.length} runs</span></div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {pagedRuns.map((run) => {
          const shortages = run.requirements.filter((requirement) => (requirement.shortageQty || 0) > 0).length;
          return <section key={run.runId} className="glass-card rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3"><div><div className="font-mono text-xs font-bold text-blue-600">{run.runId}</div><div className="mt-1 text-sm font-semibold text-gray-900">BoM: {run.bomNo}</div></div><span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusClass(run.status)}`}>{run.status}</span></div>
            <div className="grid grid-cols-2 gap-2 py-3 text-xs text-gray-500"><div>Planning date: <span className="font-mono text-gray-900">{run.planningDate}</span></div><div>Planned qty: <span className="font-semibold text-gray-900">{run.plannedQty}</span></div><div>Requirements: <span className="font-semibold text-gray-900">{run.requirements.length}</span></div><div>Shortages: <span className="font-semibold text-rose-700">{shortages}</span></div></div>
            <div className="text-[11px] text-gray-500">Calculation cutoff: <span className="font-mono text-gray-700">{new Date(run.calculationCutoffAt).toLocaleString()}</span></div>
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
              {run.status === 'CALCULATED' && <button disabled={busyRun === run.runId} onClick={() => runCommand(run, 'review')} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyRun === run.runId ? 'Working…' : 'Review Run'}</button>}
              {run.status === 'REVIEWED' && <button disabled={busyRun === run.runId} onClick={() => runCommand(run, 'release')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyRun === run.runId ? 'Working…' : 'Release Run'}</button>}
              {run.status === 'RELEASED' && <button disabled={busyRun === run.runId} onClick={() => runCommand(run, 'plan')} className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyRun === run.runId ? 'Working…' : 'Create Production Plan'}</button>}
            </div>
          </section>;
        })}
      </div>
      {pageCount > 1 && <div className="flex items-center justify-between text-xs text-gray-500"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}
    </div>
  );
}
