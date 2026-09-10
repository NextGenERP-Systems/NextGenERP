"use client";

import { useEffect, useState } from "react";
import { getDocumentApprovals, delegateDocument, bulkAction, getDelegations, createDelegation, cancelDelegation, Document, Delegation } from "@/lib/api";
import { CheckCircle, Clock, Search, UserCheck, Calendar, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  // Delegation State
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegateeUser, setDelegateeUser] = useState("");
  const [delegationDays, setDelegationDays] = useState(7);
  const [isSubmittingDelegation, setIsSubmittingDelegation] = useState(false);
  
  const { currentUser, isLoading: authLoading } = useAuth();

  const loadApprovals = async () => {
    if (!currentUser || currentUser.roles.length === 0) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    try {
      const roles = currentUser.roles.map(r => r.roleName);
      const [res, delRes] = await Promise.all([
        getDocumentApprovals(roles, currentUser.username, 0, 50),
        getDelegations(currentUser.username)
      ]);
      setDocuments(res.content);
      setDelegations(delRes.filter(d => d.isActive));
      setSelectedDocs([]); // Reset on reload
    } catch (err) {
      console.error("Failed to load approvals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !delegateeUser.trim()) return;
    setIsSubmittingDelegation(true);
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + delegationDays * 24 * 60 * 60 * 1000).toISOString();
      await createDelegation({
        delegatorUsername: currentUser.username,
        delegateeUsername: delegateeUser.trim(),
        startDate: start,
        endDate: end
      });
      toast.success(`Authority delegated to @${delegateeUser.trim()} for ${delegationDays} days!`);
      setDelegateeUser("");
      setShowDelegationModal(false);
      loadApprovals();
    } catch (err: any) {
      toast.error(err.message || "Failed to create delegation");
    } finally {
      setIsSubmittingDelegation(false);
    }
  };

  const handleCancelDelegation = async (id: string) => {
    try {
      await cancelDelegation(id);
      toast.success("Delegation cancelled");
      loadApprovals();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel delegation");
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDelegationModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Out-of-Office Delegation
          </button>
          
          {selectedDocs.length > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-800 font-medium">{selectedDocs.length} selected</span>
              <button onClick={() => handleBulkAction("Approve")} className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Approve All</button>
              <button onClick={() => handleBulkAction("Reject")} className="px-3 py-1 bg-white text-rose-600 border border-rose-200 rounded text-sm font-medium hover:bg-rose-50">Reject All</button>
            </div>
          )}
        </div>
      </div>

      {/* Active Delegation Banner */}
      {delegations.length > 0 && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="text-sm font-semibold text-indigo-900">Active Delegation Enabled</h4>
              <p className="text-xs text-indigo-700">
                Your approval authority is currently delegated to <strong>@{delegations[0].delegateeUsername}</strong> until {formatDate(delegations[0].endDate)}.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCancelDelegation(delegations[0].id)}
            className="text-xs font-semibold px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
          >
            Cancel Delegation
          </button>
        </div>
      )}

      {/* Delegation Modal */}
      {showDelegationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Out-of-Office Delegation
                </h3>
                <button onClick={() => setShowDelegationModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDelegation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Delegate Authority To (Username)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. john_doe"
                    value={delegateeUser}
                    onChange={e => setDelegateeUser(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Days)</label>
                  <select
                    value={delegationDays}
                    onChange={e => setDelegationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDelegationModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDelegation}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmittingDelegation ? <Clock className="w-4 h-4 animate-spin" /> : "Delegate Authority"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
