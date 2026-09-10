"use client";

import { useEffect, useState } from "react";
import { getDocuments, Document, getWorkflows, Workflow, getSystemSummary, getDocumentsByStatus, getPendingByWorkflow } from "@/lib/api";
import { FileText, CheckCircle, Clock, AlertCircle, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [statusData, setStatusData] = useState<{name: string, value: number}[]>([]);
  const [pendingData, setPendingData] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [docsRes, wfsRes, summaryRes, statusRes, pendingRes] = await Promise.all([
          getDocuments(0, 5, ""),
          getWorkflows(),
          getSystemSummary(),
          getDocumentsByStatus(),
          getPendingByWorkflow()
        ]);
        setDocuments(docsRes.content);
        setWorkflows(wfsRes);
        setSummary(summaryRes);
        
        // Format status data for Recharts
        const formattedStatus = Object.entries(statusRes).map(([key, val]) => ({
          name: key,
          value: val
        }));
        setStatusData(formattedStatus);

        // Format pending data for Recharts (mapping workflow IDs to names if possible, else just use the shortened ID)
        const formattedPending = Object.entries(pendingRes).map(([key, val]) => {
            const wf = wfsRes.find(w => w.id.startsWith(key));
            return {
                name: wf ? wf.workflowName : key,
                value: val
            }
        });
        setPendingData(formattedPending);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time overview of workflow activity, time-in-state analytics, and document statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric Cards */}
        <div className="bg-white p-6 rounded-2xl flex flex-col justify-center gap-2 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Documents</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{summary.totalDocuments || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl flex flex-col justify-center gap-2 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Active Workflows</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{workflows.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl flex flex-col justify-center gap-2 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Pending Actions</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {pendingData.reduce((acc, curr) => acc + curr.value, 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl flex flex-col justify-center gap-2 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Actions Logged</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{summary.totalActions || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by Status Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Documents by Status</h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-slate-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions by Workflow Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Pending Actions by Workflow</h3>
          <div className="h-72">
             {pendingData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={pendingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                   <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                   <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                   <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400">No pending actions found</div>
             )}
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Recently Updated Documents</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-500">{doc.documentNumber} • Last updated {formatDate(doc.updatedAt)} by @{doc.ownerUsername}</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {doc.status || 'Unknown'}
              </span>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">No recent documents found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
