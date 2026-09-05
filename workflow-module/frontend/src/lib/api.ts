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
  templateName?: string;
  workflowId?: string;
  workflowName?: string;
  currentStateId?: string;
  currentStateName?: string;
  currentStateColor?: string;
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
  category: string;
  htmlContent: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  workflowName: string;
  documentType: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WorkflowState {
  id: string;
  workflowId: string;
  stateName: string;
  colorCode: string;
  isInitialState: boolean;
  isFinalState: boolean;
  updateFields?: Record<string, any>;
  allowEditRole?: string;
  sendEmail?: boolean;
  isOptionalState?: boolean;
  slaDays?: number;
  escalationRole?: string;
  requiresAllRoles?: boolean;
  requiredRoles?: string;
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

const isServer = typeof window === 'undefined';
export const API_URL = isServer
  ? process.env.INTERNAL_API_URL || "http://workflow_backend:8081/api/v1"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api/v1";

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  // Setup timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  const config: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id);
    
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
        else if (errorData.message) errorMessage = errorData.message;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }
    
    // For file downloads or empty responses
    if (response.status === 204) return {} as T;
    
    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after 8 seconds. Please check if the backend is running.`);
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Network Error: Cannot connect to the server at ${API_URL}. Is the backend running?`);
    }
    throw error;
  }
}

