"use client";

import { useEffect, useState } from "react";
import { getDocuments, deleteDocument, Document } from "@/lib/api";
import { FileText, Clock, Plus, Search, Filter, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useModal } from "@/components/ModalContext";
import { toast } from "sonner";
import Link from "next/link";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { openModal } = useModal();

  const loadDocs = async () => {
    try {
      const res = await getDocuments(0, 50, search);
      setDocuments(res.content);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();

    const handleCreated = () => {
      loadDocs();
    };

    window.addEventListener("document-created", handleCreated);
    return () => {
      window.removeEventListener("document-created", handleCreated);
    };
  }, [search]);

  const handleDelete = async (docId: string, docTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${docTitle}"?`)) return;
    try {
      await deleteDocument(docId);
      toast.success("Document deleted successfully");
      loadDocs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
          <p className="text-sm text-slate-500">Manage and track your document workflows.</p>
        </div>
        <button 
          onClick={() => openModal("NEW_DOCUMENT")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 hover-lift"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search documents by title or number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">No documents found</h3>
                <p className="text-sm text-slate-500">Get started by creating your first document.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Document</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Workflow</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/workflows/documents/${doc.id}`} className="block">
                          <p className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{doc.title}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{doc.documentNumber}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.documentType}</td>
                      <td className="px-6 py-4 text-slate-600">{doc.workflowName || '-'}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 text-xs font-medium rounded-md border"
                          style={{
                            backgroundColor: doc.currentStateColor ? `${doc.currentStateColor}15` : '#f1f5f9',
                            color: doc.currentStateColor || '#475569',
                            borderColor: doc.currentStateColor ? `${doc.currentStateColor}30` : '#e2e8f0'
                          }}
                        >
                          {doc.currentStateName || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => handleDelete(doc.id, doc.title, e)}
                          title="Delete Document"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
