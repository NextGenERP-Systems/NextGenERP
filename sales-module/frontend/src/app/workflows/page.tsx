"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Search, Plus, Home, ArrowRight, CheckCircle, Clock, User
} from "lucide-react";
import { 
  getDocuments, getDocumentApprovals, getTemplates, getWorkflows, getStates, getTransitions, 
  createDocument, createTemplate, createWorkflow, createState, createTransition, transitionDocument, uploadAttachment, getDocumentHistory,
  Document, DocumentTemplate, Workflow, WorkflowState, WorkflowTransition, WorkflowHistory
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

const MOCK_USERS = [
  { username: "admin", role: "ADMIN" },
  { username: "hr_manager", role: "HR_MANAGER" },
  { username: "finance_lead", role: "FINANCE_LEAD" },
  { username: "employee1", role: "EMPLOYEE" }
];

function WorkflowDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState(activeTabParam);
  
  // Dynamic Settings and Roles
  const [systemUsers, setSystemUsers] = useState(MOCK_USERS);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [strictAuditTrail, setStrictAuditTrail] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newRoleName, setNewRoleName] = useState("EMPLOYEE");

  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);

  useEffect(() => {
    // Load from local storage if available
    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      setSystemUsers(parsed);
      if (parsed.length > 0) setCurrentUser(parsed[0]);
    }
    const savedEmail = localStorage.getItem('emailNotifications');
    if (savedEmail !== null) setEmailNotifications(savedEmail === 'true');
    const savedAudit = localStorage.getItem('strictAuditTrail');
    if (savedAudit !== null) setStrictAuditTrail(savedAudit === 'true');
  }, []);

  // Data states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docTotalPages, setDocTotalPages] = useState(0);
  const [docPage, setDocPage] = useState(0);

  const [approvals, setApprovals] = useState<Document[]>([]);
  const [apprTotalPages, setApprTotalPages] = useState(0);
  const [apprPage, setApprPage] = useState(0);

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  
  // Selected workflow for States/Transitions tabs
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [states, setStates] = useState<WorkflowState[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);

  const [loading, setLoading] = useState(true);
  const [docSearch, setDocSearch] = useState("");

  // Create Template Modal
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("Contract");
  const [newTemplateHtml, setNewTemplateHtml] = useState("");

  // Workflow Modal
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowType, setNewWorkflowType] = useState("Contract");

  // State Modal
  const [isCreateStateOpen, setIsCreateStateOpen] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");
  const [isInitialState, setIsInitialState] = useState(false);
  const [isFinalState, setIsFinalState] = useState(false);

  // Transition Modal
  const [isCreateTransitionOpen, setIsCreateTransitionOpen] = useState(false);
  const [newActionName, setNewActionName] = useState("");
  const [newFromStateId, setNewFromStateId] = useState("");
  const [newToStateId, setNewToStateId] = useState("");
  const [newAllowedRole, setNewAllowedRole] = useState("ADMIN");

  // Modals
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("Contract");
  const [newDocWorkflowId, setNewDocWorkflowId] = useState("");
  const [newDocAmount, setNewDocAmount] = useState<number | undefined>(undefined);

  // Document Detail Modal
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [docHistory, setDocHistory] = useState<WorkflowHistory[]>([]);
  const [docTransitions, setDocTransitions] = useState<WorkflowTransition[]>([]); // Available transitions for the current state/role

  useEffect(() => {
    if (activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, currentUser, selectedWorkflowId, docPage, apprPage, docSearch]);

  async function loadData() {
    setLoading(true);
    try {
      // Always fetch workflows to use in the New Document modal dropdown
      const allWfs = await getWorkflows();
      setWorkflows(allWfs);

      if (activeTab === "overview" || activeTab === "documents") {
        const page = await getDocuments(docPage, 10, docSearch);
        setDocuments(page.content);
        setDocTotalPages(page.totalPages);
      } else if (activeTab === "approvals") {
        const page = await getDocumentApprovals(currentUser.role, apprPage, 10);
        setApprovals(page.content);
        setApprTotalPages(page.totalPages);
      } else if (activeTab === "templates") {
        setTemplates(await getTemplates());
      } else if (activeTab === "rules") {
        setWorkflows(await getWorkflows());
      } else if (activeTab === "states" || activeTab === "transitions") {
        const wfList = await getWorkflows();
        setWorkflows(wfList);
        if (wfList.length > 0 && !selectedWorkflowId) {
          setSelectedWorkflowId(wfList[0].id);
        }
        if (selectedWorkflowId) {
          setStates(await getStates(selectedWorkflowId));
          setTransitions(await getTransitions(selectedWorkflowId));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    let initialStateId = undefined;
    if (newDocWorkflowId) {
       const wStates = await getStates(newDocWorkflowId);
       const initial = wStates.find(s => s.isInitialState);
       if (initial) initialStateId = initial.id;
    }

    const created = await createDocument({
      title: newDocTitle,
      documentType: newDocType,
      ownerUsername: currentUser.username,
      workflowId: newDocWorkflowId || undefined,
      currentStateId: initialStateId,
      amount: newDocAmount
    });
    setDocuments([created, ...documents]);
    setIsCreateDocOpen(false);
    setNewDocTitle("");
    setNewDocWorkflowId("");
    setNewDocAmount(undefined);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createTemplate({
        name: newTemplateName,
        documentType: newTemplateType,
        htmlContent: newTemplateHtml
      });
      setTemplates([...templates, created]);
      setIsCreateTemplateOpen(false);
      setNewTemplateName("");
      setNewTemplateType("Contract");
      setNewTemplateHtml("");
    } catch (err: any) {
      alert("Failed to create template: " + err.message);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createWorkflow({
        workflowName: newWorkflowName,
        documentType: newWorkflowType,
        isActive: true
      });
      setWorkflows([...workflows, created]);
      setIsCreateWorkflowOpen(false);
      setNewWorkflowName("");
      setNewWorkflowType("Contract");
    } catch (err: any) { alert("Failed: " + err.message); }
  };

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflowId) return;
    try {
      const created = await createState(selectedWorkflowId, {
        stateName: newStateName,
        colorCode: newColorCode,
        isInitialState,
        isFinalState
      });
      setStates([...states, created]);
      setIsCreateStateOpen(false);
    } catch (err: any) { alert("Failed: " + err.message); }
  };

  const handleCreateTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflowId) return;
    try {
      const created = await createTransition(selectedWorkflowId, {
        fromStateId: newFromStateId,
        toStateId: newToStateId,
        actionName: newActionName,
        allowedRole: newAllowedRole
      });
      setTransitions([...transitions, created]);
      setIsCreateTransitionOpen(false);
    } catch (err: any) { alert("Failed: " + err.message); }
  };

  const openDocumentDetail = async (doc: Document) => {
    setSelectedDocument(doc);
    setDocHistory(await getDocumentHistory(doc.id));
    
    // Calculate available transitions for this document's workflow and current state based on user role
    if (doc.workflowId) {
       const allTransitions = await getTransitions(doc.workflowId);
       const available = allTransitions.filter(t => 
          (doc.currentStateId ? t.fromStateId === doc.currentStateId : true) && 
          t.allowedRole === currentUser.role
       );
       setDocTransitions(available);
    } else {
       setDocTransitions([]);
    }
  };

  const handleTransition = async (action: string) => {
    if (!selectedDocument) return;
    try {
      const updated = await transitionDocument(selectedDocument.id, action, currentUser.role, currentUser.username, "Action performed from UI");
      setSelectedDocument(updated);
      setDocHistory(await getDocumentHistory(updated.id));
      loadData(); // Refresh list
    } catch (e: any) {
      alert("Failed to transition: " + e.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDocument || !e.target.files?.[0]) return;
    try {
      const url = await uploadAttachment(selectedDocument.id, e.target.files[0]);
      alert("Uploaded successfully: " + url);
      loadData();
    } catch (err) {
      alert("Upload failed");
    }
  };


  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 text-[13px]">
          <Link href="/workflows" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900 capitalize">
            Workflow Workspace - {activeTab}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
             <User className="w-3.5 h-3.5 text-slate-500" />
             <select 
               className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none"
               value={currentUser.username}
               onChange={(e) => setCurrentUser(systemUsers.find(u => u.username === e.target.value) || systemUsers[0])}
             >
                {systemUsers.map(u => <option key={u.username} value={u.username}>{u.username} ({u.role})</option>)}
             </select>
          </div>
          <button
            onClick={() => setIsCreateDocOpen(true)}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* ======================= OVERVIEW TAB ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Workflow Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Total Documents</div>
                  <div className="text-3xl font-semibold text-gray-900 tracking-tight">{documents.length}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Active Workflows</div>
                  <div className="text-3xl font-semibold text-gray-900 tracking-tight">{workflows.filter(w => w.isActive).length}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Pending Approvals</div>
                  <div className="text-3xl font-semibold text-gray-900 tracking-tight">{documents.filter(d => d.currentStateId).length}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">Document Automation</h4>
                <ul className="space-y-2 text-[13px]">
                  {[{ label: "All Documents", id: "documents" }, { label: "My Approvals", id: "approvals" }, { label: "Document Templates", id: "templates" }].map((item) => (
                    <li key={item.id}>
                      <button onClick={() => router.push(`/workflows?tab=${item.id}`)} className="text-gray-700 hover:text-blue-600 hover:underline flex items-center justify-between w-full text-left">
                        <span>{item.label}</span><ArrowRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">Workflow Setup</h4>
                <ul className="space-y-2 text-[13px]">
                  {[{ label: "Workflow Rules", id: "rules" }, { label: "Workflow States", id: "states" }, { label: "State Transitions", id: "transitions" }].map((item) => (
                    <li key={item.id}>
                      <button onClick={() => router.push(`/workflows?tab=${item.id}`)} className="text-gray-700 hover:text-blue-600 hover:underline flex items-center justify-between w-full text-left">
                        <span>{item.label}</span><ArrowRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ======================= DOCUMENTS TAB ======================= */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="relative w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search documents..." value={docSearch} onChange={(e) => setDocSearch(e.target.value)} className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                  <tr><th className="py-3 px-4">Doc #</th><th className="py-3 px-4">Title</th><th className="py-3 px-4">Type</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">State ID</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} onClick={() => openDocumentDetail(doc)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold">{doc.documentNumber}</td>
                      <td className="py-3 px-4">{doc.title}</td>
                      <td className="py-3 px-4">{doc.documentType}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{doc.status || "—"}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{formatDate(doc.createdAt)}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">{doc.currentStateId || "NO STATE"}</span></td>
                    </tr>
                  ))}
                  {documents.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">No documents found.</td></tr>}
                </tbody>
              </table>
              {docTotalPages > 1 && (
                 <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-slate-50 text-xs">
                    <span className="text-slate-500">Page {docPage + 1} of {docTotalPages}</span>
                    <div className="flex gap-1">
                       <button disabled={docPage === 0} onClick={() => setDocPage(p => p - 1)} className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50">Prev</button>
                       <button disabled={docPage >= docTotalPages - 1} onClick={() => setDocPage(p => p + 1)} className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= APPROVALS TAB ======================= */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
             <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex gap-3">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <div>
                   <h3 className="font-semibold text-sm">Action Required</h3>
                   <p className="opacity-80 mt-1">These documents are waiting for an approval step allowed by your current role (<strong>{currentUser.role}</strong>).</p>
                </div>
             </div>
             
             <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {approvals.map(doc => (
                   <div key={doc.id} onClick={() => openDocumentDetail(doc)} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                      <div className="text-[10px] font-mono text-slate-400 mb-1">{doc.documentNumber}</div>
                      <div className="font-semibold text-slate-900 mb-2 truncate">{doc.title}</div>
                      <div className="flex justify-between items-center text-slate-500">
                         <span>{doc.documentType} {doc.amount ? `($${doc.amount})` : ''}</span>
                         <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">{doc.status || "Needs Review"}</span>
                      </div>
                   </div>
                ))}
                {approvals.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-slate-300 rounded-lg text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                    <p className="font-semibold">You're all caught up!</p>
                    <p className="text-[11px] opacity-70">No pending approvals for your role.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* ======================= TEMPLATES TAB ======================= */}
        {activeTab === "templates" && (
          <div className="space-y-4">
             <div className="flex justify-end">
                <button onClick={() => setIsCreateTemplateOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">New Template</button>
             </div>
             <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {templates.map(tpl => (
                   <div key={tpl.id} className="border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors cursor-pointer">
                      <div className="font-semibold text-slate-800 mb-1">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{tpl.documentType}</div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* ======================= RULES TAB ======================= */}
        {activeTab === "rules" && (
          <div className="space-y-4">
             <div className="flex justify-end">
                <button onClick={() => setIsCreateWorkflowOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">New Workflow</button>
             </div>
             <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                   <tr><th className="p-3">Workflow Name</th><th className="p-3">Document Type</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {workflows.map(wf => (
                      <tr key={wf.id}>
                         <td className="p-3 font-medium">{wf.workflowName}</td>
                         <td className="p-3">{wf.documentType}</td>
                         <td className="p-3">{wf.isActive ? <span className="text-green-600">Active</span> : <span className="text-slate-400">Draft</span>}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          </div>
        )}

        {/* ======================= STATES & TRANSITIONS TABS ======================= */}
        {(activeTab === "states" || activeTab === "transitions") && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 bg-slate-50 p-3 border border-slate-200 rounded-lg">
                <label className="font-semibold">Select Workflow Config:</label>
                <select value={selectedWorkflowId} onChange={e => setSelectedWorkflowId(e.target.value)} className="border border-slate-300 rounded px-2 py-1 text-xs">
                   <option value="">-- Select --</option>
                   {workflows.map(wf => <option key={wf.id} value={wf.id}>{wf.workflowName}</option>)}
                </select>
             </div>

             {selectedWorkflowId && activeTab === "states" && (
                <div className="space-y-4">
                   <div className="flex justify-end">
                      <button onClick={() => setIsCreateStateOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">New State</button>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                         <tr><th className="p-3">State Name</th><th className="p-3">Initial</th><th className="p-3">Update Field</th><th className="p-3">Update Value</th><th className="p-3">Allow Edit Role</th><th className="p-3">Send Email</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {states.map(st => (
                            <tr key={st.id}>
                               <td className="p-3 font-medium">{st.stateName}</td>
                               <td className="p-3">{st.isInitialState ? 'Yes' : 'No'}</td>
                               <td className="p-3 font-mono text-xs">{st.updateField || "—"}</td>
                               <td className="p-3 font-mono text-xs">{st.updateValue || "—"}</td>
                               <td className="p-3">{st.allowEditRole || "—"}</td>
                               <td className="p-3">{st.sendEmail ? 'Yes' : 'No'}</td>
                            </tr>
                         ))}
                      </tbody>
                    </table>
                 </div>
                 </div>
             )}

             {selectedWorkflowId && activeTab === "transitions" && (
                <div className="space-y-4">
                   <div className="flex justify-end">
                      <button onClick={() => setIsCreateTransitionOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">New Transition</button>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                         <tr><th className="p-3">Action</th><th className="p-3">From State ID</th><th className="p-3">To State ID</th><th className="p-3">Allowed Role</th><th className="p-3">Condition (SpEL)</th><th className="p-3">Self Approval</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {transitions.map(tr => (
                            <tr key={tr.id}>
                               <td className="p-3 font-semibold text-blue-600">{tr.actionName}</td>
                               <td className="p-3 font-mono text-[10px] text-slate-500">{tr.fromStateId}</td>
                               <td className="p-3 font-mono text-[10px] text-slate-500">{tr.toStateId}</td>
                               <td className="p-3 font-bold text-slate-800">{tr.allowedRole}</td>
                               <td className="p-3 font-mono text-[10px] text-purple-600 bg-purple-50 px-1 rounded">{tr.conditionExpression || "—"}</td>
                               <td className="p-3">{tr.allowSelfApproval === false ? 'No' : 'Yes'}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                </div>
             )}
          </div>
        )}

        {/* ======================= ROLES TAB ======================= */}
        {activeTab === "roles" && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <div>
                 <h3 className="font-semibold text-slate-800 text-sm">System Roles & Permissions</h3>
                 <p className="text-xs text-slate-500 mt-1">Workflow transitions are assigned to Roles, not specific users. Here are the active roles in your system.</p>
               </div>
               <button onClick={() => setIsCreateRoleOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs">Add User/Role</button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-white text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                   <tr><th className="p-3">Role Code</th><th className="p-3">Assigned Mock Users</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {Array.from(new Set(systemUsers.map(u => u.role))).map(role => (
                      <tr key={role}>
                         <td className="p-3 font-semibold text-slate-800">{role}</td>
                         <td className="p-3 font-mono text-xs text-slate-500">
                           {systemUsers.filter(u => u.role === role).map(u => u.username).join(', ')}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* ======================= SETTINGS TAB ======================= */}
        {activeTab === "settings" && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl">
             <h3 className="font-semibold text-slate-800 text-sm mb-4">Workflow Settings</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                   <div>
                      <div className="font-medium text-slate-700 text-[13px]">Email Notifications</div>
                      <div className="text-xs text-slate-500">Send an email to the assigned role when a document transitions to a new state.</div>
                   </div>
                   <div 
                      onClick={() => {
                        const next = !emailNotifications;
                        setEmailNotifications(next);
                        localStorage.setItem('emailNotifications', String(next));
                      }}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                   <div>
                      <div className="font-medium text-slate-700 text-[13px]">Strict Audit Trail</div>
                      <div className="text-xs text-slate-500">Require a comment for every workflow transition.</div>
                   </div>
                   <div 
                      onClick={() => {
                        const next = !strictAuditTrail;
                        setStrictAuditTrail(next);
                        localStorage.setItem('strictAuditTrail', String(next));
                      }}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${strictAuditTrail ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${strictAuditTrail ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {isCreateDocOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New Document</h2>
              <button onClick={() => setIsCreateDocOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateDocument} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Title</label>
                <input required type="text" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Acme Corp Contract"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Type</label>
                <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="Contract">Contract</option>
                  <option value="HR">HR Document</option>
                  <option value="Expense">Expense Report</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Link to Workflow</label>
                <select value={newDocWorkflowId} onChange={e => setNewDocWorkflowId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">-- No Workflow (Standalone) --</option>
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.workflowName}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">If selected, the document will automatically enter the workflow's initial state.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Amount (Optional)</label>
                <input type="number" value={newDocAmount || ''} onChange={e => setNewDocAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. 5000" />
                <p className="text-[10px] text-slate-500 mt-1">Used for testing conditional workflow transitions based on document amount.</p>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateDocOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WORKFLOW MODAL */}
      {isCreateWorkflowOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New Workflow</h2>
              <button onClick={() => setIsCreateWorkflowOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateWorkflow} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Workflow Name</label>
                <input required type="text" value={newWorkflowName} onChange={e => setNewWorkflowName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Contract Approval Flow"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Document Type</label>
                <input required type="text" value={newWorkflowType} onChange={e => setNewWorkflowType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Contract"/>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateWorkflowOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STATE MODAL */}
      {isCreateStateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New State</h2>
              <button onClick={() => setIsCreateStateOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateState} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">State Name</label>
                <input required type="text" value={newStateName} onChange={e => setNewStateName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. DRAFT"/>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-semibold mb-1.5">Color Code</label>
                   <input required type="text" value={newColorCode} onChange={e => setNewColorCode(e.target.value)} className="w-full border rounded px-3 py-2 text-sm font-mono" placeholder="#000000"/>
                 </div>
                 <div className="flex items-center gap-2 mt-6">
                   <input type="checkbox" checked={isInitialState} onChange={e => setIsInitialState(e.target.checked)} id="initial-state" />
                   <label htmlFor="initial-state" className="text-xs font-medium">Initial State</label>
                 </div>
                 <div className="flex items-center gap-2 mt-6">
                   <input type="checkbox" checked={isFinalState} onChange={e => setIsFinalState(e.target.checked)} id="final-state" />
                   <label htmlFor="final-state" className="text-xs font-medium">Final State</label>
                 </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateStateOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TRANSITION MODAL */}
      {isCreateTransitionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New Transition</h2>
              <button onClick={() => setIsCreateTransitionOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateTransition} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Action Name</label>
                <input required type="text" value={newActionName} onChange={e => setNewActionName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Approve"/>
              </div>
              <div className="flex gap-3">
                 <div className="flex-1">
                   <label className="block text-xs font-semibold mb-1.5">From State ID</label>
                   <select required value={newFromStateId} onChange={e => setNewFromStateId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.stateName}</option>)}
                   </select>
                 </div>
                 <div className="flex-1">
                   <label className="block text-xs font-semibold mb-1.5">To State ID</label>
                   <select required value={newToStateId} onChange={e => setNewToStateId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.stateName}</option>)}
                   </select>
                 </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Allowed Role</label>
                <select required value={newAllowedRole} onChange={e => setNewAllowedRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                   {Array.from(new Set(systemUsers.map(u => u.role))).map(r => (
                      <option key={r} value={r}>{r}</option>
                   ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateTransitionOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER/ROLE MODAL */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New User / Role</h2>
              <button onClick={() => setIsCreateRoleOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const newUsers = [...systemUsers, { username: newUsername, role: newRoleName }];
              setSystemUsers(newUsers);
              localStorage.setItem('systemUsers', JSON.stringify(newUsers));
              setIsCreateRoleOpen(false);
              setNewUsername("");
              setNewRoleName("EMPLOYEE");
            }} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Username</label>
                <input required type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. jdoe"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Role Name</label>
                <input required type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. MANAGER"/>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold">New Template</h2>
              <button onClick={() => setIsCreateTemplateOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Template Name</label>
                <input required type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Standard NDA"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Document Type / Category</label>
                <input required type="text" value={newTemplateType} onChange={e => setNewTemplateType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Contract, HR, Legal"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">HTML Content</label>
                <textarea required value={newTemplateHtml} onChange={e => setNewTemplateHtml(e.target.value)} className="w-full border rounded px-3 py-2 text-sm h-32 font-mono" placeholder="<h2>Your template...</h2>" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateTemplateOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT DETAIL MODAL (ERPNext Style View) */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Header */}
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                   <div className="flex items-center gap-3">
                       <h2 className="text-lg font-bold text-slate-900">{selectedDocument.title}</h2>
                       {selectedDocument.status && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{selectedDocument.status}</span>
                       )}
                   </div>
                   <div className="text-xs text-slate-500 font-mono mt-1">
                       {selectedDocument.documentNumber} • {selectedDocument.documentType} 
                       {selectedDocument.amount && <span className="ml-2 font-bold text-green-700">${selectedDocument.amount}</span>}
                   </div>
                </div>
                <div className="flex gap-2">
                   {/* ACTION BUTTONS */}
                   {docTransitions.length > 0 ? (
                      docTransitions.map(t => (
                         <button 
                           key={t.id} 
                           onClick={() => handleTransition(t.actionName)}
                           className={`px-4 py-2 rounded text-xs font-bold text-white shadow-sm transition-colors ${
                             t.actionName.toLowerCase().includes('reject') ? 'bg-red-600 hover:bg-red-700' :
                             t.actionName.toLowerCase().includes('approve') ? 'bg-green-600 hover:bg-green-700' :
                             'bg-blue-600 hover:bg-blue-700'
                           }`}
                         >
                            {t.actionName}
                         </button>
                      ))
                   ) : (
                      <span className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">No Actions Available</span>
                   )}
                   <button onClick={() => setSelectedDocument(null)} className="ml-4 p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded shadow-2xs">✕</button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto flex">
                {/* Left side: Document Form/HTML */}
                <div className="flex-1 p-6 border-r border-slate-200 bg-white">
                   <div className="mb-6">
                      <h4 className="font-semibold text-slate-800 border-b pb-2 mb-4">Document Content</h4>
                      <div className="p-4 bg-slate-50 rounded border border-slate-100 min-h-[200px] prose prose-sm text-slate-600">
                         {selectedDocument.contentHtml ? (
                            <div dangerouslySetInnerHTML={{__html: selectedDocument.contentHtml}} />
                         ) : (
                            <p className="italic text-slate-400">No content available. Attach a file or apply a template.</p>
                         )}
                      </div>
                   </div>

                   <div>
                      <h4 className="font-semibold text-slate-800 border-b pb-2 mb-4">Attachments</h4>
                      {selectedDocument.gcsAttachmentUrl ? (
                         <a href={`http://localhost:8081${selectedDocument.gcsAttachmentUrl}`} target="_blank" className="text-blue-600 underline text-sm break-all">
                            Download Attachment
                         </a>
                      ) : (
                         <div className="flex items-center gap-3">
                            <input type="file" onChange={handleFileUpload} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                         </div>
                      )}
                   </div>
                </div>

                {/* Right side: Workflow History Trail */}
                <div className="w-80 bg-slate-50 p-6 flex flex-col">
                   <h4 className="font-semibold text-slate-800 mb-4">Audit Trail</h4>
                   <div className="flex-1 overflow-y-auto space-y-4">
                      {docHistory.length === 0 ? (
                         <p className="text-xs text-slate-400 italic">No history recorded.</p>
                      ) : (
                         docHistory.map(h => (
                            <div key={h.id} className="relative pl-4 border-l-2 border-slate-300">
                               <div className="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[5.5px] top-1"></div>
                               <div className="text-[10px] text-slate-400 mb-0.5">{formatDate(h.createdAt)}</div>
                               <div className="font-semibold text-slate-800 text-xs">
                                  {h.performedBy} <span className="font-normal text-slate-500">performed</span> {h.actionName}
                               </div>
                               {h.comments && <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-xs text-slate-600">{h.comments}</div>}
                            </div>
                         ))
                      )}
                      
                      {/* Document Creation Event */}
                      <div className="relative pl-4 border-l-2 border-transparent">
                         <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5.5px] top-1"></div>
                         <div className="text-[10px] text-slate-400 mb-0.5">{formatDate(selectedDocument.createdAt)}</div>
                         <div className="font-semibold text-slate-800 text-xs">
                            {selectedDocument.ownerUsername} <span className="font-normal text-slate-500">created document</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default function WorkflowDashboard() { return <Suspense fallback={<div>Loading...</div>}><WorkflowDashboardContent /></Suspense>; }
