export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  documentType: string;
  templateId?: string;
  workflowId?: string;
  currentStateId?: string;
  contentHtml?: string;
  gcsAttachmentUrl?: string;
  ownerUsername: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  amount?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  documentType: string;
  htmlContent: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  workflowName: string;
  documentType: string;
  isActive: boolean;
}

export interface WorkflowState {
  id: string;
  workflowId: string;
  stateName: string;
  colorCode: string;
  isInitialState: boolean;
  isFinalState: boolean;
  updateField?: string;
  updateValue?: string;
  allowEditRole?: string;
  sendEmail?: boolean;
  isOptionalState?: boolean;
}

export interface WorkflowTransition {
  id: string;
  workflowId: string;
  fromStateId: string;
  toStateId: string;
  actionName: string;
  allowedRole: string;
  conditionExpression?: string;
  allowSelfApproval?: boolean;
  sendEmailToCreator?: boolean;
}

export interface WorkflowHistory {
  id: string;
  documentId: string;
  actionName: string;
  fromStateId: string;
  toStateId: string;
  performedBy: string;
  comments: string;
  createdAt: string;
}

export const API_URL = "http://localhost:8081/api/v1";

export interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface DocumentData {
  id: string;
  documentNumber: string;
  title: string;
  documentType: string;
  templateId?: string;
  workflowId?: string;
  currentStateId?: string;
  contentHtml?: string;
  gcsAttachmentUrl?: string;
  ownerUsername: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  amount?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  documentType: string;
  htmlContent: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  workflowName: string;
  documentType: string;
  isActive: boolean;
}

export interface WorkflowState {
  id: string;
  workflowId: string;
  stateName: string;
  colorCode: string;
  isInitialState: boolean;
  isFinalState: boolean;
  updateField?: string;
  updateValue?: string;
  allowEditRole?: string;
  sendEmail?: boolean;
  isOptionalState?: boolean;
}

export interface WorkflowTransition {
  id: string;
  workflowId: string;
  fromStateId: string;
  toStateId: string;
  actionName: string;
  allowedRole: string;
  conditionExpression?: string;
  allowSelfApproval?: boolean;
  sendEmailToCreator?: boolean;
}

export interface WorkflowHistoryData {
  id: string;
  documentId: string;
  actionName: string;
  fromStateId: string;
  toStateId: string;
  performedBy: string;
  comments: string;
  createdAt: string;
}

// ------------------------------------------------------------------------------
// PERMANENT STORAGE HELPERS
// ------------------------------------------------------------------------------

function getStored<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`NEXTGEN_WORKFLOW_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`NEXTGEN_WORKFLOW_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Storage write error", e);
  }
}

// =======================
// DOCUMENTS
// =======================
export async function getDocuments(page = 0, size = 10, search = ""): Promise<Page<Document>> {
  try {
    let url = `${API_URL}/documents?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored("DOCUMENTS", data.content);
      return data;
    }
  } catch (error) {}
  
  const docs = getStored<Document>("DOCUMENTS", []);
  return { content: docs, totalPages: 1, totalElements: docs.length, size, number: page };
}

export async function getDocumentApprovals(role: string, page = 0, size = 10): Promise<Page<Document>> {
  try {
    const res = await fetch(`${API_URL}/documents/approvals?role=${role}&page=${page}&size=${size}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (error) {}
  
  const docs = getStored<Document>("DOCUMENTS", []);
  // Just return some mock docs for approvals if offline
  return { content: docs, totalPages: 1, totalElements: docs.length, size, number: page };
}

export async function getDocumentHistory(id: string): Promise<WorkflowHistory[]> {
  try {
    const res = await fetch(`${API_URL}/documents/${id}/history`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored(`HISTORY_${id}`, data);
      return data;
    }
  } catch (error) {}
  return getStored<WorkflowHistory>(`HISTORY_${id}`, []);
}

export async function createDocument(doc: Partial<Document>): Promise<Document> {
  try {
    const res = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      const data = await res.json();
      const docs = getStored<Document>("DOCUMENTS", []);
      setStored("DOCUMENTS", [data, ...docs]);
      return data;
    }
  } catch (error) {}
  
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    documentNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    title: doc.title || "Untitled Document",
    documentType: doc.documentType || "Contract",
    ownerUsername: doc.ownerUsername || "offline_user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Draft",
    amount: doc.amount,
  };
  const docs = getStored<Document>("DOCUMENTS", []);
  setStored("DOCUMENTS", [newDoc, ...docs]);
  return newDoc;
}

