"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { fetchProjects, createTimesheet } from "@/lib/api";

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogTimeModal({ isOpen, onClose, onSuccess }: LogTimeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects().then(setProjects).catch(console.error);
    }
  }, [isOpen]);

  // Header State
  const [headerData, setHeaderData] = useState({
    series: "",
    company: "",
    customer: "",
    currency: "INR",
    exchangeRate: "1.000",
    status: "Draft",
    project: "",
    employee: ""
  });

  // Data Grid State
  const [timeLogs, setTimeLogs] = useState([
    { id: Date.now(), activityType: "", fromTime: "", hrs: "", project: "", isBillable: true }
  ]);

  if (!isOpen) return null;

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHeaderData(prev => ({ ...prev, [name]: value }));
  };

  const addLog = () => {
    setTimeLogs([...timeLogs, { id: Date.now(), activityType: "", fromTime: "", hrs: "", project: headerData.project, isBillable: true }]);
  };

  const removeLog = (id: number) => {
    setTimeLogs(timeLogs.filter(log => log.id !== id));
  };

  const updateLog = (id: number, field: string, value: any) => {
    setTimeLogs(timeLogs.map(log => log.id === id ? { ...log, [field]: value } : log));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerData.series || !headerData.employee || !headerData.project) {
      toast.error("Please fill in mandatory Series, Employee, and Project fields");
      return;
    }

    const hasEmptyLogs = timeLogs.some(log => !log.hrs || !log.activityType);
    if (hasEmptyLogs) {
      toast.error("Please complete all fields in the timesheet data grid");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: "00000000-0000-0000-0000-000000000000",
        projectId: headerData.project,
        status: headerData.status,
        totalHours: timeLogs.reduce((acc, log) => acc + parseFloat(log.hrs || '0'), 0),
        timeLogs: timeLogs.map(log => {
          const logDate = log.fromTime ? new Date(log.fromTime) : new Date();
          return {
            activityType: null,
            description: log.activityType,
            hours: parseFloat(log.hrs),
            isBillable: log.isBillable,
            date: logDate.toISOString().split('T')[0],
            fromTime: logDate.toTimeString().split(' ')[0],
            toTime: new Date(logDate.getTime() + parseFloat(log.hrs) * 3600000).toTimeString().split(' ')[0]
          };
        })
      };
      await createTimesheet(payload);
      toast.success("Timesheet logged successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to log timesheet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Timesheet</h2>
            <p className="text-slate-500 text-sm">Log time spent on projects or tasks.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70 text-sm"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save size={16} />}
              Save Timesheet
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Series <span className="text-red-500">*</span></label>
              <select name="series" value={headerData.series} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                <option value="">Select Series</option>
                <option value="TS-YYYY-">TS-YYYY-</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Company</label>
              <input type="text" name="company" value={headerData.company} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Customer</label>
              <input type="text" name="customer" value={headerData.customer} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Project <span className="text-red-500">*</span></label>
              <select name="project" value={headerData.project} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Status</label>
              <input type="text" name="status" value={headerData.status} readOnly className="w-full border border-slate-200 bg-slate-50 text-gray-700 rounded-lg px-4 py-2.5 outline-none font-bold" />
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Currency</label>
              <input type="text" name="currency" value={headerData.currency} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Exchange Rate</label>
              <input type="number" name="exchangeRate" value={headerData.exchangeRate} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" step="0.001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Employee <span className="text-red-500">*</span></label>
              <input type="text" name="employee" value={headerData.employee} onChange={handleHeaderChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Lookup Employee" />
            </div>
          </div>

          {/* Time Sheets Data Grid */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Time Sheets Data Grid</h3>
              <button type="button" onClick={addLog} className="flex items-center gap-1 text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus size={16} /> Add Row
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase w-12 text-center">No.</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Activity Type</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">From Time</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase w-24">Hrs</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Project</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase w-24 text-center">Billable</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timeLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={log.activityType} 
                          onChange={(e) => updateLog(log.id, 'activityType', e.target.value)}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" 
                          placeholder="e.g. Planning"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="datetime-local" 
                          value={log.fromTime} 
                          onChange={(e) => updateLog(log.id, 'fromTime', e.target.value)}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" 
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          value={log.hrs} 
                          onChange={(e) => updateLog(log.id, 'hrs', e.target.value)}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center text-gray-900 bg-white" 
                          placeholder="0.0"
                          step="0.5"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={log.project} 
                          onChange={(e) => updateLog(log.id, 'project', e.target.value)}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" 
                          placeholder="Lookup Project"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={log.isBillable}
                          onChange={(e) => updateLog(log.id, 'isBillable', e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeLog(log.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {timeLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium border-2 border-dashed border-slate-200 bg-slate-50">
                        No time logs added yet. Click "Add Row" to start tracking time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
