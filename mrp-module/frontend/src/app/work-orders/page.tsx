'use client';

import { useEffect, useState } from 'react';
import { api, WorkOrder } from '@/lib/api';
import { ClipboardList, GitMerge } from 'lucide-react';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

  useEffect(() => {
    async function load() {
      const data = await api.getWorkOrders();
      setWorkOrders(data);
      if (data.length > 0) setSelectedWo(data[0]);
    }
    load();
  }, []);

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

      {/* Work Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workOrders.map((wo) => (
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

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3 text-gray-500 font-mono">
              <div>Target Qty: <span className="text-gray-900 font-medium">{wo.qtyToProduce}</span></div>
              <div>Produced Qty: <span className="text-emerald-600 font-bold">{wo.producedQty}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected WO Detail Inspector */}
      {selectedWo && (
        <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            Material Consumption & Over-Consumption Inspector ({selectedWo.workOrderId})
          </h2>

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
        </div>
      )}
    </div>
  );
}
