"use client";

import { useEffect, useState } from "react";
import { getWorkflows, Workflow } from "@/lib/api";
import { Layers, Clock, Plus, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useModal } from "@/components/ModalContext";
import Link from "next/link";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getWorkflows();
        setWorkflows(res);
      } catch (err) {
        console.error("Failed to load workflows", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workflow Definitions</h1>
          <p className="text-sm text-slate-500">Create and manage your business process workflows.</p>
        </div>
        <button 
          onClick={() => openModal("NEW_WORKFLOW")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 hover-lift"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {workflows.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Layers className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">No workflows found</h3>
                <p className="text-sm text-slate-500">Define a workflow to automate your processes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {workflows.map(wf => (
                  <Link href={`/workflows/definitions/${wf.id}`} key={wf.id} className="block">
                    <div className="border border-slate-200 rounded-xl p-5 hover:shadow-premium hover:border-blue-200 transition-all cursor-pointer bg-white group h-full flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Layers className="w-5 h-5" />
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg mb-1">{wf.workflowName}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">Manages the lifecycle for {wf.documentType} documents.</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4 flex-1">
                        <span className="text-[10px] font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {wf.documentType}
                        </span>
                        <span className="text-[10px] font-semibold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          ACTIVE
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                        <span>Created {formatDate(wf.createdAt || '')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