export async function transitionDocument(id: string, action: string, role: string, username: string, comments?: string): Promise<Document> {
  try {
    const res = await fetch(`${API_URL}/documents/${id}/transition?action=${action}&role=${role}&username=${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments }),
    });
    if (res.ok) {
      const data = await res.json();
      const docs = getStored<Document>("DOCUMENTS", []);
      setStored("DOCUMENTS", docs.map(d => d.id === id ? data : d));
      return data;
    }
  } catch (error) {}
  
  const docs = getStored<Document>("DOCUMENTS", []);
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.status = action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : "Pending";
    setStored("DOCUMENTS", docs);
    return doc;
  }
  throw new Error("Document not found offline");
}

export async function uploadAttachment(id: string, file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(`${API_URL}/documents/${id}/upload`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch (error) {}
  return `offline_mock_url_${Date.now()}.pdf`;
}

// =======================
// TEMPLATES
// =======================
export async function getTemplates(): Promise<DocumentTemplate[]> {
  try {
    const res = await fetch(`${API_URL}/templates`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored("TEMPLATES", data);
      return data;
    }
  } catch (error) {}
  return getStored<DocumentTemplate>("TEMPLATES", []);
}

export async function createTemplate(template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  try {
    const res = await fetch(`${API_URL}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    if (res.ok) {
      const data = await res.json();
      const tmpls = getStored<DocumentTemplate>("TEMPLATES", []);
      setStored("TEMPLATES", [data, ...tmpls]);
      return data;
    }
  } catch (error) {}
  const newTmpl: DocumentTemplate = {
    id: `tmpl-${Date.now()}`,
    name: template.name || "Offline Template",
    documentType: template.documentType || "Contract",
    htmlContent: template.htmlContent || "",
    createdAt: new Date().toISOString(),
  };
  const tmpls = getStored<DocumentTemplate>("TEMPLATES", []);
  setStored("TEMPLATES", [newTmpl, ...tmpls]);
  return newTmpl;
}

// =======================
// WORKFLOW SETUP
// =======================
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const res = await fetch(`${API_URL}/workflows`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored("WORKFLOWS", data);
      return data;
    }
  } catch (error) {}
  return getStored<Workflow>("WORKFLOWS", []);
}

export async function createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
  try {
    const res = await fetch(`${API_URL}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflow),
    });
    if (res.ok) {
      const data = await res.json();
      const wfs = getStored<Workflow>("WORKFLOWS", []);
      setStored("WORKFLOWS", [data, ...wfs]);
      return data;
    }
  } catch (error) {}
  const newWf: Workflow = {
    id: `wf-${Date.now()}`,
    workflowName: workflow.workflowName || "Offline Workflow",
    documentType: workflow.documentType || "Contract",
    isActive: true,
  };
  const wfs = getStored<Workflow>("WORKFLOWS", []);
  setStored("WORKFLOWS", [newWf, ...wfs]);
  return newWf;
}

export async function getStates(workflowId: string): Promise<WorkflowState[]> {
  try {
    const res = await fetch(`${API_URL}/workflows/${workflowId}/states`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored(`STATES_${workflowId}`, data);
      return data;
    }
  } catch (error) {}
  return getStored<WorkflowState>(`STATES_${workflowId}`, []);
}

export async function createState(workflowId: string, state: Partial<WorkflowState>): Promise<WorkflowState> {
  try {
    const res = await fetch(`${API_URL}/workflows/${workflowId}/states`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (res.ok) {
      const data = await res.json();
      const states = getStored<WorkflowState>(`STATES_${workflowId}`, []);
      setStored(`STATES_${workflowId}`, [data, ...states]);
      return data;
    }
  } catch (error) {}
  const newState: WorkflowState = {
    id: `state-${Date.now()}`,
    workflowId,
    stateName: state.stateName || "Offline State",
    colorCode: state.colorCode || "#000",
    isInitialState: state.isInitialState || false,
    isFinalState: state.isFinalState || false,
  };
  const states = getStored<WorkflowState>(`STATES_${workflowId}`, []);
  setStored(`STATES_${workflowId}`, [newState, ...states]);
  return newState;
}

export async function getTransitions(workflowId: string): Promise<WorkflowTransition[]> {
  try {
    const res = await fetch(`${API_URL}/workflows/${workflowId}/transitions`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStored(`TRANS_${workflowId}`, data);
      return data;
    }
  } catch (error) {}
  return getStored<WorkflowTransition>(`TRANS_${workflowId}`, []);
}

export async function createTransition(workflowId: string, transition: Partial<WorkflowTransition>): Promise<WorkflowTransition> {
  try {
    const res = await fetch(`${API_URL}/workflows/${workflowId}/transitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transition),
    });
    if (res.ok) {
      const data = await res.json();
      const trans = getStored<WorkflowTransition>(`TRANS_${workflowId}`, []);
      setStored(`TRANS_${workflowId}`, [data, ...trans]);
      return data;
    }
  } catch (error) {}
  const newTrans: WorkflowTransition = {
    id: `trans-${Date.now()}`,
    workflowId,
    fromStateId: transition.fromStateId || "",
    toStateId: transition.toStateId || "",
    actionName: transition.actionName || "Action",
    allowedRole: transition.allowedRole || "ADMIN",
  };
  const trans = getStored<WorkflowTransition>(`TRANS_${workflowId}`, []);
  setStored(`TRANS_${workflowId}`, [newTrans, ...trans]);
  return newTrans;
}
