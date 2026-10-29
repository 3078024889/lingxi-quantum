import Link from 'next/link';
import type {ReactNode} from 'react';

export default function MarketLayout({children}:{children:ReactNode}) {
 return <div>
  <header style={{padding:'16px 20px',borderBottom:'1px solid #dce6f3',background:'#fff'}}>
   <div style={{maxWidth:1100,margin:'auto',display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
    <Link href="/ai-market" style={{fontWeight:800,color:'#1255bc',textDecoration:'none'}}>LINGXIFIELD AI</Link>
    <nav aria-label="Languages" style={{display:'flex',flexWrap:'wrap',gap:12,flex:1}}>
     {[['zh','中文'],['en','English'],['ja','日本語'],['ko','한국어'],['fr','Français'],['de','Deutsch'],['es','Español'],['pt','Português'],['ar','العربية']].map(([code,name])=><Link key={code} href={'/ai-market/lang/'+code} lang={code} style={{fontSize:13,color:'#345780'}}>{name}</Link>)}
    </nav>
    <Link href="/account?next=%2Faccount%2Fai-market-review" aria-label="Account" style={{border:'1px solid #bdd0ed',borderRadius:9,padding:'8px 12px',color:'#1255bc'}}>◉</Link>
   </div>
  </header>
  {children}
 </div>;
}
