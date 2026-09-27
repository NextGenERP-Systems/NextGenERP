'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, InventoryMovement, StateTransitionAudit, WorkOrder } from '@/lib/api';
import { ClipboardList, GitMerge } from 'lucide-react';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [auditHistory, setAuditHistory] = useState<StateTransitionAudit[]>([]);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [commandBusy, setCommandBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredWorkOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workOrders.filter((wo) => !term || [wo.workOrderId, wo.itemName, wo.status, wo.productionItem, wo.productionPlanId]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [workOrders, search]);
  const pageCount = Math.max(1, Math.ceil(filteredWorkOrders.length / pageSize));
  const pagedWorkOrders = filteredWorkOrders.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setPageError(null);
      try {
        const data = await api.getWorkOrders();
        setWorkOrders(data);
        if (data.length > 0) setSelectedWo(data[0]);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : 'Unable to load persisted Work Orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedWo) {
      setMovements([]);
      return;
    }
    setDetailError(null);
    Promise.all([
      api.getInventoryMovementsForWorkOrder(selectedWo.workOrderId),
      api.getStateAudit('WORK_ORDER', selectedWo.workOrderId)
    ]).then(([movementData, auditData]) => {
      setMovements(movementData);
      setAuditHistory(auditData);
    }).catch((error) => {
      setDetailError(error instanceof Error ? error.message : 'Unable to load Work Order history');
    });
  }, [selectedWo?.workOrderId]);

  async function completeSelectedWorkOrder() {
    if (!selectedWo) return;
    setCommandBusy(true);
    setCommandError(null);
    try {
      const updated = await api.completeWorkOrder(selectedWo.workOrderId);
      setWorkOrders((current) => current.map((wo) => wo.workOrderId === updated.workOrderId ? updated : wo));
      setSelectedWo(updated);
      setMovements(await api.getInventoryMovementsForWorkOrder(updated.workOrderId));
    } catch (error) {
      setCommandError(error instanceof Error ? error.message : 'Unable to complete Work Order');
    } finally {
      setCommandBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Work Order Command Center & Nested Hierarchy
          </h1>
          <p className="text-sm text-gray-500">Manage Work Orders, Parent-Child sub-assembly foreign key linkage, and material consumption</p>
        </div>
      </div>

      {loading && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">Loading persisted Work Orders…</div>}
      {pageError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"><span className="font-semibold">Work Orders unavailable:</span> {pageError}</div>}

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search Work Orders, items, or status..."
          className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <span className="text-xs text-gray-500">{filteredWorkOrders.length} orders</span>
      </div>

      {/* Work Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pagedWorkOrders.map((wo) => (
          <div 
            key={wo.workOrderId}
            onClick={() => setSelectedWo(wo)}
            className={`glass-card p-5 rounded-xl border transition-all cursor-pointer ${
              selectedWo?.workOrderId === wo.workOrderId 
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-600">{wo.workOrderId}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                wo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                wo.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {wo.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-1">{wo.itemName}</h3>
            
            {wo.parentWoId && (
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-3">
                <GitMerge className="w-3 h-3" /> Child Sub-Assembly of {wo.parentWoId}
              </div>
            )}
            {wo.productionPlanId && (
              <div className="text-[11px] font-mono text-slate-600 mb-3">Plan: {wo.productionPlanId}</div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3 text-gray-500 font-mono">
              <div>Target Qty: <span className="text-gray-900 font-medium">{wo.qtyToProduce}</span></div>
              <div>Produced Qty: <span className="text-emerald-600 font-bold">{wo.producedQty}</span></div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && <div className="flex items-center justify-between text-xs text-gray-500"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}

      {/* Selected WO Detail Inspector */}
      {selectedWo && (
        <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            Material Consumption & Over-Consumption Inspector ({selectedWo.workOrderId})
          </h2>
          {detailError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{detailError}</div>}
          <div className="flex items-center gap-3">
            {(selectedWo.status === 'SUBMITTED' || selectedWo.status === 'IN_PROGRESS') && (
              <button
                onClick={completeSelectedWorkOrder}
                disabled={commandBusy}
                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {commandBusy ? 'Completing…' : 'Complete Work Order'}
              </button>
            )}
            {commandError && <span className="text-xs text-rose-600">{commandError}</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Required Qty</th>
                  <th className="py-2.5 px-3">Actual Consumed Qty</th>
                  <th className="py-2.5 px-3">Variance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {selectedWo.items.map((item, idx) => {
                  const isOverConsumed = item.actualConsumedQty > item.requiredQty;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-blue-600 font-bold">{item.itemCode}</td>
                      <td className="py-3 px-3 font-sans text-gray-900">{item.itemName}</td>
                      <td className="py-3 px-3 text-gray-700">{item.requiredQty} {item.uom}</td>
                      <td className="py-3 px-3 text-gray-900 font-bold">{item.actualConsumedQty} {item.uom}</td>
                      <td className="py-3 px-3">
                        {isOverConsumed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            Over-consumed (+{item.actualConsumedQty - item.requiredQty})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            On Target
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Audited Material Movements ({movements.length})
            </h3>
            {movements.length === 0 ? (
              <p className="text-xs text-gray-500">No persisted MRP movement records for this work order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                      <th className="py-2 px-3">Movement</th>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Quantity</th>
                      <th className="py-2 px-3">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="py-2 px-3 text-blue-600">{movement.movementType}</td>
                        <td className="py-2 px-3">{movement.itemCode}</td>
                        <td className="py-2 px-3">{movement.quantity}</td>
                        <td className="py-2 px-3 text-gray-500">{new Date(movement.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              State Transition History ({auditHistory.length})
            </h3>
            {auditHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No persisted state transitions for this Work Order.</p>
            ) : (
              <div className="space-y-2">
                {auditHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-xs">
                    <span className="font-mono text-gray-700">{entry.action}: {entry.fromStatus || '—'} → {entry.toStatus}</span>
                    <span className="text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
