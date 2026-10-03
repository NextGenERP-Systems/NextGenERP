'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, Columns3, ArrowUpRight, Pencil } from 'lucide-react';
import { api, rows, text, title, opportunityPayload, type Opportunity, type Row, type Page } from '@/lib/api';
import { resources, panels, transitions, type Resource, type Field } from '@/lib/resources';
import { Badge, DataTable, Empty, ErrorNotice, FormDialog, Paging, PanelView, Pending, RecordFacts, SearchBox, useData } from './common';

export function Subnav({ route }: { route: string }) {
  const group = route.startsWith('service') ? resources.filter(r => r.route.startsWith('service')) : route.startsWith('communications') ? resources.filter(r => r.route.startsWith('communications')) : [];
  return group.length ? <nav className="tabs" aria-label="Workspace sections">{group.map(r => <Link key={r.route} href={`/crm/${r.route}`} className={route === r.route ? 'selected' : ''}>{r.name}</Link>)}</nav> : null;
}
export function ResourceList({ resource, create = false }: { resource: Resource; create?: boolean }) {
  const router = useRouter();
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(create);
  const [messageKey] = useState(() => crypto.randomUUID());
  const path = `${resource.api}${resource.paging ? `?page=${page}&size=20` : ''}`;
  const query = useData<unknown>(path);
  const all = rows(query.data);
  const filtered = all.filter(row => resource.columns.some(key => text(row[key]).toLowerCase().includes(search.toLowerCase())));
  const fields = resource.fields.map(field => field.key === 'idempotencyKey' ? { ...field, value: messageKey } : field);
  return <><Subnav route={resource.route} /><header className="page-heading"><div><p className="eyebrow">RELATIONSHIP WORKSPACE</p><h1>{resource.name}</h1><p>Manage your {resource.name.toLowerCase()} and keep every next step in view.</p></div><div className="heading-actions">
    {resource.route === 'opportunities' && <Link className="button secondary" href="/crm/opportunities/board"><Columns3 size={17} /> Kanban board</Link>}
    <button className="button" onClick={() => setShowForm(true)}><Plus size={17} /> New {resource.singular.toLowerCase()}</button></div></header>
    {resource.route === 'communications/messages' && <div className="notice">Messages are prepared in the CRM queue. Offline providers are active; queued or submitted messages do not imply delivery.</div>}
    {resource.route === 'opportunities' && <p className="caption">Opportunity amounts are raw values with no recorded currency.</p>}
    <section className="panel"><div className="table-toolbar"><SearchBox value={search} onChange={setSearch} /><button className="icon-button" aria-label="Refresh records" onClick={() => { void query.refetch(); }}><RefreshCw size={18} /></button></div>
      {query.isPending ? <Pending /> : query.error ? <ErrorNotice error={query.error} retry={() => { void query.refetch(); }} /> : filtered.length ? <DataTable data={filtered} columns={resource.columns} link={row => `/crm/${resource.route}/${row.id}`} /> : <Empty>{search ? 'No matching records on this page.' : `No ${resource.name.toLowerCase()} yet. Create one to get started.`}</Empty>}
      {resource.paging && <Paging page={page} next={() => { setPage(p => p + 1); setSearch(''); }} previous={() => { setPage(p => p - 1); setSearch(''); }} last={resource.paging === 'envelope' ? Boolean((query.data as Page<Row>)?.last) : all.length < 20} count={resource.paging === 'envelope' ? (query.data as Page<Row>)?.totalElements : undefined} />}
      {!resource.paging && <p className="caption">Search applies to the records loaded from CRM.</p>}
    </section>
    {showForm && <FormDialog name={`New ${resource.singular.toLowerCase()}`} fields={fields} close={() => setShowForm(false)} onSave={async body => {
      if (resource.route === 'opportunities' && body.status !== 'OPEN' && !confirm(`Create this opportunity as ${body.status}? WON records CRM conversion intent.`)) throw new Error('Outcome change was cancelled.');
      const saved = await api<Row>(resource.api, 'POST', body); await client.invalidateQueries({ queryKey: ['crm'] }); router.push(`/crm/${resource.route}/${saved.id}`);
    }} />}
  </>;
}
export function ResourceDetail({ resource, id }: { resource: Resource; id: string }) {
  const router = useRouter();
  const client = useQueryClient();
  const query = useData<Row>(`${resource.api}/${id}`);
  const [form, setForm] = useState<{ name: string; fields: Field[]; row?: Row; save: (body: Row) => Promise<void> }>();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  async function write(path: string, method: string, body?: unknown) { await api(path, method, body); await client.invalidateQueries({ queryKey: ['crm'] }); }
  async function run(action: () => Promise<void>) { setBusy(true); setError(undefined); try { await action(); } catch (e) { setError(e); } finally { setBusy(false); } }
  if (query.isPending) return <Pending />;
  if (query.error || !query.data) return <><Link className="back" href={`/crm/${resource.route}`}><ArrowLeft size={16} /> {resource.name}</Link><ErrorNotice error={query.error} retry={() => { void query.refetch(); }} /></>;
  const row = query.data;
  const options: string[] = resource.route === 'campaigns' ? transitions.campaigns[String(row.status) as keyof typeof transitions.campaigns] || []
    : resource.route === 'service/contracts' ? transitions.contracts[String(row.status) as keyof typeof transitions.contracts] || []
      : resource.route === 'service/warranty-claims' ? transitions.claims[String(row.status) as keyof typeof transitions.claims] || []
        : resource.route === 'service/fulfilments' ? transitions.fulfilments[String(row.status) as keyof typeof transitions.fulfilments] || []
          : resource.route === 'service/maintenance' ? transitions.maintenance[String(row.status) as keyof typeof transitions.maintenance] || [] : [];
  const statusFields: Field[] = [{ key: 'status', type: 'select', required: true, options },
    ...(resource.route === 'service/warranty-claims' ? [{ key: 'note' }, { key: 'resolution', type: 'textarea' as const, hint: 'Required when resolving a claim' }] : []),
    ...(resource.route === 'service/fulfilments' ? [{ key: 'completedQuantity', type: 'number' as const, min: 0, step: '0.001' }, { key: 'completedAt', type: 'datetime-local' as const }] : [])];
  const related = panels(resource, id).map(panel => resource.route === 'service/contracts' && row.status !== 'DRAFT' && panel.fields ? { ...panel, fields: undefined } : panel);
  return <><Subnav route={resource.route} /><Link className="back" href={`/crm/${resource.route}`}><ArrowLeft size={16} /> {resource.name}</Link>
    <header className="page-heading"><div><p className="eyebrow">{resource.singular.toUpperCase()}</p><h1>{title(row)}</h1><div className="detail-meta"><Badge value={row.status ?? row.state ?? row.channel} /><span className="identifier">{id}</span></div></div><div className="heading-actions">
      {resource.edit && (resource.route !== 'service/contracts' || row.status === 'DRAFT') && <button className="button secondary" onClick={() => setForm({ name: `Edit ${resource.singular.toLowerCase()}`, fields: resource.fields, row, save: async body => {
        if (resource.route === 'opportunities' && body.status !== row.status && !confirm(`Mark this opportunity ${body.status}? WON records CRM conversion intent only.`)) throw new Error('Outcome change was cancelled.');
        const saved = await api<Row>(`${resource.api}/${id}`, 'PUT', { ...(resource.route === 'opportunities' ? opportunityPayload(row as Opportunity) : {}), ...body, ...(row.version != null ? { version: row.version } : {}), ...(resource.route === 'campaigns' ? { status: row.status } : {}) });
        await client.invalidateQueries({ queryKey: ['crm'] });
        if (resource.route === 'communications/templates' && saved.id !== id) router.push(`/crm/${resource.route}/${saved.id}`);
      } })}><Pencil size={16} /> Edit</button>}
      {resource.route === 'leads' && <button className="button" disabled={busy} onClick={() => { void run(async () => { const prospect = await api<Row>(`${resource.api}/${id}/qualify`, 'POST'); await client.invalidateQueries({ queryKey: ['crm'] }); router.push(`/crm/prospects/${prospect.id}`); }); }}>{row.status === 'QUALIFIED' ? 'Open linked prospect' : 'Qualify lead'}</button>}
      {options.length > 0 && <button className="button" onClick={() => setForm({ name: 'Change status', fields: statusFields, row: { completedQuantity: row.completedQuantity }, save: body => write(`${resource.api}/${id}/status`, 'POST', { ...body, ...(row.version != null ? { version: row.version } : {}) }) })}>Change status</button>}
      {resource.route === 'communications/messages' && row.status === 'QUEUED' && <button className="button danger" onClick={() => { void run(() => write(`${resource.api}/${id}/cancel`, 'POST')); }}>Cancel message</button>}
      {resource.route === 'communications/templates' && <button className="button secondary" onClick={() => { void run(() => write(`${resource.api}/${id}/active`, 'POST', { active: !row.active })); }}>{row.active ? 'Deactivate template' : 'Activate template'}</button>}
      {resource.remove && <button className="button danger" disabled={busy} onClick={() => { if (!confirm(`Delete this ${resource.singular.toLowerCase()}? History and references may protect it.`)) return; void run(async () => { await write(`${resource.api}/${id}`, 'DELETE'); router.push(`/crm/${resource.route}`); }); }}>Delete</button>}
    </div></header>
    {resource.route === 'prospects' && <Link className="button secondary" href={`/crm/prospects/${id}/360`}>Open prospect 360 <ArrowUpRight size={16} /></Link>}
    {row.customerId ? <Link className="button secondary" href={`/crm/customers/${row.customerId}/360`}>Open customer 360 <ArrowUpRight size={16} /></Link> : null}
    {resource.route === 'prospects' && row.status === 'CONVERTED_TO_CUSTOMER' && <p className="notice">CRM conversion intent recorded. No Sales customer has been created by CRM.</p>}
    {error != null && <ErrorNotice error={error} retry={() => { setError(undefined); void query.refetch(); }} />}
    <section className="panel"><h2>Record details</h2><RecordFacts row={row} /></section>
    {resource.route === 'contacts' && <div className="heading-actions">{['EMAIL', 'SMS'].map(channel => <button key={channel} className="button secondary" onClick={() => setForm({ name: `${channel} preference`, fields: [{ key: 'consentState', type: 'select', required: true, options: ['OPTED_IN', 'OPTED_OUT', 'UNKNOWN'] }, { key: 'source', required: true, hint: 'How this preference was obtained' }], save: body => write(`/contacts/${id}/communication-preferences/${channel}`, 'PUT', body) })}>Set {channel} preference</button>)}</div>}
    {related.map(panel => <PanelView key={panel.path} panel={panel} target={['leads', 'prospects', 'opportunities'].includes(resource.route) && panel.path.includes('targetType=') ? { targetType: resource.route === 'opportunities' ? 'OPPORTUNITY' : resource.route === 'prospects' ? 'PROSPECT' : 'LEAD', targetId: id } : undefined} />)}
    {form && <FormDialog {...form} onSave={form.save} close={() => setForm(undefined)} />}
  </>;
}
