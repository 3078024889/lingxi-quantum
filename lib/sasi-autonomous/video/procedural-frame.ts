"use client";
type SceneLike={id?:string;text?:string;place?:string;character?:string};
function hash(s:string){let x=2166136261>>>0;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0;}return x>>>0}
function rnd(seed:number,i:number){let x=(seed+Math.imul(i+1,2654435761))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967295}
function motif(s:string){const p=s.toLowerCase();if(/星|宇宙|space|galaxy|moon|planet/.test(p))return"space";if(/海|ocean|sea|water|湖/.test(p))return"ocean";if(/森林|树|forest|mountain|山/.test(p))return"forest";if(/城市|街|city|地铁|station|building/.test(p))return"city";if(/房间|室内|office|home|studio/.test(p))return"interior";return"abstract"}
export function drawProceduralSceneBackground(ctx:CanvasRenderingContext2D,width:number,height:number,scene:SceneLike,progress:number){
 const seed=hash(`${scene.id||""}|${scene.place||""}|${scene.text||""}`),kind=motif(`${scene.place||""} ${scene.text||""}`),hue=seed%360;
 const g=ctx.createLinearGradient(0,0,width,height);g.addColorStop(0,`hsl(${hue} 28% 12%)`);g.addColorStop(1,`hsl(${(hue+34)%360} 34% 5%)`);ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
 ctx.save();
 if(kind==="space"){for(let i=0;i<70;i++){ctx.globalAlpha=.25+rnd(seed,i)*.6;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(rnd(seed,i+80)*width,rnd(seed,i+150)*height*.72,1+rnd(seed,i+220)*2.5,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=.8;ctx.fillStyle=`hsl(${(hue+50)%360} 55% 62%)`;ctx.beginPath();ctx.arc(width*.72,height*.28,Math.min(width,height)*.12,0,Math.PI*2);ctx.fill()}
 else if(kind==="city"){const base=height*.7;for(let i=0;i<13;i++){const bw=width*(.04+rnd(seed,i)*.07),bh=height*(.15+rnd(seed,i+20)*.34),x=i*width/12-bw*.5;ctx.globalAlpha=i%3===0?.28:.14;ctx.fillStyle=i%3===0?`hsl(${(hue+45)%360} 70% 65%)`:"#d7e2f1";ctx.fillRect(x,base-bh,bw,bh)}}
 else if(kind==="ocean"){ctx.strokeStyle=`hsla(${(hue+70)%360},75%,75%,.28)`;ctx.lineWidth=Math.max(2,width*.004);for(let i=0;i<6;i++){ctx.beginPath();const y=height*(.4+i*.075);for(let x=0;x<=width;x+=20){const yy=y+Math.sin(x/80+progress*Math.PI*2+i)*height*.018;if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)}ctx.stroke()}}
 else if(kind==="forest"){for(let i=0;i<12;i++){const x=i*width/11,th=height*(.18+rnd(seed,i)*.36),tw=width*(.04+rnd(seed,i+20)*.045);ctx.globalAlpha=i%3===0?.24:.13;ctx.fillStyle=i%3===0?`hsl(${(hue+80)%360} 38% 56%)`:"#dfe6d8";ctx.beginPath();ctx.moveTo(x,height*.7-th);ctx.lineTo(x-tw,height*.7);ctx.lineTo(x+tw,height*.7);ctx.closePath();ctx.fill()}}
 else{for(let i=0;i<8;i++){ctx.globalAlpha=.06+rnd(seed,i+50)*.12;ctx.fillStyle=i%2?`hsl(${(hue+45)%360} 68% 65%)`:"#fff";ctx.beginPath();ctx.arc(rnd(seed,i)*width,rnd(seed,i+20)*height*.7,Math.min(width,height)*(.07+rnd(seed,i+40)*.16),0,Math.PI*2);ctx.fill()}}
 ctx.restore();ctx.globalAlpha=1;
}
