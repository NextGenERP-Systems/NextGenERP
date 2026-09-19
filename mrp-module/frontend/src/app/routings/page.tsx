'use client';

import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Cpu, 
  ArrowRight, 
  Search, 
  Trash2, 
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api, Routing, OperationItem, RoutingOperation } from '@/lib/api';

export default function RoutingsPage() {
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'routings' | 'operations'>('routings');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);

  // New Routing Form State
  const [routingId, setRoutingId] = useState('');
  const [routingName, setRoutingName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [routingOps, setRoutingOps] = useState<RoutingOperation[]>([
    { sequenceNo: 1, operationId: 'Precision CNC Machining', workstationId: 'WS-CNC-01', timeInMins: 30, operatingCost: 15.5 },
    { sequenceNo: 2, operationId: 'Robotic Chassis Assembly', workstationId: 'WS-ASSM-01', timeInMins: 30, operatingCost: 22.0 }
  ]);

  // New Operation Form State
  const [newOpId, setNewOpId] = useState('');
  const [newOpName, setNewOpName] = useState('');
  const [newOpWorkstation, setNewOpWorkstation] = useState('WS-CNC-01');
  const [newOpCost, setNewOpCost] = useState(15.0);
  const [newOpDesc, setNewOpDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, oData] = await Promise.all([
        api.getRoutings(),
        api.getOperations()
      ]);
      setRoutings(rData || []);
      setOperations(oData || []);
    } catch (e) {
      console.error('Error loading routings data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperationRow = () => {
    setRoutingOps([
      ...routingOps,
      {
        sequenceNo: routingOps.length + 1,
        operationId: operations.length > 0 ? operations[0].operationName : 'Assembly Operation',
        workstationId: operations.length > 0 && operations[0].defaultWorkstationId ? operations[0].defaultWorkstationId : 'WS-ASSM-01',
        timeInMins: 20,
        operatingCost: operations.length > 0 && operations[0].defaultOperatingCost ? operations[0].defaultOperatingCost : 10.0
      }
    ]);
  };

  const handleRemoveOperationRow = (index: number) => {
    const updated = routingOps.filter((_, i) => i !== index).map((op, idx) => ({
      ...op,
      sequenceNo: idx + 1
    }));
    setRoutingOps(updated);
  };

  const handleCreateRouting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routingName) return;

    const totalOperatingCost = routingOps.reduce((acc, curr) => acc + (curr.operatingCost || 0), 0);
    const totalRoutingTimeMins = routingOps.reduce((acc, curr) => acc + (curr.timeInMins || 0), 0);

    const newRouting: Routing = {
      routingId: routingId || `RT-${Math.floor(Math.random() * 9000 + 1000)}`,
      routingName,
      itemCode,
      isActive: true,
      totalOperatingCost,
      totalRoutingTimeMins,
      operations: routingOps
    };

    const saved = await api.createRouting(newRouting);
    setRoutings([saved, ...routings]);
    setIsRoutingModalOpen(false);
    // Reset form
    setRoutingId('');
    setRoutingName('');
    setItemCode('');
  };

  const handleCreateOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName) return;

    const newOp: OperationItem = {
      operationId: newOpId || `OP-${Math.floor(Math.random() * 9000 + 1000)}`,
      operationName: newOpName,
      defaultWorkstationId: newOpWorkstation,
      defaultOperatingCost: Number(newOpCost),
      description: newOpDesc
    };

    const saved = await api.createOperation(newOp);
    setOperations([...operations, saved]);
    setIsOperationModalOpen(false);
    setNewOpId('');
    setNewOpName('');
    setNewOpDesc('');
  };

  const filteredRoutings = routings.filter(r => 
    r.routingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.routingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.itemCode && r.itemCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOperations = operations.filter(o =>
    o.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.operationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Workflow className="w-7 h-7 text-blue-600" />
            Manufacturing Routings & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define multi-station operation sequences, standard cycle times, and routing workstation assignments for BOM execution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOperationModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            New Operation
          </button>
          <button
            onClick={() => setIsRoutingModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Routing Sequence
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Routings</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{routings.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Workflow className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Standard Operations</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{operations.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Avg Sequence Length</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {routings.length > 0 
                ? (routings.reduce((acc, r) => acc + (r.operations?.length || 0), 0) / routings.length).toFixed(1) 
                : '0'} Steps
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Avg Operating Cost / WO</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ${routings.length > 0 
                ? (routings.reduce((acc, r) => acc + (r.totalOperatingCost || 0), 0) / routings.length).toFixed(2) 
                : '0.00'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('routings')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'routings' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Routings ({routings.length})
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'operations' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard Operations ({operations.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tab 1: Routings List with Graphical Sequence Visualizer */}
        {activeTab === 'routings' && (
          <div className="space-y-4">
            {filteredRoutings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No routings found. Create a new routing to assign operations to BOMs.
              </div>
            ) : (
              filteredRoutings.map((routing) => (
                <div key={routing.routingId} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {routing.routingId}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{routing.routingName}</h3>
                        {routing.isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        )}
                      </div>
                      {routing.itemCode && (
                        <div className="text-xs text-slate-500 mt-1">
                          Linked Item: <span className="font-mono font-medium text-slate-700">{routing.itemCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Time: <strong className="text-slate-900">{routing.totalRoutingTimeMins || 0} mins</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>Operating Cost: <strong className="text-slate-900">${(routing.totalOperatingCost || 0).toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Operation Sequence Visualizer */}
                  <div className="mt-4 pt-1">
                    <div className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider text-[10px]">
                      Operation Process Sequence ({routing.operations?.length || 0} steps)
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {routing.operations?.map((op, idx) => (
                        <React.Fragment key={op.id || idx}>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[200px] flex-1 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                              <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {op.sequenceNo || idx + 1}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-sm">
                                {op.workstationId}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {op.operationId}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                              <span>⏱ {op.timeInMins} mins</span>
                              {op.operatingCost !== undefined && <span>${op.operatingCost.toFixed(2)}</span>}
                            </div>
                          </div>
                          {idx < routing.operations.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Operations Library */}
        {activeTab === 'operations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3 font-semibold">Operation ID</th>
                  <th className="py-2.5 px-3 font-semibold">Operation Name</th>
                  <th className="py-2.5 px-3 font-semibold">Default Workstation</th>
                  <th className="py-2.5 px-3 font-semibold">Default Operating Rate</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOperations.map((op) => (
                  <tr key={op.operationId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-blue-600">{op.operationId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{op.operationName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{op.defaultWorkstationId || 'WS-MAIN'}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">${(op.defaultOperatingCost || 0).toFixed(2)} / hr</td>
                    <td className="py-3 px-3 text-slate-500">{op.description || 'Standard shop floor operation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Routing */}
      {isRoutingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-blue-600" />
                  Create Manufacturing Routing
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure sequence of workstation operations for BOM routing.
                </p>
              </div>
              <button
                onClick={() => setIsRoutingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRouting} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Routing ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. RT-DRONE-X1"
                    value={routingId}
                    onChange={(e) => setRoutingId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Routing Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Drone Chassis Assembly"
                    value={routingName}
                    onChange={(e) => setRoutingName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Code Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. EV-DRONE-X1"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Operations Sequence Builder */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Operation Sequence Steps</h3>
                  <button
                    type="button"
                    onClick={handleAddOperationRow}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-blue-600 rounded-md font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  {routingOps.map((op, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 border border-slate-200 rounded-lg shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Operation Name"
                          value={op.operationId}
                          onChange={(e) => {
                            const copy = [...routingOps];
                            copy[idx].operationId = e.target.value;
                            setRoutingOps(copy);
                          }}
                          className="px-2.5 py-1 border border-slate-200 rounded-md text-xs font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Workstation ID"
                          value={op.workstationId}
                          onChange={(e) => {
                            const copy = [...routingOps];
                            copy[idx].workstationId = e.target.value;
                            setRoutingOps(copy);
                          }}
                          className="px-2.5 py-1 border border-slate-200 rounded-md text-xs font-mono"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Mins"
                            value={op.timeInMins}
                            onChange={(e) => {
                              const copy = [...routingOps];
                              copy[idx].timeInMins = Number(e.target.value);
                              setRoutingOps(copy);
                            }}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs"
                          />
                          <span className="text-[10px] text-slate-500">mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500">$</span>
                          <input
                            type="number"
                            placeholder="Cost"
                            value={op.operatingCost}
                            onChange={(e) => {
                              const copy = [...routingOps];
                              copy[idx].operatingCost = Number(e.target.value);
                              setRoutingOps(copy);
                            }}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs"
                          />
                        </div>
                      </div>

                      {routingOps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOperationRow(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoutingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Routing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Operation */}
      {isOperationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                New Standard Operation
              </h2>
              <button
                onClick={() => setIsOperationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOperation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operation ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. OP-CNC-01"
                  value={newOpId}
                  onChange={(e) => setNewOpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision CNC Machining"
                  value={newOpName}
                  onChange={(e) => setNewOpName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Workstation</label>
                <input
                  type="text"
                  placeholder="e.g. WS-CNC-01"
                  value={newOpWorkstation}
                  onChange={(e) => setNewOpWorkstation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Hourly Operating Rate ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 15.00"
                  value={newOpCost}
                  onChange={(e) => setNewOpCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding tools, safety, or setup..."
                  value={newOpDesc}
                  onChange={(e) => setNewOpDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOperationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
