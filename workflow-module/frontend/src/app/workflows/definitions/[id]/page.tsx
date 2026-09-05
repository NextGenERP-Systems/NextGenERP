"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getWorkflowById, 
  getStates, 
  createState,
  getTransitions,
  createTransition,
  updateWorkflowStatus,
  deleteState,
  deleteTransition,
  Workflow,
  WorkflowState,
  WorkflowTransition,
  getMasterStates,
  MasterState
} from "@/lib/api";
import { 
  Settings, ArrowLeft, Plus, Clock, Circle, ArrowRight, Save, Trash2 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import WorkflowGraph from "@/components/workflow/WorkflowGraph";

export default function WorkflowBuilderPage() {
  const params = useParams();
  const id = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [states, setStates] = useState<WorkflowState[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [masterStates, setMasterStates] = useState<MasterState[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"states" | "transitions" | "graph">("states");

  // New State Form
  const [newStateName, setNewStateName] = useState("");
  const [newStateColor, setNewStateColor] = useState("#3b82f6");
  const [isInitialState, setIsInitialState] = useState(false);
  const [isFinalState, setIsFinalState] = useState(false);
  const [newUpdateFields, setNewUpdateFields] = useState<{key: string, value: string}[]>([]);
  const [newAllowEditRole, setNewAllowEditRole] = useState("");
  const [isOptionalState, setIsOptionalState] = useState(false);
  const [newSendEmail, setNewSendEmail] = useState(false);
  const [newSlaDays, setNewSlaDays] = useState<number | "">("");
  const [newEscalationRole, setNewEscalationRole] = useState("");
  const [newRequiresAllRoles, setNewRequiresAllRoles] = useState(false);
  const [newRequiredRoles, setNewRequiredRoles] = useState("");
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  // New Transition Form
  const [newTransAction, setNewTransAction] = useState("");
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [newTransRole, setNewTransRole] = useState("Admin");
  const [newCondition, setNewCondition] = useState("");
  const [newAllowSelfApproval, setNewAllowSelfApproval] = useState(true);
  const [newSendEmailToCreator, setNewSendEmailToCreator] = useState(false);
  const [isSubmittingTrans, setIsSubmittingTrans] = useState(false);

  const loadData = async () => {
    try {
      const [wf, sts, trans, mStates] = await Promise.all([
        getWorkflowById(id),
        getStates(id),
        getTransitions(id),
        getMasterStates()
      ]);
      setWorkflow(wf);
      setStates(sts);
      setTransitions(trans);
      setMasterStates(mStates);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workflow data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingState(true);
    try {
      await createState(id, {
        stateName: newStateName,
        colorCode: newStateColor,
        isInitialState,
        isFinalState,
        updateFields: newUpdateFields.reduce((acc, curr) => {
          if (curr.key && curr.value) acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>),
        allowEditRole: newAllowEditRole,
        isOptionalState,
        sendEmail: newSendEmail,
        slaDays: newSlaDays === "" ? undefined : newSlaDays,
        escalationRole: newEscalationRole,
        requiresAllRoles: newRequiresAllRoles,
        requiredRoles: newRequiredRoles
      });
      toast.success("State added successfully");
      setNewStateName("");
      setIsInitialState(false);
      setIsFinalState(false);
      setNewUpdateFields([]);
      setNewAllowEditRole("");
      setIsOptionalState(false);
      setNewSendEmail(false);
      setNewSlaDays("");
      setNewEscalationRole("");
      setNewRequiresAllRoles(false);
      setNewRequiredRoles("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add state");
    } finally {
      setIsSubmittingState(false);
    }
  };

  const handleCreateTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTrans(true);
    try {
      await createTransition(id, {
        fromStateId: newTransFrom,
        toStateId: newTransTo,
        actionName: newTransAction,
        allowedRole: newTransRole,
        conditionExpression: newCondition,
        allowSelfApproval: newAllowSelfApproval,
        sendEmailToCreator: newSendEmailToCreator
      });
      toast.success("Transition added successfully");
      setNewTransAction("");
      setNewCondition("");
      setNewAllowSelfApproval(true);
      setNewSendEmailToCreator(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add transition");
    } finally {
      setIsSubmittingTrans(false);
    }
  };

  const handleDeleteState = async (stateId: string) => {
    if (!confirm("Are you sure you want to delete this state? It may break existing transitions.")) return;
    try {
      await deleteState(stateId);
      toast.success("State deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete state");
    }
  };

  const handleDeleteTransition = async (transId: string) => {
    if (!confirm("Are you sure you want to delete this transition?")) return;
    try {
      await deleteTransition(transId);
      toast.success("Transition deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transition");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>;
  }

  if (!workflow) {
    return <div className="text-center py-20 text-slate-500">Workflow not found</div>;
  }

  const toggleWorkflowStatus = async () => {
    try {
      await updateWorkflowStatus(id, !workflow.isActive);
      toast.success(`Workflow ${!workflow.isActive ? 'Activated' : 'Deactivated'}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update workflow status");
    }
  };

  const getStateName = (stateId: string) => {
    return states.find(s => s.id === stateId)?.stateName || "Unknown";
  };
  const getStateColor = (stateId: string) => {
    return states.find(s => s.id === stateId)?.colorCode || "#cbd5e1";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <Link href="/workflows/definitions" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Workflows
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{workflow.workflowName}</h1>
            <p className="text-sm text-slate-500">Document Type: {workflow.documentType} &bull; {workflow.isActive ? 'Active' : 'Draft'}</p>
          </div>
        </div>
        <button 
          onClick={toggleWorkflowStatus}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
            workflow.isActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {workflow.isActive ? 'Deactivate Workflow' : 'Activate Workflow'}
        </button>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-200">
        <div className="flex border-b border-slate-100 px-2 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("states")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "states" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Workflow States
          </button>
          <button
            onClick={() => setActiveTab("transitions")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transitions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Transitions (Rules)
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "graph" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Visual Graph
          </button>
        </div>

        <div className="p-6">
          {activeTab === "graph" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Workflow Visualization</h3>
              <WorkflowGraph 
                states={states} 
                transitions={transitions} 
                onAddTransition={async (fromStateId, toStateId, actionName, allowedRole, conditionExpression) => {
                  await createTransition(id, {
                    fromStateId,
                    toStateId,
                    actionName,
                    allowedRole,
                    conditionExpression,
                    allowSelfApproval: true,
                    sendEmailToCreator: false
                  });
                }}
                onDeleteTransition={async (transitionId) => {
                  await deleteTransition(transitionId);
                }}
                onRefresh={loadData}
              />
            </div>
          )}

          {activeTab === "states" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Configured States</h3>
                {states.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-500">No states defined yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {states.map(state => (
                      <div key={state.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Circle className="w-4 h-4" fill={state.colorCode} color={state.colorCode} />
                          <span className="font-medium text-slate-700">{state.stateName}</span>
                          {state.isInitialState && <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-wider">Initial</span>}
                          {state.isFinalState && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">Final</span>}
                        </div>
                        <button onClick={() => handleDeleteState(state.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Add New State</h3>
                <form onSubmit={handleCreateState} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State Name</label>
                    <div className="space-y-2">
                      <select 
                        onChange={e => {
                          if (e.target.value) {
                            setNewStateName(e.target.value);
                            const ms = masterStates.find(m => m.stateName === e.target.value);
                            if (ms) setNewStateColor(ms.colorCode);
                          }
                        }} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="">-- Select from Master States (Optional) --</option>
                        {masterStates.map(ms => (
                          <option key={ms.id} value={ms.stateName}>{ms.stateName}</option>
                        ))}
                      </select>
                      <input 
                        type="text"
                        required
                        value={newStateName} 
                        onChange={e => setNewStateName(e.target.value)} 
                        placeholder="Or enter custom state name..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color Code</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={newStateColor} 
                        onChange={e => setNewStateColor(e.target.value)} 
                        className="w-10 h-10 rounded cursor-pointer border border-slate-300 p-1" 
                      />
                      <input 
                        type="text" 
                        value={newStateColor} 
                        onChange={e => setNewStateColor(e.target.value)} 
                        className="w-28 px-2 py-1 border border-slate-300 rounded text-sm font-mono uppercase" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="initial" checked={isInitialState} onChange={e => setIsInitialState(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="initial" className="text-sm text-slate-700">Is Initial State?</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="final" checked={isFinalState} onChange={e => setIsFinalState(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <label htmlFor="final" className="text-sm text-slate-700">Is Final State?</label>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Update Document Fields (Optional)</label>
                      <button 
                        type="button" 
                        onClick={() => setNewUpdateFields([...newUpdateFields, {key: "", value: ""}])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1"/> Add Field
                      </button>
                    </div>
                    {newUpdateFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <select 
                          value={field.key} 
                          onChange={e => {
                            const newFields = [...newUpdateFields];
                            newFields[idx].key = e.target.value;
                            setNewUpdateFields(newFields);
                          }} 
                          className="w-1/3 px-2 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                        >
                          <option value="">Select Field...</option>
                          <option value="status">Status</option>
                        </select>
                        <input 
                          type="text" 
                          value={field.value} 
                          onChange={e => {
                            const newFields = [...newUpdateFields];
                            newFields[idx].value = e.target.value;
                            setNewUpdateFields(newFields);
                          }} 
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 text-sm" 
                          placeholder="Value (e.g. Approved)" 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newFields = [...newUpdateFields];
                            newFields.splice(idx, 1);
                            setNewUpdateFields(newFields);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Only Allow Edit For Role (Optional)</label>
                    <select value={newAllowEditRole} onChange={e => setNewAllowEditRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white mb-2">
                      <option value="">Any (No restriction)</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="optionalState" checked={isOptionalState} onChange={e => setIsOptionalState(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="optionalState" className="text-sm text-slate-700">Is Optional State?</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sendEmail" checked={newSendEmail} onChange={e => setNewSendEmail(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="sendEmail" className="text-sm text-slate-700">Send Email Alert on State Entry?</label>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">SLA Days (Optional)</label>
                    <input type="number" min="1" value={newSlaDays} onChange={e => setNewSlaDays(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white mb-2" placeholder="e.g. 3" />
                    
                    <label className="block text-sm font-medium text-slate-700 mb-1">Escalation Role (Optional)</label>
                    <select value={newEscalationRole} onChange={e => setNewEscalationRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white mb-2">
                      <option value="">Select Role...</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="requiresAllRoles" checked={newRequiresAllRoles} onChange={e => setNewRequiresAllRoles(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="requiresAllRoles" className="text-sm text-slate-700 font-medium">Requires Parallel Approvals?</label>
                    </div>
                    {newRequiresAllRoles && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Required Roles (Comma Separated)</label>
                        <input type="text" value={newRequiredRoles} onChange={e => setNewRequiredRoles(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white mb-2" placeholder="e.g. Manager,Finance" />
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={isSubmittingState} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium shadow flex justify-center items-center gap-2 transition-colors">
                    {isSubmittingState ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add State
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "transitions" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Workflow Rules</h3>
                {transitions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-500">No transitions defined. Add rules to link states.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transitions.map(t => (
                      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-blue-100 transition-colors gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1 rounded bg-slate-100 font-medium text-slate-700" style={{color: getStateColor(t.fromStateId)}}>
                            {getStateName(t.fromStateId)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="px-3 py-1 rounded bg-slate-100 font-medium text-slate-700" style={{color: getStateColor(t.toStateId)}}>
                            {getStateName(t.toStateId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">Action: {t.actionName}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-1">Role: <span className="font-medium text-slate-700">{t.allowedRole}</span></div>
                          <button onClick={() => handleDeleteTransition(t.id)} className="text-slate-400 hover:text-rose-600 transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Add Transition</h3>
                {states.length < 2 ? (
                  <p className="text-sm text-rose-500 bg-rose-50 p-3 rounded border border-rose-100">You need at least 2 states defined before adding transitions.</p>
                ) : (
                  <form onSubmit={handleCreateTransition} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">From State</label>
                      <select required value={newTransFrom} onChange={e => setNewTransFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white">
                        <option value="">Select source state...</option>
                        {states.map(s => <option key={s.id} value={s.id}>{s.stateName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">To State</label>
                      <select required value={newTransTo} onChange={e => setNewTransTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white">
                        <option value="">Select target state...</option>
                        {states.filter(s => s.id !== newTransFrom).map(s => <option key={s.id} value={s.id}>{s.stateName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Action Name</label>
                      <input required type="text" value={newTransAction} onChange={e => setNewTransAction(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g. Approve, Submit, Reject" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Allowed Role</label>
                      <select required value={newTransRole} onChange={e => setNewTransRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white">
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="User">User</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Condition (Optional SpEL)</label>
                      <input type="text" value={newCondition} onChange={e => setNewCondition(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono text-xs" placeholder="e.g. doc.amount > 5000" />
                      <p className="text-[10px] text-slate-500 mt-1">Use 'doc' to reference the document fields.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <input type="checkbox" id="selfApprove" checked={newAllowSelfApproval} onChange={e => setNewAllowSelfApproval(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="selfApprove" className="text-sm text-slate-700">Allow Self Approval?</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sendEmailCreator" checked={newSendEmailToCreator} onChange={e => setNewSendEmailToCreator(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="sendEmailCreator" className="text-sm text-slate-700">Notify Creator on Action?</label>
                    </div>
                    <button type="submit" disabled={isSubmittingTrans || !newTransFrom || !newTransTo} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium shadow flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                      {isSubmittingTrans ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Rule
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
