'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ClipboardList, Plus, Truck, CheckCircle2 } from 'lucide-react';

export default function SubcontractingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workOrderId, setWorkOrderId] = useState('WO-2026-0001');
  const [supplierId, setSupplierId] = useState('SUP-AERO-TECH');
  const [itemCode, setItemCode] = useState('DRONE-PROP-SUB');
  const [qty, setQty] = useState(5);
  const [serviceCost, setServiceCost] = useState(250);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getSubcontracts();
    setOrders(data);
    setLoading(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSubcontract({
      workOrderId,
      supplierId,
      itemCode,
      qty,
      serviceCost,
      status: 'SUBMITTED'
    });
    await loadData();
  };

  const handleDispatch = async (subcontractId: string) => {
    await api.dispatchSubcontractMaterials(subcontractId);
    await loadData();
  };

  const handleReceive = async (subcontractId: string) => {
    await api.receiveSubcontractGoods(subcontractId);
    await loadData();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#1f272e]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Subcontracting Orders & External Processing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Outsource specialized operations to third-party vendors and track raw material transfers between WH-STORES & WH-SUBCONTRACTOR.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Subcontract Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-fit space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            New Subcontract Order
          </h2>
          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Work Order ID</label>
              <input
                type="text"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Supplier / Vendor ID</label>
              <input
                type="text"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Subcontract Item Code</label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Service Cost ($)</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors shadow-xs"
            >
              Issue Subcontract Order
            </button>
          </form>
        </div>

        {/* Subcontract List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              Active Vendor Orders
            </span>
            <span className="text-xs text-gray-500 font-normal">{orders.length} Subcontracts</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading Subcontracts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 border-y border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Subcontract ID</th>
                    <th className="px-4 py-3">Work Order / Vendor</th>
                    <th className="px-4 py-3">Item & Warehouse Route</th>
                    <th className="px-4 py-3">Qty & Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((item) => (
                    <tr key={item.subcontractId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-blue-600">{item.subcontractId}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{item.workOrderId}</div>
                        <div className="text-[11px] text-gray-500">{item.supplierId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-gray-900 font-semibold">{item.itemCode}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {item.warehouseFrom || 'WH-STORES'} &rarr; {item.warehouseTo || 'WH-SUBCONTRACTOR'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{item.qty} units</div>
                        <div className="font-mono text-gray-500 text-[11px]">${item.serviceCost?.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          item.status === 'MATERIALS_DISPATCHED' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Received
                          </span>
                        ) : item.status === 'MATERIALS_DISPATCHED' ? (
                          <button
                            onClick={() => handleReceive(item.subcontractId)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            Receive Goods
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDispatch(item.subcontractId)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            Dispatch Materials
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
