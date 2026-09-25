"use client";

type Kind = "image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const ICON:Record<Kind,string>={
 image:"◒",
 document:"≡",
 video:"▶",
 audio:"♪",
 privacy:"◇",
 utility:"✣",
 ai:"✦",
 qr:"⌗",
};
const PALETTES=[
 ["#fff0f6","#ffe7c7","#d64d88"],
 ["#eef4ff","#e8efff","#5877d8"],
 ["#eefcf8","#dff7ef","#2e9c78"],
 ["#f5efff","#eee6ff","#8062d9"],
 ["#fff7df","#ffead7","#d68135"],
 ["#edf9ff","#e2f1ff","#3788bd"],
 ["#fff0ef","#ffe5e9","#d55b68"],
 ["#f1f7ee","#e8f5df","#5c9b49"],
] as const;
function palette(slug:string){
 let n=0;for(let i=0;i<slug.length;i++)n=(n*31+slug.charCodeAt(i))>>>0;
 return PALETTES[n%PALETTES.length];
}
export default function ToolGlyph({kind,slug=""}:{kind:Kind;slug?:string}) {
 const [a,b,fg]=palette(slug||kind);
 return <span aria-hidden="true" style={{
   width:34,height:34,borderRadius:10,display:"grid",placeItems:"center",
   fontSize:17,fontWeight:750,lineHeight:1,color:fg,
   background:`linear-gradient(145deg,${a},${b})`,
   boxShadow:"inset 0 0 0 1px rgba(25,38,60,.055),0 4px 12px rgba(40,55,75,.055)"
 }}>{ICON[kind]??ICON.utility}</span>;
}
