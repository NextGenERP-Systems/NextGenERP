"use client";

import { useEffect, useState } from "react";
import { 
  getDocumentById, 
  getDocumentHistory, 
  getTransitions, 
  transitionDocument,
  updateDocument,
  deleteDocument,
  Document,
  WorkflowHistory, 
  WorkflowTransition,
  WorkflowState,
  getStates
} from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { 
  FileText, Clock, ArrowLeft, CheckCircle, 
  XCircle, Send, History, AlertCircle, ShieldAlert, Edit3, Save, X, Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [history, setHistory] = useState<WorkflowHistory[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Inline Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editContentHtml, setEditContentHtml] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { currentUser, isLoading: authLoading } = useAuth();
  const [allStates, setAllStates] = useState<WorkflowState[]>([]);

  const loadData = async () => {
    try {
      const doc = await getDocumentById(id);
      setDocument(doc);
      setEditTitle(doc.title);
      setEditAmount(doc.amount || 0);
      setEditContentHtml(doc.contentHtml || "");
      
      const hist = await getDocumentHistory(id);
      setHistory(hist);

      if (doc.workflowId) {
        const [trans, statesData] = await Promise.all([
          getTransitions(doc.workflowId),
          getStates(doc.workflowId)
        ]);
        const availableTransitions = trans.filter(t => t.fromStateId === doc.currentStateId);
        setTransitions(availableTransitions);
        setAllStates(statesData);
      }
    } catch (err) {
      console.error("Failed to load document details", err);
      toast.error("Failed to load document details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleTransition = async (action: string) => {
    if (!document || !currentUser) return;
    setActionLoading(action);
    try {
      const transition = transitions.find(t => t.actionName === action);
      const userRoleNames = currentUser.roles.map(r => r.roleName);
      const matchingRole = userRoleNames.find(r => r.toLowerCase() === (transition?.allowedRole || '').toLowerCase())
        || (userRoleNames.includes('ADMIN') ? 'ADMIN' : userRoleNames[0] || 'USER');
      
      await transitionDocument(id, action, matchingRole, currentUser.username, comments);
      toast.success(`Action '${action}' performed successfully!`);
      setComments("");
      setSelectedAction(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || `Failed to perform action '${action}'`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!document || !currentUser) return;
    setIsSavingEdit(true);
    try {
      const userRoleNames = currentUser.roles.map(r => r.roleName);
      const roleToUse = userRoleNames.includes('ADMIN') ? 'ADMIN' : userRoleNames[0] || 'USER';
      await updateDocument(id, {
        title: editTitle,
        amount: editAmount,
        contentHtml: editContentHtml
      }, roleToUse);
      toast.success("Document updated successfully!");
      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update document");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!document) return;
    if (!confirm(`Are you sure you want to delete document "${document.title}"?`)) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted successfully");
      router.push("/workflows/documents");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>;
  }

  if (!document) {
    return <div className="text-center py-20 text-slate-500">Document not found</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <Link href="/workflows/documents" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Documents
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">{document.title}</h1>
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: `${document.currentStateColor || '#64748b'}20`,
                borderColor: `${document.currentStateColor || '#64748b'}40`,
                color: document.currentStateColor || '#64748b'
              }}
            >
              {document.currentStateName || 'Draft'}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {document.documentType} &bull; {document.documentNumber}
          </p>
        </div>
        
        {/* Action Buttons based on Workflow Transitions */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acting as:</span>
              <span className="text-sm font-bold text-blue-600">{currentUser?.username}</span>
            </div>
            <button
              onClick={handleDeleteDocument}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Document
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end">
            {transitions.filter(t => currentUser?.roles.some(r => r.roleName === t.allowedRole) || currentUser?.roles.some(r => r.roleName === 'ADMIN')).map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedAction(t.actionName)}
              disabled={actionLoading !== null}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 hover-lift ${
                t.actionName.toLowerCase().includes('approve') 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                  : t.actionName.toLowerCase().includes('reject')
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {actionLoading === t.actionName ? <Clock className="w-4 h-4 animate-spin" /> : 
                t.actionName.toLowerCase().includes('approve') ? <CheckCircle className="w-4 h-4" /> :
                t.actionName.toLowerCase().includes('reject') ? <XCircle className="w-4 h-4" /> :
                <Send className="w-4 h-4" />
              }
              {t.actionName}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Document Details */}
        <div className="lg:col-span-2 space-y-6">
          {document.currentStateId && allStates.find(s => s.id === document.currentStateId)?.allowEditRole && 
           !currentUser?.roles.some(r => r.roleName === allStates.find(s => s.id === document.currentStateId)?.allowEditRole) && 
           !currentUser?.roles.some(r => r.roleName === 'ADMIN') && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Editing Restricted</h4>
                <p className="text-xs mt-1 text-amber-700/80">Only users with the <strong>{allStates.find(s => s.id === document.currentStateId)?.allowEditRole}</strong> role can edit this document in its current state.</p>
              </div>
            </div>
          )}

          <div className="premium-card p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">Document Data</h3>
              {(!document.currentStateId || !allStates.find(s => s.id === document.currentStateId)?.allowEditRole || 
                currentUser?.roles.some(r => r.roleName === allStates.find(s => s.id === document.currentStateId)?.allowEditRole) ||
                currentUser?.roles.some(r => r.roleName === 'ADMIN')) && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-slate-700"
                >
                  {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                  {isEditing ? "Cancel Edit" : "Edit Document"}
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount / Value ($)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">HTML Content</label>
                  <textarea
                    value={editContentHtml}
                    onChange={e => setEditContentHtml(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-900 text-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    {isSavingEdit ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Amount / Value</span>
                    <span className="font-medium text-slate-900">${document.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Owner</span>
                    <span className="font-medium text-slate-900">{document.ownerUsername}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Created At</span>
                    <span className="font-medium text-slate-900">{formatDate(document.createdAt)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Workflow Applied</span>
                    <span className="font-medium text-slate-900">{document.workflowName || 'None'}</span>
                  </div>
                </div>

                {document.contentHtml && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <span className="block text-slate-500 mb-3 text-sm">Content</span>
                    <div 
                      className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: document.contentHtml }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Modal */}
          {selectedAction && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                    {selectedAction.toLowerCase().includes('approve') ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                     selectedAction.toLowerCase().includes('reject') ? <XCircle className="w-5 h-5 text-rose-600" /> :
                     <Send className="w-5 h-5 text-blue-600" />}
                    Confirm Action: {selectedAction}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">Please provide any comments or justification for this action.</p>
                  
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Comments (optional)..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y text-sm mb-4"
                    rows={4}
                    autoFocus
                  />
                  
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { setSelectedAction(null); setComments(''); }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      disabled={actionLoading !== null}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleTransition(selectedAction)}
                      disabled={actionLoading !== null}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                        selectedAction.toLowerCase().includes('approve') 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                          : selectedAction.toLowerCase().includes('reject')
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                      } disabled:opacity-50`}
                    >
                      {actionLoading === selectedAction ? <Clock className="w-4 h-4 animate-spin" /> : 'Confirm ' + selectedAction}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div className="premium-card p-6 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <History className="w-5 h-5 text-slate-400" /> Workflow History
            </h3>
            
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No history recorded yet.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {history.map((h, i) => (
                  <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded border border-slate-100 bg-slate-50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-slate-800 text-xs">{h.actionName}</div>
                        <time className="text-[10px] text-slate-400">{formatDate(h.createdAt)}</time>
                      </div>
                      <div className="text-[11px] text-slate-600">By {h.performedBy}</div>
                      {h.comments && (
                        <div className="text-[11px] text-slate-500 mt-1 italic border-l-2 border-slate-200 pl-2">
                          "{h.comments}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
