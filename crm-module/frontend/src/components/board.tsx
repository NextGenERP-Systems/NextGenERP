'use client';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api, opportunityPayload, text, type Lookups, type Opportunity } from '@/lib/api';
import { Badge, ErrorNotice, Pending, SearchBox, useData } from './common';
export function Board() {
  const query = useData<Opportunity[]>('/opportunities');
  const lookup = useData<Lookups>('/lookups');
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState('OPEN');
  const [moving, setMoving] = useState<string>();
  const locks = useRef(new Set<string>());
  const [error, setError] = useState<unknown>();
  async function move(id: string, stage: string) {
    if (locks.current.has(id)) return;
    locks.current.add(id); setMoving(id); setError(undefined);
    const previous = client.getQueryData<Opportunity[]>(['crm', '/opportunities']);
    try {
      const latest = await api<Opportunity>(`/opportunities/${id}`);
      const visible = previous?.find(row => row.id === id);
      if (visible && visible.updatedAt !== latest.updatedAt) throw new Error('Opportunity changed since the board loaded. Reload and review before moving.');
      client.setQueryData<Opportunity[]>(['crm', '/opportunities'], old => old?.map(row => row.id === id ? { ...row, salesStage: lookup.data?.salesStages.find(s => s.id === stage) || null } : row));
      await api(`/opportunities/${id}`, 'PUT', { ...opportunityPayload(latest), salesStageId: stage || null });
    } catch (e) { client.setQueryData(['crm', '/opportunities'], previous); setError(e); }
    finally { locks.current.delete(id); setMoving(undefined); await client.invalidateQueries({ queryKey: ['crm'] }); }
  }
  if (query.isPending || lookup.isPending) return <Pending />;
  if (query.error || lookup.error) return <ErrorNotice error={query.error || lookup.error} retry={() => { void query.refetch(); void lookup.refetch(); }} />;
  const all = query.data || [];
  const stages = [...(lookup.data?.salesStages || [])].sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
  for (const row of all) if (row.salesStage?.id && !stages.some(s => s.id === row.salesStage?.id)) stages.push({ id: String(row.salesStage.id), name: text(row.salesStage.name), isActive: false });
  const columns = [{ id: '', name: 'Unassigned', isActive: true }, ...stages];
  return <><header className="page-heading"><div><p className="eyebrow">OPPORTUNITY PIPELINE</p><h1>Keep the next move clear.</h1><p>Move opportunities through your stages. Every change stays in their history.</p></div><Link className="button secondary" href="/crm/opportunities">List view</Link></header>
    <div className="board-toolbar"><SearchBox value={search} onChange={setSearch} /><label>Outcome <select value={outcome} onChange={e => setOutcome(e.target.value)}><option>OPEN</option><option>WON</option><option>LOST</option></select></label></div>
    <p className="caption">Raw opportunity amounts · Drag cards or use “Move to stage”. Stage moves preserve the opportunity outcome.</p>
    {error != null && <ErrorNotice error={error} retry={() => { setError(undefined); void query.refetch(); }} />}
    <div className="board">{columns.map(column => {
      const data = all.filter(row => row.status === outcome && (row.salesStage?.id || '') === column.id && row.opportunityName.toLowerCase().includes(search.toLowerCase()));
      return <section className="board-column" key={column.id} aria-label={`${column.name} stage`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (all.some(row => row.id === id)) void move(id, column.id); }}>
        <header><h2>{column.name}{column.isActive === false ? ' · inactive' : ''}</h2><span>{data.length}</span></header>
        <p className="column-total">{data.reduce((sum, row) => sum + Number(row.amount || 0), 0).toLocaleString()} <span>raw amount</span></p>
        {data.map(row => <article className="deal-card" key={row.id} draggable={!moving} onDragStart={event => event.dataTransfer.setData('text/plain', row.id)}>
          <Badge value={row.status} /><Link href={`/crm/opportunities/${row.id}`}><h3>{row.opportunityName}</h3></Link><p>{text(row.prospect?.companyName ?? row.customerId)}</p>
          <div className="deal-amount">{text(row.amount)} <small>raw amount</small></div>
          <label className="move-label">Move to stage<select aria-label={`Move ${row.opportunityName} to stage`} value={column.id} disabled={Boolean(moving)} onChange={event => { void move(row.id, event.target.value); }}>{columns.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
          {moving === row.id && <small role="status">Saving move…</small>}
        </article>)}{!data.length && <div className="board-empty">No opportunities in this stage</div>}
      </section>;
    })}</div>
  </>;
}
