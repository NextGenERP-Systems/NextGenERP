"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, getMasterStates, WorkflowHistory, MasterState } from "@/lib/api";
import { History, Search, RefreshCw, User, Calendar, FileText, CheckCircle2, ArrowRight, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AuditTrailPage() {
  const [history, setHistory] = useState<WorkflowHistory[]>([]);
  const [masterStates, setMasterStates] = useState<MasterState[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadAuditData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsData, statesData] = await Promise.all([
        getAuditLogs(page, 15, searchQuery),
        getMasterStates()
      ]);
      setHistory(logsData.content);
      setTotalPages(logsData.totalPages);
      setTotalElements(logsData.totalElements);
      setMasterStates(statesData);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
      toast.error("Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  const getStateName = (stateId?: string) => {
    if (!stateId) return "Initial Creation / None";
    const found = masterStates.find(s => s.id === stateId);
    return found ? found.stateName : stateId.substring(0, 8) + "...";
  };

  const getStateColor = (stateId?: string) => {
    if (!stateId) return "#64748b";
    const found = masterStates.find(s => s.id === stateId);
    return found?.colorCode || "#3b82f6";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Workflow Audit Trail
          </h1>
          <p className="text-sm text-slate-500">Immutable ledger of all document transitions, user actions, and workflow updates.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search user, action, comments..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>

          <button 
            onClick={() => loadAuditData()}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Audit Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-slate-400 w-8 h-8" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm italic">
            No audit records found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Document ID</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">From State</th>
                  <th className="py-3.5 px-4">To State</th>
                  <th className="py-3.5 px-4">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/workflows/documents/${log.documentId}`}
                        className="font-mono text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {log.documentId.substring(0, 8)}...
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-800 font-medium text-xs">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.performedBy || "System"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-md">
                        {log.actionName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: getStateColor(log.fromStateId) }} 
                        />
                        {getStateName(log.fromStateId)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: getStateColor(log.toStateId) }} 
                        />
                        {getStateName(log.toStateId)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {log.comments || <span className="text-slate-300 italic">No comment</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Showing {history.length} of {totalElements} audit log records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="text-xs text-slate-600 px-2 font-medium">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page + 1 >= totalPages || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 flex items-center gap-1 shadow-2xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
