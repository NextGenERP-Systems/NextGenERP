'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Columns3, Contact, Megaphone, Wrench, ChartNoAxesCombined, Mail, ArrowUpRight } from 'lucide-react';
const navigation = [
  { href: '/crm', name: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm/leads', name: 'Leads', icon: Users },
  { href: '/crm/prospects', name: 'Prospects', icon: Building2 },
  { href: '/crm/opportunities', name: 'Opportunities', icon: Columns3 },
  { href: '/crm/contacts', name: 'Contacts', icon: Contact },
  { href: '/crm/campaigns', name: 'Campaigns', icon: Megaphone },
  { href: '/crm/communications/messages', name: 'Communications', icon: Mail },
  { href: '/crm/service/contracts', name: 'Service', icon: Wrench },
  { href: '/crm/reports', name: 'Reports', icon: ChartNoAxesCombined },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="app"><a className="skip" href="#main">Skip to content</a><aside className="sidebar">
    <Link href="/crm" className="brand"><span className="brand-mark">N</span><div>NextGen<span>CRM WORKSPACE</span></div></Link>
    <p className="nav-caption">YOUR WORKSPACE</p><nav aria-label="Main navigation">{navigation.map(item => {
      const active = item.href === '/crm' ? path === item.href : path.startsWith(item.href.split('/').slice(0, 3).join('/'));
      return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''}><item.icon size={19} />{item.name}{active && <span className="nav-dot" />}</Link>;
    })}</nav><div className="sidebar-foot"><span className="status-dot" /> Independent CRM<p>Local review workspace</p></div>
  </aside><div className="content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> CRM <span>/</span> {path.split('/').filter(Boolean).slice(1).join(' / ') || 'Overview'}</div><Link href="/crm/opportunities/board" className="top-link">Open pipeline <ArrowUpRight size={16} /></Link></header>
    <main id="main">{children}</main><footer className="app-footer">NextGen CRM · Acquisition, relationships and service</footer></div></div>;
}
