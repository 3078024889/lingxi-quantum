import type {SasiArtifact,SasiTask} from "../types";

export type ImageRatio="1:1"|"16:9"|"9:16";
export type ImageStyle="editorial"|"poster"|"storyboard"|"abstract";
export type ImageSpec={
 ratio:ImageRatio;style:ImageStyle;width:number;height:number;
 prompt:string;title:string;subtitle:string;seed:number;
 palette:{bg:string;bg2:string;ink:string;accent:string;soft:string};
 motif:"city"|"space"|"ocean"|"forest"|"interior"|"food"|"technology"|"abstract";
};

const PALETTES=[
 {bg:"#0a0b10",bg2:"#1a2030",ink:"#f4f1e8",accent:"#d9b76e",soft:"#6e7891"},
 {bg:"#101014",bg2:"#2a1720",ink:"#fff7ef",accent:"#efb06b",soft:"#8f6973"},
 {bg:"#071515",bg2:"#143a36",ink:"#eef9f1",accent:"#d5c276",soft:"#6d9089"},
 {bg:"#111016",bg2:"#292440",ink:"#f7f4ff",accent:"#baa7ff",soft:"#7c7796"},
 {bg:"#13110b",bg2:"#3b2d15",ink:"#fff8df",accent:"#e4bf66",soft:"#9c8760"},
];

