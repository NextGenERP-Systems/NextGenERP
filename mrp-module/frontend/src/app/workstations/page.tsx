'use client';

import { Cpu } from 'lucide-react';

export default function WorkstationsPage() {
  const workstations = [
    {
      id: 'WS-CNC-01',
      name: '5-Axis Precision CNC Machining Center',
      hourlyCost: 65.00,
      workingHours: 16.0,
      loadPercent: 75,
      status: 'Active'
    },
    {
      id: 'WS-ASM-01',
      name: 'Avionics & Harness Assembly Station',
      hourlyCost: 45.00,
      workingHours: 8.0,
      loadPercent: 90,
      status: 'High Demand'
    },
    {
      id: 'WS-TEST-01',
      name: 'Automated Flight & Quality Test Bench',
      hourlyCost: 55.00,
      workingHours: 8.0,
      loadPercent: 40,
      status: 'Optimal'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-blue-600" />
            Workstation Machine Capacity & Gantt Scheduling
          </h1>
          <p className="text-sm text-gray-500">Monitor machine hourly operating costs, daily working hours, and capacity loads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workstations.map((ws) => (
          <div key={ws.id} className="glass-card p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-xs font-mono text-blue-600 font-bold">{ws.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {ws.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">{ws.name}</h3>
            </div>

            <div className="space-y-2 text-xs font-mono text-gray-600">
              <div className="flex justify-between">
                <span>Hourly Operating Cost:</span>
                <span className="text-gray-900 font-bold">${ws.hourlyCost.toFixed(2)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span>Shift Hours Limit:</span>
                <span className="text-gray-900 font-bold">{ws.workingHours} hrs/day</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-500">Workstation Capacity Load</span>
                <span className="text-blue-600 font-bold">{ws.loadPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                <div 
                  className={`h-full rounded-full transition-all ${
                    ws.loadPercent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${ws.loadPercent}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
