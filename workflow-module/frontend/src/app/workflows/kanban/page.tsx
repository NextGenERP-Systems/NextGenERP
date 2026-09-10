"use client";

import { useEffect, useState, useCallback } from "react";
import { getMasterStates, getKanbanDocuments, Document, MasterState } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { Layers, Clock, User, ArrowRight, Search, ChevronDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ColumnState {
  stateName: string;
  stateId?: string;
  colorCode: string;
  documents: Document[];
  page: number;
  totalPages: number;
  totalElements: number;
  loadingMore: boolean;
}

export default function DocumentKanbanPage() {
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();

  const initKanban = useCallback(async () => {
    setLoading(true);
    try {
      const states = await getMasterStates();
      const defaultStateNames = ["Draft", "Pending Approval", "Approved", "Rejected"];
      
      const columnsToBuild: { name: string; id?: string; color: string }[] = states.length > 0
        ? states.map(s => ({ name: s.stateName, id: s.id, color: s.colorCode || "#64748b" }))
        : defaultStateNames.map(name => ({ name, color: "#64748b" }));

      const columnPromises = columnsToBuild.map(async (col) => {
        try {
          const pageData = await getKanbanDocuments(col.name, col.id, 0, 10, searchQuery);
          return {
            stateName: col.name,
            stateId: col.id,
            colorCode: col.color,
            documents: pageData.content,
            page: pageData.number,
            totalPages: pageData.totalPages,
            totalElements: pageData.totalElements,
            loadingMore: false,
          };
        } catch (err) {
          console.error(`Failed loading kanban docs for ${col.name}`, err);
          return {
            stateName: col.name,
            stateId: col.id,
            colorCode: col.color,
            documents: [],
            page: 0,
            totalPages: 0,
            totalElements: 0,
            loadingMore: false,
          };
        }
      });

      const loadedCols = await Promise.all(columnPromises);
      setColumns(loadedCols);
    } catch (e) {
      console.error("Failed to initialize kanban", e);
      toast.error("Failed to load kanban data");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    initKanban();
  }, [initKanban]);

  const handleLoadMore = async (stateName: string) => {
    const targetColIndex = columns.findIndex(c => c.stateName === stateName);
    if (targetColIndex === -1) return;

    const col = columns[targetColIndex];
    if (col.page + 1 >= col.totalPages || col.loadingMore) return;

    // Set loading state for column
    setColumns(prev => prev.map((c, idx) => idx === targetColIndex ? { ...c, loadingMore: true } : c));

    try {
      const nextPage = col.page + 1;
      const pageData = await getKanbanDocuments(col.stateName, col.stateId, nextPage, 10, searchQuery);

      setColumns(prev => prev.map((c, idx) => {
        if (idx === targetColIndex) {
          return {
            ...c,
            documents: [...c.documents, ...pageData.content],
            page: pageData.number,
            totalPages: pageData.totalPages,
            totalElements: pageData.totalElements,
            loadingMore: false,
          };
        }
        return c;
      }));
    } catch (e: any) {
      toast.error(`Failed loading more for ${stateName}`);
      setColumns(prev => prev.map((c, idx) => idx === targetColIndex ? { ...c, loadingMore: false } : c));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            Document Workflow Kanban
          </h1>
          <p className="text-sm text-slate-500">Live visual tracking dashboard categorized by document workflow state with server-side pagination.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={() => initKanban()}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map(col => {
            const hasMore = col.page + 1 < col.totalPages;

            return (
              <div key={col.stateName} className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.colorCode }} />
                    <h3 className="font-semibold text-slate-800 text-sm">{col.stateName}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {col.documents.length} / {col.totalElements}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {col.documents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic">
                      No documents in {col.stateName}
                    </div>
                  ) : (
                    col.documents.map(doc => (
                      <div key={doc.id} className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 group">
                        <div className="flex items-start justify-between">
                          <Link 
                            href={`/workflows/documents/${doc.id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-sm line-clamp-1"
                          >
                            {doc.title || doc.documentNumber}
                          </Link>
                        </div>

                        <p className="text-xs text-slate-500 font-mono">
                          {doc.documentNumber}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {doc.ownerUsername}
                          </span>

                          {doc.amount != null && (
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              ${doc.amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/workflows/documents/${doc.id}`}
                              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1"
                            >
                              View
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-3 mt-3 border-t border-slate-200 text-center">
                    <button
                      onClick={() => handleLoadMore(col.stateName)}
                      disabled={col.loadingMore}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                    >
                      {col.loadingMore ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          Load More ({col.totalElements - col.documents.length} remaining)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
