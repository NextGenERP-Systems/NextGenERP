'use client';

import { useEffect, useState } from 'react';
import { api, Bom } from '@/lib/api';
import { Layers, Database, ChevronRight } from 'lucide-react';

export default function BomPage() {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [selectedBomNo, setSelectedBomNo] = useState<string>('BOM-EV-DRONE-001');
  const [explodedItems, setExplodedItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadBoms() {
      const data = await api.getBoms();
      setBoms(data);
    }
    loadBoms();
  }, []);

  useEffect(() => {
    async function explode() {
      if (selectedBomNo) {
        const data = await api.explodeBom(selectedBomNo);
        setExplodedItems(data);
      }
    }
    explode();
  }, [selectedBomNo]);

  const activeBom = boms.find(b => b.bomNo === selectedBomNo) || boms[0];

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

      {/* BOM Selection Tabs */}
      <div className="flex gap-3">
        {boms.map((b) => (
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

      {activeBom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header Card */}
          <div className="glass-card p-5 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-xs font-mono text-blue-600 font-bold">{activeBom.bomNo}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {activeBom.isActive ? 'ACTIVE' : 'DRAFT'}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">{activeBom.itemName}</h2>
              <p className="text-xs text-gray-500">Item Code: {activeBom.itemCode}</p>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-3 text-xs">
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
