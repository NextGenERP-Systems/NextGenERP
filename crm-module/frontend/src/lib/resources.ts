import type { Row } from './api';
export type Field = {
  key: string; name?: string; type?: 'text' | 'email' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox' | 'json';
  required?: boolean; options?: string[]; lookup?: string; relation?: string; hint?: string; value?: unknown;
  min?: number; max?: number; step?: string; pattern?: string; maxLength?: number;
};
export type Resource = { route: string; api: string; name: string; singular: string; fields: Field[]; columns: string[]; paging?: 'array' | 'envelope'; edit?: boolean; remove?: boolean };
const f = (key: string, extra: Partial<Field> = {}): Field => ({ key, ...extra });
const req = (key: string, extra: Partial<Field> = {}) => f(key, { required: true, ...extra });
const uuid = (key: string, extra: Partial<Field> = {}) => f(key, { pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', hint: 'CRM or external UUID, as labeled', ...extra });
const money = (key: string, required = false) => f(key, { type: 'number', min: 0, step: '0.01', required });
const date = (key: string, required = false) => f(key, { type: 'date', required });
const time = (key: string, required = false) => f(key, { type: 'datetime-local', required, hint: 'Entered in your local timezone; saved as a UTC instant' });
const select = (key: string, options: string[], value?: string) => f(key, { type: 'select', options, value });
const lookup = (key: string, source: string, relation: string) => f(key, { type: 'select', lookup: source, relation });
const currency = req('currency', { value: 'INR', pattern: '[A-Z]{3}', maxLength: 3 });
export const resources: Resource[] = [
  { route: 'leads', api: '/leads', name: 'Leads', singular: 'Lead', columns: ['firstName', 'companyName', 'email', 'status'], edit: true, remove: true,
    fields: [f('firstName', { maxLength: 100 }), f('lastName'), f('companyName'), f('jobTitle'), f('email', { type: 'email' }), f('phone'), lookup('leadSourceId', 'leadSources', 'leadSource'), lookup('marketSegmentId', 'marketSegments', 'marketSegment'), select('status', ['NEW', 'CONTACTED', 'UNQUALIFIED'], 'NEW'), uuid('assignedTo'), f('notes', { type: 'textarea' })] },
  { route: 'prospects', api: '/prospects', name: 'Prospects', singular: 'Prospect', columns: ['companyName', 'primaryContactName', 'primaryContactEmail', 'status'], edit: true, remove: true,
    fields: [req('companyName'), f('industry'), f('website'), f('primaryContactName'), f('primaryContactEmail', { type: 'email' }), f('primaryContactPhone'), select('status', ['ACTIVE', 'LOST'], 'ACTIVE'), uuid('customerId', { hint: 'External customer UUID; CRM does not create a Sales customer' })] },
  { route: 'opportunities', api: '/opportunities', name: 'Opportunities', singular: 'Opportunity', columns: ['opportunityName', 'salesStage', 'amount', 'status'], edit: true, remove: true,
    fields: [req('opportunityName'), uuid('prospectId', { relation: 'prospect', hint: 'Provide a CRM prospect or external customer UUID' }), uuid('customerId'), money('amount'), date('expectedCloseDate'), lookup('salesStageId', 'salesStages', 'salesStage'), lookup('opportunityTypeId', 'opportunityTypes', 'opportunityType'), f('probability', { type: 'number', min: 0, max: 100, step: '1' }), select('status', ['OPEN', 'WON', 'LOST'], 'OPEN'), lookup('lostReasonId', 'lostReasons', 'lostReason'), uuid('assignedTo'), uuid('attributionTouchpointId', { hint: 'Optional explicit touchpoint; existing links are retained' })] },
  { route: 'contacts', api: '/contacts', name: 'Contacts', singular: 'Contact', paging: 'envelope', edit: true, remove: true, columns: ['firstName', 'lastName', 'email', 'primary'],
    fields: [req('firstName'), f('lastName'), f('email', { type: 'email' }), f('phone'), f('jobTitle'), f('primary', { type: 'checkbox', value: false }), uuid('leadId'), uuid('prospectId'), uuid('opportunityId'), uuid('customerId', { hint: 'Exactly one owner UUID is required' })] },
  { route: 'campaigns', api: '/campaigns', name: 'Campaigns', singular: 'Campaign', paging: 'array', edit: true, remove: true, columns: ['name', 'channel', 'status', 'budget', 'currency'],
    fields: [req('name'), f('description', { type: 'textarea' }), select('channel', ['EMAIL', 'SMS', 'EVENT', 'OTHER'], 'EMAIL'), time('startsAt'), time('endsAt'), uuid('ownerId'), money('budget'), currency] },
  { route: 'communications/templates', api: '/message-templates', name: 'Message templates', singular: 'Template', edit: true, columns: ['name', 'channel', 'revision', 'active'],
    fields: [req('name'), select('channel', ['EMAIL', 'SMS'], 'EMAIL'), f('subject'), req('body', { type: 'textarea', hint: 'Plain text preview; named variables use {{name}}' }), f('active', { type: 'checkbox', value: true })] },
  { route: 'communications/messages', api: '/messages', name: 'Messages', singular: 'Message', paging: 'array', columns: ['channel', 'destination', 'status', 'scheduledAt'],
    fields: [uuid('contactId', { required: true }), uuid('campaignId'), uuid('templateId', { required: true }), req('idempotencyKey', { hint: 'Keep this key for retries of the same message' }), f('variables', { type: 'json', value: '{}', hint: 'JSON object of named text variables' }), time('scheduledAt')] },
  { route: 'service/contracts', api: '/contracts', name: 'Contracts', singular: 'Contract', paging: 'array', edit: true, columns: ['contractNumber', 'name', 'status', 'totalAmount', 'currency'],
    fields: [req('contractNumber'), req('name'), uuid('opportunityId'), uuid('customerId', { hint: 'Provide an opportunity or external customer UUID' }), date('startsOn'), date('endsOn'), money('totalAmount', true), currency, f('notes', { type: 'textarea' })] },
  { route: 'service/fulfilments', api: '/fulfilments', name: 'Fulfilments', singular: 'Fulfilment', paging: 'array', columns: ['description', 'status', 'plannedQuantity', 'completedQuantity'],
    fields: [uuid('contractId', { required: true }), uuid('contractItemId'), select('fulfilmentType', ['DELIVERY', 'SERVICE'], 'DELIVERY'), req('description'), money('plannedQuantity'), f('completedQuantity', { type: 'number', required: true, min: 0, step: '0.001', value: 0 }), time('plannedAt'), time('completedAt'), f('externalReference')] },
  { route: 'service/warranty-claims', api: '/warranty-claims', name: 'Warranty claims', singular: 'Warranty claim', paging: 'array', columns: ['claimNumber', 'issue', 'status', 'reportedOn'],
    fields: [req('claimNumber'), uuid('contractId', { required: true }), uuid('contractItemId', { required: true, hint: 'Item must have a complete warranty period' }), uuid('customerId'), req('issue'), req('description', { type: 'textarea' }), date('reportedOn')] },
  { route: 'service/maintenance', api: '/maintenance-schedules', name: 'Maintenance', singular: 'Maintenance schedule', paging: 'array', columns: ['name', 'status', 'nextDueOn', 'timezone'],
    fields: [uuid('customerId', { required: true }), uuid('contractId'), uuid('contractItemId'), req('name'), f('description', { type: 'textarea' }), date('startsOn', true), date('endsOn'), f('intervalDays', { type: 'number', min: 1, max: 3650, step: '1', value: 30, required: true }), date('nextDueOn', true), req('timezone', { value: 'Asia/Kolkata', hint: 'IANA timezone, e.g. Asia/Kolkata' })] },
];
export type Panel = { name: string; path: string; fields?: Field[]; columns: string[]; paging?: 'envelope' | 'array'; transitions?: Record<string, string[]>; statusKey?: string; statusPath?: string; statusFields?: Field[]; limit?: number; edit?: boolean; remove?: boolean };
export const transitions = {
  contracts: { DRAFT: ['ACTIVE', 'TERMINATED'], ACTIVE: ['EXPIRED', 'TERMINATED'] },
  campaigns: { DRAFT: ['SCHEDULED', 'ACTIVE', 'ARCHIVED'], SCHEDULED: ['ACTIVE', 'PAUSED', 'ARCHIVED'], ACTIVE: ['PAUSED', 'COMPLETED', 'ARCHIVED'], PAUSED: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], COMPLETED: ['ARCHIVED'] },
  claims: { SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'], UNDER_REVIEW: ['APPROVED', 'REJECTED', 'WITHDRAWN'], APPROVED: ['RESOLVED'] },
  fulfilments: { PLANNED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'] },
  maintenance: { ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'], PAUSED: ['ACTIVE', 'CANCELLED'] },
};
export function panels(resource: Resource, id: string): Panel[] {
  const base = `${resource.api}/${id}`;
  const targetType = resource.route === 'opportunities' ? 'OPPORTUNITY' : resource.route === 'prospects' ? 'PROSPECT' : 'LEAD';
  switch (resource.route) {
    case 'leads': case 'prospects': case 'opportunities': return [
      ...(resource.route !== 'prospects' ? [{ name: 'History · baseline marks start of known history', path: `${base}/history`, columns: ['eventType', 'fromStatus', 'toStatus', 'occurredAt'], paging: 'envelope' as const }] : []),
      { name: 'Attribution', path: `${base}/attribution`, fields: [uuid('touchpointId', { required: true }), select('linkType', ['QUALIFICATION', 'OPPORTUNITY_ASSOCIATION'], resource.route === 'opportunities' ? 'OPPORTUNITY_ASSOCIATION' : 'QUALIFICATION')], columns: ['linkType', 'campaignId', 'touchpointId'], limit: 100 },
      ...interactionPanels(targetType, id),
      ...(resource.route === 'opportunities' ? [
        { name: 'Competitor comparisons', path: `${base}/competitors`, fields: [uuid('competitorId', { required: true }), f('strengths'), f('weaknesses'), f('notes')], columns: ['competitorName', 'strengths', 'weaknesses', 'notes'], edit: true, remove: true },
        { name: 'Competitor directory', path: '/competitors', fields: [req('name'), f('website'), f('description', { type: 'textarea' })], columns: ['id', 'name', 'website'], edit: true, remove: true },
      ] : []),
    ];
    case 'contacts': return [
      { name: 'Communication preferences', path: `${base}/communication-preferences`, columns: ['channel', 'destination', 'consentState', 'source'] },
      ...['EMAIL', 'SMS'].map(channel => ({ name: `${channel} preference events`, path: `${base}/communication-preferences/${channel}/events`, columns: ['consentState', 'source', 'occurredAt'], limit: 100 })),
    ];
    case 'campaigns': return [
      { name: 'Members', path: `${base}/members`, paging: 'array', fields: [uuid('contactId', { required: true })], columns: ['contactId', 'status'], transitions: { ADDED: ['CONTACTED', 'REMOVED'], CONTACTED: ['RESPONDED', 'REMOVED'], RESPONDED: ['REMOVED'], REMOVED: ['ADDED'] }, statusPath: `${base}/members/{id}` },
      { name: 'Costs by recorded currency', path: `${base}/costs`, fields: [money('amount', true), currency, date('costDate', true), f('description')], columns: ['amount', 'currency', 'costDate', 'description'], limit: 100 },
      { name: 'Touchpoints · explicit attribution', path: `${base}/touchpoints`, fields: [select('targetType', ['LEAD', 'PROSPECT', 'OPPORTUNITY'], 'LEAD'), uuid('targetId', { required: true }), req('eventType'), req('eventKey'), f('source'), f('medium'), f('utmSource'), f('utmMedium'), f('utmCampaign'), time('occurredAt')], columns: ['targetType', 'targetId', 'eventType', 'occurredAt'], limit: 100 },
    ];
    case 'communications/messages': return [{ name: 'Delivery attempts', path: `${base}/attempts`, columns: ['attemptNumber', 'result', 'errorDetail', 'startedAt'] }];
    case 'service/contracts': return [
      { name: 'Contract item snapshots', path: `${base}/items`, fields: [req('description'), uuid('externalProductId'), f('quantity', { required: true, type: 'number', min: 0.001, step: '0.001', value: 1 }), req('unit', { value: 'each' }), money('unitPrice', true), date('warrantyStartsOn'), date('warrantyEndsOn')], columns: ['id', 'description', 'quantity', 'unitPrice', 'warrantyStartsOn', 'warrantyEndsOn'], limit: 500 },
      { name: 'Contract status events', path: `${base}/events`, columns: ['fromStatus', 'toStatus', 'occurredAt'], limit: 100 },
    ];
    case 'service/warranty-claims': return [{ name: 'Claim status events', path: `${base}/events`, columns: ['fromStatus', 'toStatus', 'note', 'occurredAt'], limit: 100 }];
    case 'service/maintenance': return [{ name: 'Manually recorded visits', path: `${base}/visits`, fields: [time('dueAt', true), uuid('assignedTo'), f('notes')], columns: ['dueAt', 'status', 'completedAt', 'notes'], transitions: { PLANNED: ['COMPLETED', 'CANCELLED', 'MISSED'] }, statusPath: '/maintenance-visits/{id}/status', statusFields: [time('completedAt'), f('notes')], limit: 500 }];
    default: return [];
  }
}
export function interactionPanels(targetType: string, targetId: string): Panel[] {
  const query = `?targetType=${targetType}&targetId=${targetId}`;
  return [
    { name: 'Activities', path: `/activities${query}`, paging: 'envelope', edit: true, remove: true, columns: ['subject', 'activityType', 'status', 'occurredAt'], fields: [req('subject'), select('activityType', ['CALL', 'EMAIL', 'MEETING', 'TASK', 'FOLLOW_UP', 'OTHER'], 'TASK'), select('status', ['PLANNED', 'COMPLETED', 'CANCELLED'], 'PLANNED'), f('description', { type: 'textarea' }), time('occurredAt'), time('dueAt'), uuid('assignedTo')] },
    { name: 'Notes', path: `/notes${query}`, paging: 'envelope', edit: true, remove: true, columns: ['content', 'createdAt'], fields: [req('content', { type: 'textarea' })] },
    { name: 'Appointments', path: `/appointments${query}`, paging: 'envelope', edit: true, remove: true, columns: ['subject', 'startsAt', 'endsAt', 'status'], fields: [req('subject'), f('description'), time('startsAt', true), time('endsAt', true), select('status', ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 'SCHEDULED'), f('location'), uuid('assignedTo')] },
  ];
}
export function initialValues(fields: Field[], row?: Row): Row {
  return Object.fromEntries(fields.map(field => {
    const relation = field.relation ? row?.[field.relation] as Row | undefined : undefined;
    let value = relation?.id ?? row?.[field.key] ?? field.value ?? '';
    if (field.type === 'datetime-local' && typeof value === 'string' && value) {
      const instant = new Date(value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
      if (!Number.isNaN(instant.getTime())) value = new Date(instant.getTime() - instant.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    if (field.type === 'checkbox') value = Boolean(value);
    return [field.key, value];
  }));
}
export function formPayload(fields: Field[], values: Row): Row {
  return Object.fromEntries(fields.map(field => {
    let value = values[field.key];
    if (value === '') value = null;
    if (field.type === 'number' && value != null) value = Number(value);
    if (field.type === 'datetime-local' && value) value = new Date(String(value)).toISOString();
    if (field.type === 'json') {
      value = JSON.parse(String(value || '{}'));
      if (!value || Array.isArray(value) || typeof value !== 'object' || Object.values(value).some(v => typeof v !== 'string')) throw new Error('Variables must be a JSON object containing text values');
    }
    return [field.key, value];
  }));
}
