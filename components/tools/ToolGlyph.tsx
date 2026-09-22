"use client";

type Kind = "image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

export default function ToolGlyph({kind}:{kind:Kind}){
  const common={width:28,height:28,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  if(kind==="image") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m5.5 17 4.2-4.2 3.2 3.2 2.1-2.1 3.5 3.1"/></svg>;
  if(kind==="document") return <svg {...common}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M9.5 12h5M9.5 15h5M9.5 18h3.5"/></svg>;
  if(kind==="video") return <svg {...common}><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2v8l-4-2z"/><path d="m9 9 4 3-4 3z"/></svg>;
  if(kind==="audio") return <svg {...common}><path d="M9 18V6l9-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="15.5" cy="16" r="2.5"/></svg>;
  if(kind==="privacy") return <svg {...common}><path d="M12 3 5 6v5c0 4.8 2.8 8.4 7 10 4.2-1.6 7-5.2 7-10V6z"/><path d="M9 12h6M12 9v6"/></svg>;
  if(kind==="ai") return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="5"/><path d="M10 11h.01M14 11h.01M10 14c1 .7 3 .7 4 0"/></svg>;
  if(kind==="qr") return <svg {...common}><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2v6h-4v-2h-2v2"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>;
}
