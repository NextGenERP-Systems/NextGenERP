import { notFound } from 'next/navigation';
import { Dashboard, Reports } from '@/components/analytics';
import { Board } from '@/components/board';
import { Customer360 } from '@/components/customer360';
import { ResourceList, ResourceDetail } from '@/components/workspace';
import { resources } from '@/lib/resources';
export default async function CrmPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const parts = (await params).segments || [];
  const route = parts.join('/');
  if (!route) return <Dashboard />;
  if (route === 'reports') return <Reports />;
  if (route === 'opportunities/board') return <Board />;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (parts.length === 3 && ['customers', 'prospects'].includes(parts[0]) && parts[2] === '360' && uuid.test(parts[1])) return <Customer360 key={route} id={parts[1]} prospect={parts[0] === 'prospects'} />;
  const resource = resources.find(r => route === r.route || route.startsWith(`${r.route}/`));
  if (!resource) notFound();
  const tail = route.slice(resource.route.length).replace(/^\//, '');
  if (!tail || tail === 'new') return <ResourceList key={route} resource={resource} create={tail === 'new'} />;
  if (!uuid.test(tail)) notFound();
  return <ResourceDetail key={route} resource={resource} id={tail} />;
}
