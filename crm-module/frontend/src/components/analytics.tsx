'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users, Target, Trophy, FileCheck2 } from 'lucide-react';
import { label, rows, snapshotAmount, text, type Row } from '@/lib/api';
import { DataTable, Empty, ErrorNotice, Pending, RecordFacts, useData } from './common';

function Metric({ name, value, icon: Icon }: { name: string; value: unknown; icon: typeof Users }) {
  return <div className="metric"><div><span>{name}</span><Icon size={20} /></div><strong>{text(value)}</strong><small>Records in the selected period</small></div>;
}
function Bars({ data, name, value }: { data: Row[]; name: string; value: string }) {
  const max = Math.max(...data.map(row => Number(row[value]) || 0), 1);
  if (!data.length) return <Empty>No data in this period.</Empty>;
  return <div className="bars">{data.map((row, index) => <div className="bar-row" key={index}><div><span>{text(row[name]).replaceAll('_', ' ')}</span><strong>{text(row[value])}</strong></div><div className="bar-track"><div style={{ width: `${Math.max(0, Number(row[value]) / max * 100)}%` }} /></div></div>)}</div>;
}
function Semantics({ value }: { value: unknown }) {
  return <div className="semantics">{typeof value === 'string' ? <p>{value}</p> : value && typeof value === 'object' ? Object.entries(value).map(([key, message]) => <p key={key}><strong>{label(key)}: </strong>{text(message)}</p>) : null}</div>;
}
export function Report({ kind, query = '', compact = false }: { kind: string; query?: string; compact?: boolean }) {
  const result = useData<Row>(`/analytics/${kind}${query}`);
  const data = result.data;
  return <section className={`panel report ${compact ? 'compact' : ''}`}><header className="section-heading"><h2>{kind === 'pipeline' ? 'Current pipeline' : `${label(kind)} report`}</h2><button className="text-button" onClick={() => { void result.refetch(); }}>Refresh</button></header>
    {result.isPending ? <Pending /> : result.error ? <ErrorNotice error={result.error} retry={() => { void result.refetch(); }} /> : data ? <>
      <p className="caption">Definition {text(data.definitionVersion)} · {text((data.filters as Row)?.from)} to {text((data.filters as Row)?.to)} · UTC{(data.filters as Row)?.scopeId ? ` · scope ${text((data.filters as Row).scopeId)}` : ''}</p>
      {kind === 'overview' && <><div className="metrics"><Metric name="New leads" value={(data.counts as Row)?.leadsCreated} icon={Users} /><Metric name="Opportunities" value={(data.counts as Row)?.opportunitiesCreated} icon={Target} /><Metric name="Won opportunities" value={(data.counts as Row)?.opportunitiesWon} icon={Trophy} /><Metric name="Contracts" value={(data.counts as Row)?.contractsCreated} icon={FileCheck2} /></div>
        <div className="rates">{Object.entries((data.rates as Row) || {}).map(([key, value]) => <div key={key}><span>{label(key)}</span><strong>{(Number(value) * 100).toFixed(1)}%</strong></div>)}</div>
      </>}
      {kind === 'funnel' && <div className="chart-pair"><div><h3>Lead statuses</h3><Bars data={rows(data.leadStatuses)} name="status" value="recordCount" /><DataTable data={rows(data.leadStatuses)} columns={['status', 'recordCount']} /></div><div><h3>Opportunity statuses</h3><Bars data={rows(data.opportunityStatuses)} name="status" value="recordCount" /><DataTable data={rows(data.opportunityStatuses)} columns={['status', 'recordCount', 'rawAmountSum']} /></div></div>}
      {kind === 'pipeline' && <><Bars data={rows(data.stages)} name="stageName" value="opportunities" /><DataTable data={rows(data.stages)} columns={['stageName', 'opportunities', 'rawAmountSum', 'avgDaysInCurrentStage']} />{!compact && <><h3>Period outcomes</h3><DataTable data={rows(data.outcomes)} columns={['status', 'opportunities', 'rawAmountSum']} /></>}</>}
      {kind === 'campaigns' && <><p className="caption">Up to 500 campaign summaries · costs retain their recorded currencies</p><DataTable data={rows(data.campaigns)} columns={['name', 'touchpoints', 'attributedLeads', 'attributedProspects', 'attributedOpportunities', 'recordedCostByCurrency', 'rawAttributedOpportunityAmount']} /></>}
      {kind === 'service' && <RecordFacts row={(data.metrics as Row) || {}} />}
      {Array.isArray(data.contractAmountsByCurrency) && <div className="currency-totals"><h3>Contract snapshots</h3>{rows(data.contractAmountsByCurrency).map(row => <div key={String(row.currency)}><strong>{snapshotAmount(row.amount, row.currency)}</strong><span>Recorded contract amount</span></div>)}{!rows(data.contractAmountsByCurrency).length && <p>No contract amounts in this period.</p>}</div>}
      <Semantics value={data.semantics} /><Semantics value={data.amountSemantics} />{!compact && <Semantics value={data.durationSemantics} />}
    </> : null}
  </section>;
}
function ReportFilters({ onApply, scope }: { onApply: (query: string) => void; scope?: string }) {
  const today = new Date().toISOString().slice(0, 10);
  return <form className="filters" onSubmit={event => {
    event.preventDefault(); const values = new FormData(event.currentTarget); const query = new URLSearchParams();
    for (const [key, value] of values) if (String(value)) query.set(key, String(value));
    onApply(query.size ? `?${query}` : '');
  }}><label>From (UTC)<input type="date" name="from" max={today} /></label><label>To (UTC)<input type="date" name="to" max={today} /></label>
    {scope && <label>{scope === 'ownerId' ? 'Owner UUID' : 'Customer UUID'}<input name={scope} pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" placeholder="All records" /></label>}
    <button className="button secondary">Apply filters</button></form>;
}
export function Dashboard() {
  const [query, setQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  return <><header className="page-heading"><div><h1>CRM Workspace</h1><p>Leads, opportunities and relationships at a glance.</p></div></header>
    <ReportFilters onApply={setQuery} scope="ownerId" />
    <Report kind="pipeline" query={query} compact />
    <Report kind="overview" query={query} />
    <div className="dashboard-grid"><section className="panel next-steps"><h2>CRM</h2><Link href="/crm/leads"><div><strong>Leads</strong><span>Review new leads and qualification</span></div><ArrowUpRight /></Link><Link href="/crm/prospects"><div><strong>Prospects</strong><span>Keep relationships moving forward</span></div><ArrowUpRight /></Link><Link href="/crm/opportunities/board"><div><strong>Opportunity pipeline</strong><span>Move open opportunities to their next stage</span></div><ArrowUpRight /></Link></section><section className="panel next-steps"><h2>Activity & service</h2><Link href="/crm/campaigns"><div><strong>Campaigns</strong><span>Track participation and attribution</span></div><ArrowUpRight /></Link><Link href="/crm/communications/messages"><div><strong>Communications</strong><span>Review messages and templates</span></div><ArrowUpRight /></Link><Link href="/crm/service/maintenance"><div><strong>Maintenance</strong><span>Record visits and upcoming due dates</span></div><ArrowUpRight /></Link>
      <form onSubmit={event => event.preventDefault()}><label htmlFor="customer-lookup">Customer 360</label><input id="customer-lookup" placeholder="External customer UUID" value={customerId} onChange={e => setCustomerId(e.target.value)} />
        {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId) ? <Link className="button secondary" href={`/crm/customers/${customerId}/360`}>Open customer 360 <ArrowUpRight size={16} /></Link> : <p className="caption">Use a customer ID referenced by CRM contacts or opportunities.</p>}
      </form></section></div>
  </>;
}
export function Reports() {
  const [kind, setKind] = useState('funnel');
  const [query, setQuery] = useState('');
  return <><header className="page-heading"><div><p className="eyebrow">CRM ANALYTICS</p><h1>From activity to insight.</h1><p>Reports from CRM records and known history, with definitions you can inspect.</p></div></header>
    <nav className="tabs" aria-label="Report type">{['overview', 'funnel', 'pipeline', 'campaigns', 'service'].map(item => <button key={item} className={item === kind ? 'selected' : ''} onClick={() => { setKind(item); setQuery(''); }}>{label(item)}</button>)}</nav>
    <ReportFilters key={kind} onApply={setQuery} scope={kind === 'campaigns' ? undefined : kind === 'service' ? 'customerId' : 'ownerId'} />
    <Report kind={kind} query={query} />
  </>;
}
