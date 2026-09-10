import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextGen ERP - Production & Manufacturing (MRP)',
  description: 'Enterprise MRP Module with Multi-level BOM, Sub-Assemblies, and Real-time Shop Floor Control',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
