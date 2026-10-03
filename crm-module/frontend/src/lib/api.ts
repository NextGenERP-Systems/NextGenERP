export type Row = { id?: string; [key: string]: unknown };
export type Page<T> = { content: T[]; page: number; size: number; totalElements: number; last: boolean };
export type Lookup = Row & { id: string; name: string; sequenceOrder?: number; isActive?: boolean };
export type Lookups = Record<string, Lookup[]>;
export type Opportunity = Row & {
  id: string; opportunityName: string; status: string; updatedAt: string;
  prospect?: Row | null; salesStage?: Row | null; opportunityType?: Row | null;
  lostReason?: Row | null;
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) { super(message); }
}
export function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object' && 'type' in value && 'value' in value && ['json', 'jsonb'].includes(String(value.type)) && typeof value.value === 'string') {
    try { return normalize(JSON.parse(value.value)); } catch { return value.value; }
  }
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) =>
    [key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()), normalize(item)]));
  return value;
}
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new Error('Invalid CRM API path');
  let response: Response;
  try {
    response = await fetch(`/api/v1/crm${path}`, {
      method, cache: 'no-store', headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000),
    });
  } catch { throw new ApiError(0, 'CRM is unavailable. Check the backend connection and retry.'); }
  const data = response.status === 204 ? undefined : await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status,
    data.message || data.detail || data.error || `Request failed (${response.status})`, data.fields || {});
  return normalize(data) as T;
}
export function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value as Row[];
  if (value && typeof value === 'object' && 'content' in value && Array.isArray(value.content)) return value.content;
  return [];
}
export function text(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const row = value as Row;
    return text(row.name ?? row.companyName ?? row.opportunityName ?? row.subject ?? row.id);
  }
  return String(value);
}
export function label(key: string): string { return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()); }
export function title(row: Row): string {
  return text(row.name ?? row.opportunityName ?? row.companyName ?? row.subject ?? row.claimNumber ?? row.description ??
    (row.firstName ? `${row.firstName} ${row.lastName || ''}`.trim() : row.id));
}
export function opportunityPayload(row: Opportunity): Row {
  return {
    opportunityName: row.opportunityName, prospectId: row.prospect?.id ?? null,
    customerId: row.customerId ?? null, amount: row.amount ?? null,
    expectedCloseDate: row.expectedCloseDate ?? null, salesStageId: row.salesStage?.id ?? null,
    opportunityTypeId: row.opportunityType?.id ?? null, probability: row.probability ?? null,
    status: row.status, lostReasonId: row.lostReason?.id ?? null, assignedTo: row.assignedTo ?? null,
    expectedUpdatedAt: row.updatedAt,
    // Existing attribution links are append-only. Omitting a touchpoint preserves them.
  };
}
export function dateDisplay(value: unknown): string {
  if (typeof value !== 'string') return text(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(/[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
    return Number.isNaN(date.getTime()) ? value : `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
  }
  return value;
}
export function snapshotAmount(amount: unknown, currency: unknown): string {
  return `${text(currency)} ${text(amount)}`;
}
