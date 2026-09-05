"use client";

import { useEffect, useState } from "react";
import { getDocumentApprovals, delegateDocument, bulkAction, Document } from "@/lib/api";
import { CheckCircle, Clock, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function ApprovalsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  const { currentUser, isLoading: authLoading } = useAuth();

  const loadApprovals = async () => {
    if (!currentUser || currentUser.roles.length === 0) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    try {
      const roles = currentUser.roles.map(r => r.roleName);
      const res = await getDocumentApprovals(roles, currentUser.username, 0, 50);
      setDocuments(res.content);
      setSelectedDocs([]); // Reset on reload
    } catch (err) {
      console.error("Failed to load approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [currentUser]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocs(documents.map(d => d.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(d => d !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDocs.length === 0) return;
    try {
      await bulkAction(selectedDocs, action, currentUser!.roles[0].roleName, currentUser!.username, "Bulk " + action);
      alert("Bulk " + action + " successful");
      loadApprovals();
    } catch (e: any) {
      alert("Error processing bulk action: " + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>
          <p className="text-sm text-slate-500">Documents waiting for your review and action.</p>
        </div>
        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-800 font-medium">{selectedDocs.length} selected</span>
            <button onClick={() => handleBulkAction("Approve")} className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Approve All</button>
            <button onClick={() => handleBulkAction("Reject")} className="px-3 py-1 bg-white text-rose-600 border border-rose-200 rounded text-sm font-medium hover:bg-rose-50">Reject All</button>
          </div>
        )}
      </div>

      <div className="premium-card rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
        {loading || authLoading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <CheckCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">You're all caught up!</h3>
                <p className="text-sm text-slate-500">No documents require your approval at this time.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={documents.length > 0 && selectedDocs.length === documents.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3">Document</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">State</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{doc.title}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{doc.documentNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {doc.ownerUsername.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-slate-600">@{doc.ownerUsername}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 text-xs font-medium rounded-md border"
                          style={{
                            backgroundColor: doc.currentStateColor ? `${doc.currentStateColor}15` : '#f1f5f9',
                            color: doc.currentStateColor || '#475569',
                            borderColor: doc.currentStateColor ? `${doc.currentStateColor}30` : '#e2e8f0'
                          }}
                        >
                          {doc.currentStateName || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={async () => {
                              const target = window.prompt(`Delegate ${doc.documentNumber} to (enter username):`);
                              if (target && target.trim() !== "") {
                                try {
                                  await delegateDocument(doc.id, target.trim(), currentUser!.username);
                                  alert("Delegated successfully");
                                  loadApprovals();
                                } catch (e: any) {
                                  alert("Error: " + e.message);
                                }
                              }
                            }}
                            className="text-slate-500 hover:text-indigo-600 font-medium text-sm transition-colors"
                          >
                            Delegate
                          </button>
                          <Link href={`/workflows/documents/${doc.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                            Review
                          </Link>
                        </div>
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
