'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Building2, Contact, Home,
  Mail, Megaphone, ShoppingBag, Users, Wrench, Columns3,
} from 'lucide-react';

const navigation = [
  { href: '/crm', name: 'Home', icon: Home },
  { href: '/crm/leads', name: 'Leads', icon: Users },
  { href: '/crm/prospects', name: 'Prospects', icon: Building2 },
  { href: '/crm/opportunities', name: 'Opportunities', icon: Columns3 },
  { href: '/crm/contacts', name: 'Contacts', icon: Contact },
  { href: '/crm/campaigns', name: 'Campaigns', icon: Megaphone },
  { href: '/crm/communications/messages', name: 'Communications', icon: Mail },
  { href: '/crm/service/contracts', name: 'Service', icon: Wrench },
  { href: '/crm/reports', name: 'Reports', icon: BarChart3 },
];

function isActive(path: string, href: string, name: string) {
  if (name === 'Home') return path === '/crm';
  if (name === 'Communications') return path.startsWith('/crm/communications');
  if (name === 'Service') return path.startsWith('/crm/service');
  return path === href || path.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const parts = path.split('/').filter(Boolean).slice(1);
  const current = parts.length ? parts.map(part => part.replaceAll('-', ' ')).join(' / ') : 'Workspace';

  return <div className="app">
    <a className="skip" href="#main">Skip to content</a>
    <aside className="sidebar">
      <Link href="/crm" className="brand" aria-label="CRM workspace home">
        <span className="brand-mark"><ShoppingBag size={19} strokeWidth={2} /></span>
        <span className="brand-copy"><strong>CRM</strong><small>Leads, pipeline & relationships</small></span>
      </Link>
      <nav aria-label="CRM navigation">{navigation.map(item => {
        const active = isActive(path, item.href, item.name);
        return <Link key={item.name} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''}>
          <item.icon size={18} strokeWidth={1.8} /><span>{item.name}</span>
        </Link>;
      })}</nav>
      <div className="sidebar-foot"><span className="user-avatar">C</span><span><strong>CRM Workspace</strong><small>NextGen ERP</small></span></div>
    </aside>
    <div className="content">
      <header className="topbar">
        <div className="breadcrumb"><Home size={17} /><span>/</span><Link href="/crm">CRM</Link><span>/</span><strong>{current}</strong></div>
        {path === '/crm' && <Link href="/crm/leads/new" className="button top-action">+&nbsp; New lead</Link>}
      </header>
      <main id="main">{children}</main>
    </div>
  </div>;
}
