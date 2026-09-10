"use client";

import { useEffect, useState } from "react";
import { 
  getWorkflows, getStates, getTransitions, createTransition, deleteTransition, 
  Workflow, WorkflowState, WorkflowTransition, getAllRoles, AppRoleData 
} from "@/lib/api";
import { GitCompare, Plus, Trash2, Shield, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function StateTransitionsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [states, setStates] = useState<WorkflowState[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [roles, setRoles] = useState<AppRoleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromStateId, setFromStateId] = useState("");
  const [toStateId, setToStateId] = useState("");
  const [actionName, setActionName] = useState("");
  const [allowedRole, setAllowedRole] = useState("ALL");
  const [conditionExpression, setConditionExpression] = useState("");
  const [allowSelfApproval, setAllowSelfApproval] = useState(true);
  const [sendEmailToCreator, setSendEmailToCreator] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const wfs = await getWorkflows();
        setWorkflows(wfs);
        if (wfs.length > 0) {
          setSelectedWorkflowId(wfs[0].id);
        }
        const rList = await getAllRoles();
        setRoles(rList);
      } catch (e) {
        console.error("Failed to load workflows/roles", e);
      } finally {
        setLoading(false);
      }
    }
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (!selectedWorkflowId) return;
    async function loadWorkflowDetails() {
      setLoading(true);
      try {
        const [sts, trs] = await Promise.all([
          getStates(selectedWorkflowId),
          getTransitions(selectedWorkflowId)
        ]);
        setStates(sts);
        setTransitions(trs);
      } catch (e) {
        console.error("Failed to load states/transitions", e);
      } finally {
        setLoading(false);
      }
    }
    loadWorkflowDetails();
  }, [selectedWorkflowId]);

  const handleCreateTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStateId || !toStateId || !actionName) {
      toast.error("Please fill in From State, To State, and Action Name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTransition(selectedWorkflowId, {
        fromStateId,
        toStateId,
        actionName,
        allowedRole,
        conditionExpression: conditionExpression.trim() || undefined,
        allowSelfApproval,
        sendEmailToCreator
      });

      setTransitions([...transitions, res]);
      toast.success("State transition created successfully!");
      setIsModalOpen(false);
      
      // Reset form
      setFromStateId("");
      setToStateId("");
      setActionName("");
      setConditionExpression("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create transition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transitionId: string) => {
    if (!confirm("Are you sure you want to delete this transition rule?")) return;
    try {
      await deleteTransition(transitionId);
      setTransitions(transitions.filter(t => t.id !== transitionId));
      toast.success("Transition deleted");
    } catch (e: any) {
      toast.error("Failed to delete transition");
    }
  };

  const getStateName = (id: string) => states.find(s => s.id === id)?.stateName || id;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">State Transitions</h1>
          <p className="text-sm text-slate-500">Define rule-based transitions and required roles between workflow states.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedWorkflowId} 
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>{wf.workflowName} ({wf.documentType})</option>
            ))}
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedWorkflowId}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Transition Rule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">From State</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">To State</th>
                <th className="px-6 py-4">Allowed Role</th>
                <th className="px-6 py-4">Condition Rule</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No transition rules configured for this workflow. Click "Add Transition Rule" to define one.
                  </td>
                </tr>
              ) : (
                transitions.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{getStateName(tr.fromStateId)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {tr.actionName}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{getStateName(tr.toStateId)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Shield className="w-3 h-3 text-slate-400" />
                        {tr.allowedRole || "ALL"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {tr.conditionExpression ? (
                        <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
                          {tr.conditionExpression}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(tr.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                Add State Transition Rule
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTransition} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">From State</label>
                  <select 
                    required 
                    value={fromStateId} 
                    onChange={e => setFromStateId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select State...</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.stateName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">To State</label>
                  <select 
                    required 
                    value={toStateId} 
                    onChange={e => setToStateId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select State...</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.stateName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Action Name</label>
                <input 
                  required
                  type="text" 
                  value={actionName}
                  onChange={e => setActionName(e.target.value)}
                  placeholder="e.g. Approve, Reject, Submit For Review"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Required Role</label>
                <select 
                  value={allowedRole}
                  onChange={e => setAllowedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="ALL">Any Role (ALL)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.roleName}>{r.roleName}</option>
                  ))}
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="FINANCE_DIRECTOR">FINANCE_DIRECTOR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Condition Rule (SpEL Expression)
                </label>
                <input 
                  type="text" 
                  value={conditionExpression}
                  onChange={e => setConditionExpression(e.target.value)}
                  placeholder="e.g. #amount > 5000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Optional condition string using SpEL context variables: <code className="text-blue-600">#amount</code>, <code className="text-blue-600">#doc</code>.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowSelfApproval}
                    onChange={e => setAllowSelfApproval(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Allow Self Approval
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={sendEmailToCreator}
                    onChange={e => setSendEmailToCreator(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Notify Creator
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : "Save Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