// =======================
// DOCUMENTS
// =======================
export function getDocuments(page = 0, size = 10, search = ""): Promise<Page<Document>> {
  let url = `/documents?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiClient<Page<Document>>(url, { cache: "no-store" });
}

export function getKanbanDocuments(stateName: string, stateId?: string, page = 0, size = 10, search = ""): Promise<Page<Document>> {
  let url = `/documents/kanban?stateName=${encodeURIComponent(stateName)}&page=${page}&size=${size}`;
  if (stateId) url += `&stateId=${encodeURIComponent(stateId)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiClient<Page<Document>>(url, { cache: "no-store" });
}

export function getDocumentById(id: string): Promise<Document> {
  return apiClient<Document>(`/documents/${id}`, { cache: "no-store" });
}

export function getDocumentApprovals(roles: string[], username: string, page = 0, size = 10): Promise<Page<Document>> {
  const rolesQuery = roles.map(r => `roles=${encodeURIComponent(r)}`).join('&');
  return apiClient<Page<Document>>(`/documents/approvals?${rolesQuery}&username=${encodeURIComponent(username)}&page=${page}&size=${size}`, { cache: "no-store" });
}

export function getDocumentHistory(id: string): Promise<WorkflowHistory[]> {
  return apiClient<WorkflowHistory[]>(`/documents/${id}/history`, { cache: "no-store" });
}

export function getAuditLogs(page = 0, size = 15, search = ""): Promise<Page<WorkflowHistory>> {
  let url = `/documents/audit-trail?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiClient<Page<WorkflowHistory>>(url, { cache: "no-store" });
}

export function getUserDocuments(username: string): Promise<Document[]> {
  return apiClient<Document[]>(`/documents/user/${username}`, { cache: "no-store" });
}

export function createDocument(doc: Partial<Document>): Promise<Document> {
  return apiClient<Document>(`/documents`, {
    method: "POST",
    body: JSON.stringify(doc),
  });
}

export function updateDocument(id: string, doc: Partial<Document>, role: string): Promise<Document> {
  return apiClient<Document>(`/documents/${id}?role=${encodeURIComponent(role)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
}

export function transitionDocument(id: string, action: string, role: string, username: string, comments?: string): Promise<Document> {
  return apiClient<Document>(`/documents/${id}/transition?action=${action}&role=${role}&username=${username}`, {
    method: "POST",
    body: JSON.stringify({ comments }),
  });
}

export function uploadAttachment(documentId: string, file: File): Promise<{url: string}> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<{url: string}>(`/documents/${documentId}/upload`, {
    method: "POST",
    body: formData,
  });
}

export function delegateDocument(documentId: string, targetUsername: string, delegatedBy: string): Promise<any> {
  return apiClient<any>(`/documents/${documentId}/delegate?targetUsername=${encodeURIComponent(targetUsername)}&delegatedBy=${encodeURIComponent(delegatedBy)}`, {
    method: "POST"
  });
}

export function bulkAction(documentIds: string[], action: string, role: string, username: string, comments: string): Promise<any> {
  return apiClient<any>(`/documents/bulk-action`, {
    method: "POST",
    body: JSON.stringify({
      documentIds,
      action,
      role,
      username,
      comments
    })
  });
}

export function deleteDocument(id: string): Promise<void> {
  return apiClient<void>(`/documents/${id}`, {
    method: "DELETE",
  });
}

// =======================
// TEMPLATES
// =======================
export function getTemplates(): Promise<DocumentTemplate[]> {
  return apiClient<DocumentTemplate[]>(`/templates`, { cache: "no-store" });
}

export function createTemplate(template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  return apiClient<DocumentTemplate>(`/templates`, {
    method: "POST",
    body: JSON.stringify(template),
  });
}

export function updateTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  return apiClient<DocumentTemplate>(`/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(template),
  });
}

// =======================
// WORKFLOW SETUP
// =======================
export function getWorkflows(): Promise<Workflow[]> {
  return apiClient<Workflow[]>(`/workflows`, { cache: "no-store" });
}

export function getWorkflowById(id: string): Promise<Workflow> {
  return apiClient<Workflow>(`/workflows/${id}`, { cache: "no-store" });
}

export function createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
  return apiClient<Workflow>(`/workflows`, {
    method: "POST",
    body: JSON.stringify(workflow),
  });
}

export function updateWorkflowStatus(id: string, isActive: boolean): Promise<Workflow> {
  return apiClient<Workflow>(`/workflows/${id}/status?isActive=${isActive}`, {
    method: "PATCH",
  });
}

export function getStates(workflowId: string): Promise<WorkflowState[]> {
  return apiClient<WorkflowState[]>(`/workflows/${workflowId}/states`, { cache: "no-store" });
}

export function createState(workflowId: string, state: Partial<WorkflowState>): Promise<WorkflowState> {
  return apiClient<WorkflowState>(`/workflows/${workflowId}/states`, {
    method: "POST",
    body: JSON.stringify(state),
  });
}

export function getTransitions(workflowId: string): Promise<WorkflowTransition[]> {
  return apiClient<WorkflowTransition[]>(`/workflows/${workflowId}/transitions`, { cache: "no-store" });
}

export function createTransition(workflowId: string, transition: Partial<WorkflowTransition>): Promise<WorkflowTransition> {
  return apiClient<WorkflowTransition>(`/workflows/${workflowId}/transitions`, {
    method: "POST",
    body: JSON.stringify(transition),
  });
}

export function deleteState(stateId: string): Promise<void> {
  return apiClient<void>(`/workflows/states/${stateId}`, {
    method: "DELETE",
  });
}

export function deleteTransition(transitionId: string): Promise<void> {
  return apiClient<void>(`/workflows/transitions/${transitionId}`, {
    method: "DELETE",
  });
}

// =======================
// MASTER STATES
// =======================
export interface MasterState {
  id: string;
  stateName: string;
  colorCode: string;
  description?: string;
}

export function getMasterStates(): Promise<MasterState[]> {
  return apiClient<MasterState[]>(`/master-states`, { cache: "no-store" });
}

export function createMasterState(state: Partial<MasterState>): Promise<MasterState> {
  return apiClient<MasterState>(`/master-states`, {
    method: "POST",
    body: JSON.stringify(state),
  });
}

// Notifications API
export interface AppNotification {
  id: string;
  username: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function getUserNotifications(username: string): Promise<AppNotification[]> {
  return apiClient<AppNotification[]>(`/notifications/${username}`, { cache: "no-store" });
}

export function getUnreadNotifications(username: string): Promise<AppNotification[]> {
  return apiClient<AppNotification[]>(`/notifications/${username}/unread`, { cache: "no-store" });
}

export function markNotificationAsRead(id: string): Promise<AppNotification> {
  return apiClient<AppNotification>(`/notifications/${id}/read`, {
    method: "PUT"
  });
}

export function markAllNotificationsAsRead(username: string): Promise<void> {
  return apiClient<void>(`/notifications/${username}/read-all`, {
    method: "PUT"
  });
}

// Metrics API
export function getDocumentsByStatus(): Promise<Record<string, number>> {
  return apiClient<Record<string, number>>(`/metrics/documents-by-status`, { cache: "no-store" });
}

export function getPendingByWorkflow(): Promise<Record<string, number>> {
  return apiClient<Record<string, number>>(`/metrics/pending-by-workflow`, { cache: "no-store" });
}

export function getSystemSummary(): Promise<Record<string, any>> {
  return apiClient<Record<string, any>>(`/metrics/summary`, { cache: "no-store" });
}

export interface TimeInStateMetric {
  stateId: string;
  stateName: string;
  colorCode: string;
  avgMinutes: number;
  sampleCount: number;
}

export function getTimeInStateMetrics(): Promise<TimeInStateMetric[]> {
  return apiClient<TimeInStateMetric[]>(`/metrics/time-in-state`, { cache: "no-store" });
}

// Settings API
export interface WorkflowSettingsData {
  id?: number;
  enableEmailNotifications: boolean;
  defaultAutoRejectionTimeoutDays: number;
  strictMode: boolean;
}

export function getWorkflowSettings(): Promise<WorkflowSettingsData> {
  return apiClient<WorkflowSettingsData>(`/settings`, { cache: "no-store" });
}

export function updateWorkflowSettings(settings: WorkflowSettingsData): Promise<WorkflowSettingsData> {
  return apiClient<WorkflowSettingsData>(`/settings`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

// Users & Roles API
export interface AppRoleData {
  id: string;
  roleName: string;
}

export interface AppUserData {
  id: string;
  username: string;
  email?: string;
  roles: AppRoleData[];
}

export function getAllUsers(): Promise<AppUserData[]> {
  return apiClient<AppUserData[]>(`/users`, { cache: "no-store" });
}

export function getAllRoles(): Promise<AppRoleData[]> {
  return apiClient<AppRoleData[]>(`/users/roles`, { cache: "no-store" });
}

export function createRole(roleName: string): Promise<AppRoleData> {
  return apiClient<AppRoleData>(`/users/roles`, {
    method: "POST",
    body: JSON.stringify({ roleName }),
  });
}

export function assignRoleToUser(userId: string, roleName: string): Promise<AppUserData> {
  return apiClient<AppUserData>(`/users/${userId}/assign-role?roleName=${encodeURIComponent(roleName)}`, {
    method: "POST",
  });
}


