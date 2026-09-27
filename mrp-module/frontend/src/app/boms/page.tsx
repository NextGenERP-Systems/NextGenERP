'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, Bom } from '@/lib/api';
import { Layers, Database, ChevronRight } from 'lucide-react';

export default function BomPage() {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [selectedBomNo, setSelectedBomNo] = useState<string>('BOM-EV-DRONE-001');
  const [explodedItems, setExplodedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadBoms() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getBoms();
        setBoms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load persisted BOMs');
      } finally {
        setLoading(false);
      }
    }
    loadBoms();
  }, []);

  useEffect(() => {
    async function explode() {
      if (selectedBomNo) {
        try {
          const data = await api.explodeBom(selectedBomNo);
          setExplodedItems(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to explode the selected BOM');
          setExplodedItems([]);
        }
      }
    }
    explode();
  }, [selectedBomNo]);

  const activeBom = boms.find(b => b.bomNo === selectedBomNo) || boms[0];
  const filteredBoms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return boms.filter((bom) => !term || [bom.bomNo, bom.itemCode, bom.itemName, bom.status]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [boms, search]);
  const pageCount = Math.max(1, Math.ceil(filteredBoms.length / pageSize));
  const pagedBoms = filteredBoms.slice((page - 1) * pageSize, page * pageSize);
  const bomStatus = activeBom?.status || (activeBom?.isActive ? 'ACTIVE' : 'DRAFT');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            Bill of Materials (BOM) & Tree Explosion
          </h1>
          <p className="text-sm text-gray-500">Multi-level BoM hierarchy expanded via PostgreSQL Recursive Common Table Expressions (CTEs)</p>
        </div>
      </div>

      {loading && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">Loading persisted BOM definitions…</div>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"><span className="font-semibold">BOM data unavailable:</span> {error}</div>}

      {/* BOM Selection Tabs */}
      <div className="flex items-center gap-3"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search BoM, item, or status..." className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><span className="text-xs text-gray-500">{filteredBoms.length} BoMs</span></div>
      <div className="flex flex-wrap gap-3">
        {pagedBoms.map((b) => (
          <button
            key={b.bomNo}
            onClick={() => setSelectedBomNo(b.bomNo)}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedBomNo === b.bomNo
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'glass-card text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {b.bomNo} ({b.itemName})
          </button>
        ))}
      </div>
      {pageCount > 1 && <div className="flex items-center justify-between text-xs text-gray-500"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}

      {activeBom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header Card */}
          <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-xs font-mono text-blue-600 font-bold">{activeBom.bomNo}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${bomStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {bomStatus}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">{activeBom.itemName}</h2>
              <p className="text-xs text-gray-500">Item Code: {activeBom.itemCode}</p>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Revision:</span>
                <span className="font-mono text-gray-900">R{activeBom.revisionNumber || 1}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Effective Window:</span>
                <span className="font-mono text-gray-900">{activeBom.effectiveFrom || 'Any'} → {activeBom.effectiveTo || 'Open'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Raw Material Cost:</span>
                <span className="font-mono text-gray-900">${activeBom.rawMaterialCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Operating Overhead:</span>
                <span className="font-mono text-gray-900">${activeBom.operatingCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-2 text-sm">
                <span>Total Standard Cost:</span>
                <span className="font-mono text-emerald-600">${activeBom.totalCost?.toFixed(2)}</span>
              </div>
            </div>

            {bomStatus === 'DRAFT' && (
              <button
                onClick={async () => {
                  const approved = await api.approveBom(activeBom.bomNo);
                  setBoms(current => current.map(b => b.bomNo === approved.bomNo ? approved : b));
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-xs"
              >
                Approve BOM for MRP
              </button>
            )}
          </div>

          {/* Exploded Tree View */}
          <div className="lg:col-span-2 glass-card p-5 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                PostgreSQL Recursive CTE Explosion View
              </h2>
              <span className="text-xs font-mono text-gray-500">{explodedItems.length} Sub-components</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Depth</th>
                    <th className="py-2.5 px-3">Sub Component</th>
                    <th className="py-2.5 px-3">Exploded Qty</th>
                    <th className="py-2.5 px-3">Standard Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {explodedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-indigo-600 font-bold">
                        L{item.level_depth || 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-sans font-medium text-gray-900">
                          {item.level_depth > 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                          {item.item_name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{item.item_code}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {item.total_exploded_qty || item.required_qty} {item.uom}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        ${(item.standard_rate || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        ${(item.total_exploded_amount || item.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BOM Update Tool Component */}
      <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          BOM Update Tool: Mass Component Replacement
        </h2>
        <p className="text-xs text-gray-500">
          Replace an obsolete or out-of-stock raw material across all active Bills of Material and bump revision numbers.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const currentItem = (form.elements.namedItem('currentItem') as HTMLInputElement).value;
            const newItem = (form.elements.namedItem('newItem') as HTMLInputElement).value;
            const newItemName = (form.elements.namedItem('newItemName') as HTMLInputElement).value;
            const newRate = Number((form.elements.namedItem('newRate') as HTMLInputElement).value);
            const res = await api.replaceBomItem(currentItem, newItem, newItemName, newRate);
            alert(res.message);
            const data = await api.getBoms();
            setBoms(data);
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
        >
          <div>
            <label className="block text-gray-700 mb-1">Current Item Code</label>
            <input name="currentItem" defaultValue="RAW-ESC-60A" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">New Item Code</label>
            <input name="newItem" defaultValue="RAW-ESC-80A" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">New Item Name</label>
            <input name="newItemName" defaultValue="80A High-Capacity ESC" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors">
              Execute Replacement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
