import type {Metadata} from 'next';
import {Suspense} from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClaimForm from './ClaimForm';

export const metadata:Metadata={title:'厂商资料提交与认领申请 | 全球 SIAI 排行榜 | 灵犀场',robots:{index:false,follow:false},alternates:{canonical:'/siai/claim'}};
export default function SiaiClaimPage(){return <><Nav/><main className="lx11-page min-h-[70vh] bg-[var(--lx-bg)] px-4 py-12"><Suspense fallback={<div className="mx-auto max-w-3xl">LINGXIFIELD SIAI…</div>}><ClaimForm/></Suspense></main><Footer/></>}
