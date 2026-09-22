import type { ReactNode } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function AdvancedToolPage({ title, intro, children, note }: { title: string; intro: string; children: ReactNode; note?: string }) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fbfcfe] pt-16 text-slate-900 lg:ml-[260px] lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <a href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700">← 回到全部工具</a>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{intro}</p>
          {note && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm leading-6 text-blue-900">{note}</div>}
          <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,.05)] sm:p-6">{children}</div>
        </div>
      </main>
      <div className="bg-[#fbfcfe] lg:ml-[260px]"><Footer /></div>
    </>
  );
}
