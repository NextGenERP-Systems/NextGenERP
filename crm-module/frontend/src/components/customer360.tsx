'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { rows, text, type Row } from '@/lib/api';
import { Badge, DataTable, ErrorNotice, Pending, RecordFacts, useData } from './common';
const sections = [
  { key: 'contacts', columns: ['firstName', 'lastName', 'email', 'primary'], route: 'contacts' },
  { key: 'prospects', columns: ['companyName', 'primaryContactName', 'status'], route: 'prospects' },
  { key: 'opportunities', columns: ['opportunityName', 'salesStage', 'amount', 'status'], route: 'opportunities' },
  { key: 'activities', columns: ['subject', 'activityType', 'status', 'occurredAt'] },
  { key: 'notes', columns: ['content', 'createdAt'] },
  { key: 'appointments', columns: ['subject', 'startsAt', 'endsAt', 'status'] },
  { key: 'opportunityHistory', columns: ['eventType', 'fromStatus', 'toStatus', 'occurredAt'] },
  { key: 'competitors', columns: ['competitorName', 'strengths', 'weaknesses'] },
];
export function Customer360({ id, prospect }: { id: string; prospect: boolean }) {
  const query = useData<Row>(`/${prospect ? 'prospects' : 'customers'}/${id}/360`);
  const [section, setSection] = useState('contacts');
  if (query.isPending) return <Pending />;
  if (query.error || !query.data) return <ErrorNotice error={query.error} retry={() => { void query.refetch(); }} />;
  const data = query.data;
  const person = rows(data.prospects)[0];
  const current = sections.find(item => item.key === section)!;
  return <><Link className="back" href={prospect ? `/crm/prospects/${id}` : '/crm'}><ArrowLeft size={16} /> {prospect ? 'Prospect detail' : 'Dashboard'}</Link>
    <header className="page-heading"><div><p className="eyebrow">{prospect ? 'PROSPECT' : 'CUSTOMER'} 360</p><h1>{person ? text(person.companyName) : 'Customer relationship'}</h1><p className="identifier">{id}</p></div><div className="customer-avatar"><Building2 size={32} /></div></header>
    <div className="relationship-summary">{['contacts', 'opportunities', 'activities', 'appointments'].map(key => <div key={key}><strong>{rows(data[key]).length}</strong><span>Recent {key}</span></div>)}</div>
    <nav className="tabs" aria-label="Relationship sections">{sections.map(item => <button key={item.key} className={section === item.key ? 'selected' : ''} onClick={() => setSection(item.key)}>{item.key === 'opportunityHistory' ? 'History' : item.key.replace(/^./, c => c.toUpperCase())}</button>)}</nav>
    <section className="panel"><DataTable data={rows(data[section])} columns={current.columns} link={current.route ? row => `/crm/${current.route}/${row.id}` : undefined} /><p className="caption">Recent CRM records returned by the 360 API. Open a record for its available history.</p></section>
    <section className="panel"><header className="section-heading"><h2>Sales enrichment</h2><Badge value={data.salesStatus} /></header>
      {data.salesStatus === 'AVAILABLE' && data.salesDashboard && typeof data.salesDashboard === 'object' ? <RecordFacts row={data.salesDashboard as Row} /> : <p className="caption">{data.salesStatus === 'NOT_FOUND' ? 'No Sales dashboard was found for this customer.' : data.salesStatus === 'NOT_CONFIGURED' ? 'Sales enrichment is not configured.' : 'Sales enrichment is currently unavailable.'} Your CRM information remains available.</p>}
    </section>
  </>;
}
