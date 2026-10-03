import Link from 'next/link';
export default function NotFound() { return <section className="panel"><h1>Page not found</h1><p>This CRM page does not exist.</p><Link href="/crm" className="button">Back to dashboard</Link></section>; }