function h(s:string){let x=2166136261>>>0;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0;}return x>>>0}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]||c))}
function clampText(s:string,n:number){const a=[...s.replace(/\s+/g," ").trim()];return a.length>n?a.slice(0,n).join("")+"…":a.join("")}
function dimensions(r:ImageRatio){return r==="16:9"?{width:1280,height:720}:r==="9:16"?{width:720,height:1280}:{width:1080,height:1080}}
function motif(prompt:string):ImageSpec["motif"]{
 const p=prompt.toLowerCase();
 if(/宇宙|太空|星|space|galaxy|planet|moon/.test(p))return"space";
 if(/海|水|ocean|sea|wave|lake/.test(p))return"ocean";
 if(/森林|树|forest|tree|nature|mountain|山/.test(p))return"forest";
 if(/城市|街|city|urban|building|地铁|station/.test(p))return"city";
 if(/房间|室内|interior|home|office|studio/.test(p))return"interior";
 if(/食物|餐|food|meal|fruit|coffee|菜|饭/.test(p))return"food";
 if(/科技|数据|code|tech|digital|未来|robot/.test(p))return"technology";
 return"abstract";
}
export function buildImageSpec(input:Record<string,unknown>):ImageSpec{
 const prompt=String(input.prompt??"").trim().slice(0,1200);
 if(!prompt)throw new Error("EMPTY_IMAGE_PROMPT");
 const ratio=(["1:1","16:9","9:16"].includes(String(input.ratio))?String(input.ratio):"1:1") as ImageRatio;
 const style=(["editorial","poster","storyboard","abstract"].includes(String(input.style))?String(input.style):"editorial") as ImageStyle;
 const d=dimensions(ratio),seed=h(`${prompt}|${ratio}|${style}`),palette=PALETTES[seed%PALETTES.length];
 const title=clampText(String(input.title||prompt),34);
 const subtitle=clampText(String(input.subtitle||prompt),90);
 return{ratio,style,...d,prompt,title,subtitle,seed,palette,motif:motif(prompt)};
}
function rand(seed:number,i:number){let x=(seed+Math.imul(i+1,2654435761))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967295}
function sceneShapes(s:ImageSpec){
 const {width:w,height:h,palette:p,seed}=s;const out:string[]=[];
 if(s.motif==="space"){
  for(let i=0;i<56;i++){const x=rand(seed,i)*w,y=rand(seed,i+80)*h*.7,r=1+rand(seed,i+160)*2.4;out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${p.ink}" opacity="${(.18+rand(seed,i+220)*.62).toFixed(2)}"/>`)}
  out.push(`<circle cx="${(w*.72).toFixed(0)}" cy="${(h*.27).toFixed(0)}" r="${(Math.min(w,h)*.13).toFixed(0)}" fill="${p.accent}" opacity=".82"/>`);
 }else if(s.motif==="city"){
  const base=h*.68;for(let i=0;i<12;i++){const bw=w*(.04+rand(seed,i)*.08),bh=h*(.14+rand(seed,i+20)*.34),x=i*w/11-bw*.5;out.push(`<rect x="${x.toFixed(0)}" y="${(base-bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" rx="4" fill="${i%3===0?p.accent:p.soft}" opacity="${i%3===0?".34":".18"}"/>`)}
  out.push(`<path d="M0 ${base} L${w} ${base} L${w} ${h} L0 ${h}Z" fill="${p.bg}" opacity=".68"/>`);
 }else if(s.motif==="ocean"){
  for(let i=0;i<5;i++){const y=h*(.38+i*.08);out.push(`<path d="M0 ${y.toFixed(0)} Q ${(w*.25).toFixed(0)} ${(y-h*.05).toFixed(0)} ${(w*.5).toFixed(0)} ${y.toFixed(0)} T ${w} ${y.toFixed(0)}" fill="none" stroke="${i%2?p.accent:p.ink}" stroke-width="${Math.max(2,w*.004).toFixed(0)}" opacity="${(.12+i*.05).toFixed(2)}"/>`)}
 }else if(s.motif==="forest"){
  for(let i=0;i<11;i++){const x=w*(i/10),th=h*(.18+rand(seed,i)*.35),tw=w*(.05+rand(seed,i+20)*.045);out.push(`<path d="M ${x.toFixed(0)} ${(h*.68).toFixed(0)} L ${(x-tw).toFixed(0)} ${(h*.68).toFixed(0)} L ${x.toFixed(0)} ${(h*.68-th).toFixed(0)} L ${(x+tw).toFixed(0)} ${(h*.68).toFixed(0)}Z" fill="${i%3===0?p.accent:p.soft}" opacity="${i%3===0?".26":".16"}"/>`)}
 }else if(s.motif==="food"){
  out.push(`<ellipse cx="${w*.55}" cy="${h*.48}" rx="${w*.25}" ry="${h*.18}" fill="${p.ink}" opacity=".08"/>`);
  for(let i=0;i<8;i++){const x=w*(.35+rand(seed,i)*.4),y=h*(.37+rand(seed,i+10)*.22),r=Math.min(w,h)*(.025+rand(seed,i+30)*.05);out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${i%2?p.accent:p.soft}" opacity=".35"/>`)}
 }else if(s.motif==="technology"){
  for(let i=0;i<16;i++){const x=rand(seed,i)*w,y=h*(.18+rand(seed,i+20)*.48);out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${Math.max(3,w*.006).toFixed(0)}" fill="${p.accent}" opacity=".5"/>`);if(i>0){const px=rand(seed,i-1)*w,py=h*(.18+rand(seed,i+19)*.48);out.push(`<line x1="${px.toFixed(0)}" y1="${py.toFixed(0)}" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}" stroke="${p.soft}" stroke-width="2" opacity=".18"/>`)}}
 }else{
  for(let i=0;i<7;i++){const x=rand(seed,i)*w,y=rand(seed,i+12)*h*.68,r=Math.min(w,h)*(.08+rand(seed,i+26)*.2);out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${i%2?p.accent:p.soft}" opacity="${(.06+rand(seed,i+40)*.13).toFixed(2)}"/>`)}
 }
 return out.join("");
}
function splitTitle(text:string,max=15){const a=[...text],out:string[]=[];for(let i=0;i<a.length;i+=max)out.push(a.slice(i,i+max).join(""));return out.slice(0,3)}
export function renderImageSvg(s:ImageSpec){
 const {width:w,height:h,palette:p}=s,m=Math.round(w*.075),titleLines=splitTitle(s.title,s.ratio==="9:16"?10:16),font=Math.max(42,Math.round(w*(s.ratio==="9:16"?.075:.055))),lh=Math.round(font*1.2);
 const titleY=Math.round(h*(s.style==="storyboard"?.64:.57));
 const title=titleLines.map((line,i)=>`<text x="${m}" y="${titleY+i*lh}" font-size="${font}" font-weight="700" fill="${p.ink}" font-family="system-ui,-apple-system,Segoe UI,sans-serif">${esc(line)}</text>`).join("");
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
 <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg}" stop-opacity="0"/><stop offset="1" stop-color="${p.bg}" stop-opacity=".94"/></linearGradient></defs>
 <rect width="${w}" height="${h}" fill="url(#bg)"/>
 ${sceneShapes(s)}
 <rect y="${Math.round(h*.38)}" width="${w}" height="${Math.round(h*.62)}" fill="url(#fade)"/>
 <text x="${m}" y="${Math.round(h*.09)}" font-size="${Math.max(18,Math.round(w*.018))}" font-weight="650" letter-spacing="2" fill="${p.accent}" font-family="system-ui,-apple-system,Segoe UI,sans-serif">LINGXIFIELD · SASI</text>
 ${title}
 <text x="${m}" y="${Math.min(h-m, titleY+titleLines.length*lh+Math.round(font*.7))}" font-size="${Math.max(20,Math.round(w*.022))}" fill="${p.ink}" opacity=".68" font-family="system-ui,-apple-system,Segoe UI,sans-serif">${esc(clampText(s.subtitle,s.ratio==="9:16"?42:70))}</text>
 <rect x="${m}" y="${h-m}" width="${Math.round(w*.16)}" height="${Math.max(4,Math.round(h*.005))}" rx="3" fill="${p.accent}"/>
 </svg>`;
}
export function imageArtifacts(task:SasiTask):SasiArtifact[]{
 const input=(task.input??{}) as Record<string,unknown>,spec=buildImageSpec(input),svg=renderImageSvg(spec);
 return[{type:"image",name:"lingxifield-sasi-image.svg",mime:"image/svg+xml",value:svg},{type:"json",name:"image-spec.json",mime:"application/json",value:spec}];
}
