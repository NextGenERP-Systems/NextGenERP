'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { RefreshCw, Plus, X, ArrowRight, Search } from 'lucide-react';
import { api, ApiError, dateDisplay, label, rows, text, type Lookups, type Row } from '@/lib/api';
import { formPayload, initialValues, type Field, type Panel } from '@/lib/resources';

export function useData<T>(path: string) {
  return useQuery({ queryKey: ['crm', path], queryFn: () => api<T>(path), retry: false, staleTime: 0 });
}
export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="error"><strong>{error instanceof ApiError && error.status === 404 ? 'Record not found. ' : ''}</strong>
    {error instanceof Error ? error.message : 'Something went wrong.'}
    {retry && <button onClick={retry} className="button secondary">Reload and review</button>}</div>;
}
export function Pending() { return <div className="empty" role="status"><RefreshCw className="spin" size={20} /> Loading CRM records…</div>; }
export function Empty({ children = 'No records yet. Add your first record to get started.' }: { children?: React.ReactNode }) { return <div className="empty">{children}</div>; }
export function Badge({ value }: { value: unknown }) {
  const state = text(value);
  return <span className={`badge ${['ACTIVE', 'WON', 'COMPLETED', 'DELIVERED', 'AVAILABLE', 'OPTED_IN', 'APPROVED'].includes(state) ? 'positive' : ['LOST', 'FAILED', 'REJECTED', 'UNAVAILABLE', 'OPTED_OUT'].includes(state) ? 'negative' : ''}`}>{state.replaceAll('_', ' ')}</span>;
}
export function Value({ value, name = '' }: { value: unknown; name?: string }) {
  if (['status', 'state', 'consentState', 'salesStatus'].includes(name)) return <Badge value={value} />;
  if (Array.isArray(value)) return value.length && value.every(item => item && typeof item === 'object') ? <DataTable data={value as Row[]} columns={Object.keys(value[0] as Row).filter(k => !['payloadHash','hibernateLazyInitializer','handler'].includes(k))} /> : <span>{value.map(text).join(', ') || '—'}</span>;
  if (value && typeof value === 'object') {
    const row = value as Row;
    if ('name' in row || 'companyName' in row || 'id' in row) return <span>{text(value)}</span>;
    return <dl className="inline-values">{Object.entries(row).map(([k, v]) => <div key={k}><dt>{label(k)}</dt><dd><Value value={v} name={k} /></dd></div>)}</dl>;
  }
  return <span className={name === 'id' || name.endsWith('Id') ? 'identifier' : ''}>{dateDisplay(value)}</span>;
}
export function DataTable({ data, columns, link, actions }: { data: Row[]; columns: string[]; link?: (row: Row) => string; actions?: (row: Row) => React.ReactNode }) {
  if (!data.length) return <Empty />;
  return <div className="table-scroll"><table><thead><tr>{columns.map(k => <th key={k}>{label(k)}</th>)}{actions && <th>Actions</th>}</tr></thead>
    <tbody>{data.map((row, index) => <tr key={row.id || index}>{columns.map((k, column) => <td key={k}>
      {column === 0 && link ? <Link className="record-link" href={link(row)}><Value value={row[k]} name={k} /><ArrowRight size={14} /></Link> : <Value value={row[k]} name={k} />}
    </td>)}{actions && <td className="row-actions">{actions(row)}</td>}</tr>)}</tbody></table></div>;
}
export function RecordFacts({ row }: { row: Row }) {
  return <dl className="facts">{Object.entries(row).filter(([key]) => !['hibernateLazyInitializer', 'handler', 'payloadHash', 'leaseUntil', 'version'].includes(key)).map(([key, value]) =>
    <div key={key}><dt>{label(key)}</dt><dd><Value value={value} name={key} /></dd></div>)}</dl>;
}
export function Paging({ page, next, previous, last, count }: { page: number; next: () => void; previous: () => void; last: boolean; count?: number }) {
  return <div className="paging"><span>Page {page + 1}{count != null ? ` · ${count} records` : ' · totals unavailable'}</span><div>
    <button className="button secondary" disabled={page === 0} onClick={previous}>Previous</button>
    <button className="button secondary" disabled={last} onClick={next}>Next</button></div></div>;
}
export function FormDialog({ name, fields, row, onSave, close }: { name: string; fields: Field[]; row?: Row; onSave: (body: Row) => Promise<void>; close: () => void }) {
  const modal = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    modal.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    return () => previous?.focus();
  }, []);
  const [values, setValues] = useState<Row>(() => initialValues(fields, row));
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const lookups = useData<Lookups>('/lookups');
  const errors = error instanceof ApiError ? error.fields : {};
  const hasLookup = fields.some(field => field.lookup);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(undefined); setBusy(true);
    try { await onSave(formPayload(fields, values)); close(); }
    catch (e) { setError(e); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop"><section ref={modal} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="modal" onKeyDown={event => {
    if (event.key === 'Escape' && !busy) { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const focusable = Array.from(modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]') || []);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }}>
    <header><div><span className="eyebrow">CRM WORKSPACE</span><h2 id="dialog-title">{name}</h2></div><button className="icon-button" onClick={close} disabled={busy} aria-label="Close form"><X /></button></header>
    <form onSubmit={submit}><div className="form-grid">{fields.map(field => {
      const value = values[field.key];
      const common = { id: `field-${field.key}`, name: field.key, required: field.required, disabled: busy, 'aria-invalid': Boolean(errors[field.key]), 'aria-describedby': field.hint ? `hint-${field.key}` : undefined };
      const set = (value: unknown) => setValues(previous => ({ ...previous, [field.key]: value }));
      return <div className={`field ${['textarea', 'json'].includes(field.type || '') ? 'wide' : ''}`} key={field.key}>
        <label htmlFor={common.id}>{field.name || label(field.key)}{field.required && <span aria-hidden="true"> *</span>}</label>
        {field.type === 'select' ? <select {...common} value={String(value ?? '')} onChange={e => set(e.target.value)}><option value="">Choose…</option>
          {(field.lookup ? lookups.data?.[field.lookup] || [] : (field.options || []).map(v => ({ id: v, name: v }))).map(option => <option key={option.id} value={option.id}>{option.name.replaceAll('_', ' ')}</option>)}
          {value && !(field.lookup ? lookups.data?.[field.lookup] || [] : (field.options || []).map(v => ({ id: v }))).some(o => o.id === value) ? <option value={String(value)}>{String(value)}</option> : null}
        </select> : field.type === 'textarea' || field.type === 'json' ? <textarea {...common} rows={4} value={String(value ?? '')} onChange={e => set(e.target.value)} />
          : field.type === 'checkbox' ? <input {...common} type="checkbox" checked={Boolean(value)} onChange={e => set(e.target.checked)} />
          : <input {...common} type={field.type || 'text'} value={String(value ?? '')} onChange={e => set(e.target.value)} min={field.min} max={field.max} step={field.step} pattern={field.pattern} maxLength={field.maxLength} />}
        {field.hint && <small id={`hint-${field.key}`}>{field.hint}</small>}{errors[field.key] && <small className="field-error">{errors[field.key]}</small>}
      </div>;
    })}</div>
      {hasLookup && lookups.error && <ErrorNotice error={lookups.error} retry={() => { void lookups.refetch(); }} />}
      {error != null && <ErrorNotice error={error} />}
      <footer><button type="button" className="button secondary" onClick={close} disabled={busy}>Cancel</button><button className="button" disabled={busy || (hasLookup && !lookups.data)}>{busy ? 'Saving…' : 'Save'}</button></footer>
    </form></section></div>;
}
export function PanelView({ panel, target }: { panel: Panel; target?: { targetType: string; targetId: string } }) {
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<{ name: string; fields: Field[]; row?: Row; save: (body: Row) => Promise<void> }>();
  const [error, setError] = useState<unknown>();
  const [events, setEvents] = useState<string>();
  const queryPath = `${panel.path}${panel.paging ? `${panel.path.includes('?') ? '&' : '?'}page=${page}&size=20` : ''}`;
  const query = useData<unknown>(queryPath);
  const data = rows(query.data);
  const base = panel.path.split('?')[0];
  async function write(path: string, method: string, body?: unknown) { await api(path, method, body); await client.invalidateQueries({ queryKey: ['crm'] }); }
  const selectedId = (row: Row) => String(row.competitorId ?? row.id);
  return <section className="panel"><header className="section-heading"><h2>{panel.name}</h2>{panel.fields && <button className="button small secondary" onClick={() => setForm({ name: `Add ${panel.name}`, fields: panel.fields!, save: body => write(base, 'POST', target ? { ...body, target } : body) })}><Plus size={16} /> Add</button>}</header>
    {query.isPending ? <Pending /> : query.error ? <ErrorNotice error={query.error} retry={() => { void query.refetch(); }} /> : <DataTable data={data} columns={panel.columns} actions={panel.edit || panel.transitions ? row => <>
      {panel.edit && <button className="button small secondary" onClick={() => setForm({ name: `Edit ${panel.name}`, fields: panel.fields!, row, save: body => write(`${base}/${selectedId(row)}`, 'PUT', target ? { ...body, target } : body) })}>Edit</button>}
      {panel.remove && <button className="button small danger" onClick={async () => { if (!confirm('Delete this CRM record?')) return; try { await write(`${base}/${selectedId(row)}`, 'DELETE'); } catch (e) { setError(e); } }}>Delete</button>}
      {(panel.transitions?.[String(row[panel.statusKey || 'status'])] || []).length > 0 && <button className="button small secondary" onClick={() => setForm({ name: 'Change status', fields: [{ key: 'status', type: 'select', required: true, options: panel.transitions![String(row[panel.statusKey || 'status'])] }, ...(panel.statusFields || [])], save: body => write(panel.statusPath!.replace('{id}', String(row.id)), panel.statusPath!.endsWith('/status') ? 'POST' : 'PUT', body) })}>Change status</button>}
      {panel.name === 'Members' && <button className="button small secondary" onClick={() => setEvents(`${base}/${row.id}/events`)}>History</button>}
    </> : undefined} />}
    {panel.limit && <p className="caption">Showing up to {panel.limit} records; earlier history may not be included.</p>}
    {panel.paging && <Paging page={page} previous={() => setPage(p => p - 1)} next={() => setPage(p => p + 1)} last={panel.paging === 'envelope' ? Boolean((query.data as Row)?.last) : data.length < 20} count={panel.paging === 'envelope' ? Number((query.data as Row)?.totalElements ?? 0) : undefined} />}
    {error != null && <ErrorNotice error={error} />}
    {form && <FormDialog {...form} onSave={form.save} close={() => setForm(undefined)} />}
    {events && <div className="history-expanded"><button className="button small secondary" onClick={() => setEvents(undefined)}>Close history</button><PanelView panel={{ name: 'Member status events', path: events, columns: ['fromStatus', 'toStatus', 'changedAt'], limit: 100 }} /></div>}
  </section>;
}
export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="search"><Search size={18} /><input aria-label="Search loaded records" placeholder="Search loaded records…" value={value} onChange={e => onChange(e.target.value)} /></label>;
}
