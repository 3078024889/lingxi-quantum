"use client";

type SceneLike={
  id?:string;
  text?:string;
  place?:string;
  character?:string;
  mood?:string;
  action?:string;
  props?:string[];
};

function hash(s:string){
  let x=2166136261>>>0;
  for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}
  return x>>>0;
}
function rnd(seed:number,i:number){
  let x=(seed+Math.imul(i+1,2654435761))>>>0;
  x^=x<<13;x^=x>>>17;x^=x<<5;
  return(x>>>0)/4294967295;
}
function textOf(scene:SceneLike){
  return `${scene.place||""} ${scene.text||""} ${scene.action||""} ${(scene.props||[]).join(" ")}`.toLowerCase();
}
function motif(scene:SceneLike){
  const p=textOf(scene);
  if(/地铁|站台|车厢|subway|metro|station|train/.test(p))return"metro";
  if(/街|城市|city|urban|building|road/.test(p))return"city";
  if(/房间|室内|office|home|studio|酒店|教室|医院/.test(p))return"interior";
  if(/海|ocean|sea|water|湖/.test(p))return"ocean";
  if(/森林|树|forest|mountain|山/.test(p))return"forest";
  if(/星|宇宙|space|galaxy|moon|planet/.test(p))return"space";
  return"stage";
}

function person(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,alpha=.9,mirror=false){
  ctx.save();
  ctx.globalAlpha=alpha;
  if(mirror){ctx.translate(x*2,0);ctx.scale(-1,1)}
  ctx.fillStyle="rgba(22,24,29,.96)";
  ctx.beginPath();
  ctx.arc(x,y-scale*1.72,scale*.34,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x-scale*.44,y-scale*1.28);
  ctx.quadraticCurveTo(x,y-scale*1.52,x+scale*.44,y-scale*1.28);
  ctx.lineTo(x+scale*.58,y);
  ctx.lineTo(x-scale*.58,y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle="rgba(228,232,238,.16)";
  ctx.fillRect(x-scale*.48,y-scale*.98,scale*.96,scale*.08);
  ctx.restore();
}

function oldPhoto(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,rotation:number){
  ctx.save();
  ctx.translate(x,y);ctx.rotate(rotation);
  ctx.fillStyle="rgba(239,226,190,.95)";
  ctx.fillRect(-w/2,-h/2,w,h);
  ctx.fillStyle="rgba(71,61,48,.55)";
  ctx.fillRect(-w*.38,-h*.32,w*.76,h*.52);
  ctx.strokeStyle="rgba(56,45,32,.65)";
  ctx.lineWidth=Math.max(1,w*.025);
  ctx.strokeRect(-w/2,-h/2,w,h);
  ctx.restore();
}

function drawMetro(ctx:CanvasRenderingContext2D,w:number,h:number,scene:SceneLike,progress:number,seed:number){
  const horizon=h*.53;
  const platform=h*.72;

  const ceiling=ctx.createLinearGradient(0,0,0,h*.55);
  ceiling.addColorStop(0,"#11161d");ceiling.addColorStop(1,"#26303a");
  ctx.fillStyle=ceiling;ctx.fillRect(0,0,w,horizon);

  ctx.fillStyle="#3a4149";ctx.fillRect(0,horizon,w,h*.035);
  ctx.fillStyle="#20242a";ctx.fillRect(0,horizon+h*.035,w,h*.16);
  ctx.fillStyle="#777064";ctx.fillRect(0,platform,w,h*.018);
  ctx.fillStyle="#303137";ctx.fillRect(0,platform+h*.018,w,h-platform);

  ctx.strokeStyle="rgba(220,224,226,.24)";
  ctx.lineWidth=Math.max(2,w*.004);
  for(let i=0;i<8;i++){
    const x=i*w/7;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x*.72+w*.14,horizon);ctx.stroke();
  }

  for(let i=0;i<6;i++){
    const x=w*(.08+i*.17);
    ctx.fillStyle="rgba(235,242,238,.72)";
    ctx.fillRect(x,h*.08,w*.09,h*.012);
  }

  const p=textOf(scene);
  const trainOffset = /进站|驶来|列车|地铁/.test(p) ? (1-Math.min(1,progress))*w*.16 : 0;
  ctx.save();
  ctx.translate(trainOffset,0);
  ctx.fillStyle="#d5d7d8";ctx.fillRect(-w*.08,h*.34,w*1.02,h*.23);
  ctx.fillStyle="#1c2831";
  for(let i=0;i<7;i++)ctx.fillRect(w*(.02+i*.145),h*.385,w*.09,h*.095);
  ctx.fillStyle="#7e1f22";ctx.fillRect(-w*.08,h*.53,w*1.02,h*.018);
  ctx.restore();

  const subjectX=w*.28, otherX=w*.73, baseY=platform-h*.018;
  person(ctx,subjectX,baseY,Math.min(w,h)*.12,.95);
  if(/一模一样|另一个自己|对面|那个人|另一个人/.test(p)){
    person(ctx,otherX,baseY,Math.min(w,h)*.12,.86,true);
  } else {
    person(ctx,otherX,baseY,Math.min(w,h)*.105,.62);
  }

  ctx.fillStyle="rgba(242,197,91,.7)";
  ctx.fillRect(0,platform-h*.022,w,h*.008);

  if(/照片/.test(p)){
    oldPhoto(ctx,otherX+w*.035,baseY-h*.11,w*.09,h*.07,-.08);
  }

  if(/车门关闭|关门/.test(p)){
    ctx.strokeStyle="rgba(25,30,34,.8)";
    ctx.lineWidth=Math.max(6,w*.012);
    const closing=Math.max(0,Math.min(1,progress));
    const left=w*(.48-closing*.12), right=w*(.52+closing*.12);
    ctx.beginPath();ctx.moveTo(left,h*.34);ctx.lineTo(left,h*.57);ctx.stroke();
    ctx.beginPath();ctx.moveTo(right,h*.34);ctx.lineTo(right,h*.57);ctx.stroke();
  }
}

function drawInterior(ctx:CanvasRenderingContext2D,w:number,h:number,scene:SceneLike,progress:number,seed:number){
  ctx.fillStyle="#24262b";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#34363b";ctx.fillRect(w*.08,h*.14,w*.84,h*.55);
  ctx.fillStyle="#11151a";ctx.fillRect(w*.15,h*.22,w*.29,h*.27);
  ctx.fillStyle="rgba(119,151,177,.36)";ctx.fillRect(w*.17,h*.24,w*.25,h*.23);
  ctx.fillStyle="#5e5549";ctx.fillRect(w*.58,h*.47,w*.24,h*.035);
  ctx.fillRect(w*.61,h*.505,w*.018,h*.15);ctx.fillRect(w*.77,h*.505,w*.018,h*.15);
  person(ctx,w*.46,h*.72,Math.min(w,h)*.13,.94);
  if(/镜子|另一个自己|一模一样/.test(textOf(scene))){
    ctx.strokeStyle="rgba(215,220,224,.5)";ctx.lineWidth=Math.max(2,w*.004);
    ctx.strokeRect(w*.63,h*.2,w*.19,h*.25);
    person(ctx,w*.725,h*.445,Math.min(w,h)*.065,.55,true);
  }
}

function drawCity(ctx:CanvasRenderingContext2D,w:number,h:number,scene:SceneLike,progress:number,seed:number){
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#101725");g.addColorStop(1,"#202733");
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const base=h*.7;
  for(let i=0;i<13;i++){
    const bw=w*(.045+rnd(seed,i)*.06),bh=h*(.16+rnd(seed,i+20)*.35),x=i*w/12-bw*.45;
    ctx.fillStyle=i%3===0?"#303947":"#252d39";ctx.fillRect(x,base-bh,bw,bh);
    ctx.fillStyle="rgba(238,194,87,.38)";
    for(let r=0;r<3;r++)ctx.fillRect(x+bw*.2,base-bh+bh*(.18+r*.23),bw*.16,bh*.055);
  }
  ctx.fillStyle="#171a20";ctx.fillRect(0,base,w,h-base);
  ctx.strokeStyle="rgba(238,220,167,.36)";ctx.lineWidth=Math.max(2,w*.004);
  ctx.beginPath();ctx.moveTo(w*.46,base);ctx.lineTo(w*.35,h);ctx.stroke();
  ctx.beginPath();ctx.moveTo(w*.54,base);ctx.lineTo(w*.65,h);ctx.stroke();
  person(ctx,w*.52,h*.73,Math.min(w,h)*.11,.92);
}

function drawOcean(ctx:CanvasRenderingContext2D,w:number,h:number,progress:number,seed:number){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,"#122936");g.addColorStop(1,"#07141d");
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="rgba(173,218,226,.35)";ctx.lineWidth=Math.max(2,w*.004);
  for(let i=0;i<7;i++){
    ctx.beginPath();const y=h*(.42+i*.065);
    for(let x=0;x<=w;x+=18){
      const yy=y+Math.sin(x/70+progress*Math.PI*2+i)*h*.014;
      if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle="rgba(225,233,215,.18)";
  ctx.beginPath();ctx.moveTo(0,h*.45);ctx.lineTo(w*.28,h*.25);ctx.lineTo(w*.42,h*.45);ctx.fill();
}

function drawForest(ctx:CanvasRenderingContext2D,w:number,h:number,seed:number){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,"#17241f");g.addColorStop(1,"#0b110f");
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(let i=0;i<15;i++){
    const x=i*w/14,th=h*(.22+rnd(seed,i)*.4),tw=w*(.04+rnd(seed,i+20)*.035);
    ctx.fillStyle=i%3===0?"rgba(87,115,89,.75)":"rgba(48,68,54,.86)";
    ctx.beginPath();ctx.moveTo(x,h*.72-th);ctx.lineTo(x-tw,h*.72);ctx.lineTo(x+tw,h*.72);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle="#111713";ctx.fillRect(0,h*.72,w,h*.28);
  person(ctx,w*.53,h*.78,Math.min(w,h)*.1,.84);
}

function drawSpace(ctx:CanvasRenderingContext2D,w:number,h:number,seed:number){
  const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#060913");g.addColorStop(1,"#111327");
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(let i=0;i<80;i++){
    ctx.globalAlpha=.24+rnd(seed,i)*.7;ctx.fillStyle="#fff";
    ctx.beginPath();ctx.arc(rnd(seed,i+80)*w,rnd(seed,i+150)*h*.76,1+rnd(seed,i+220)*2.3,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.88;ctx.fillStyle="#c29c59";
  ctx.beginPath();ctx.arc(w*.72,h*.28,Math.min(w,h)*.12,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
}

function drawStage(ctx:CanvasRenderingContext2D,w:number,h:number,scene:SceneLike,seed:number){
  const g=ctx.createRadialGradient(w*.5,h*.42,10,w*.5,h*.42,Math.max(w,h)*.7);
  g.addColorStop(0,"#29303a");g.addColorStop(1,"#0c0f14");
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle="rgba(255,255,255,.08)";
  ctx.beginPath();ctx.ellipse(w*.5,h*.72,w*.24,h*.055,0,0,Math.PI*2);ctx.fill();
  person(ctx,w*.5,h*.72,Math.min(w,h)*.13,.92);
  if(/照片/.test(textOf(scene)))oldPhoto(ctx,w*.57,h*.54,w*.09,h*.07,-.1);
}

export function drawProceduralSceneBackground(
  ctx:CanvasRenderingContext2D,
  width:number,
  height:number,
  scene:SceneLike,
  progress:number,
){
  const seed=hash(`${scene.id||""}|${scene.place||""}|${scene.text||""}`);
  const kind=motif(scene);
  ctx.save();
  if(kind==="metro")drawMetro(ctx,width,height,scene,progress,seed);
  else if(kind==="city")drawCity(ctx,width,height,scene,progress,seed);
  else if(kind==="interior")drawInterior(ctx,width,height,scene,progress,seed);
  else if(kind==="ocean")drawOcean(ctx,width,height,progress,seed);
  else if(kind==="forest")drawForest(ctx,width,height,seed);
  else if(kind==="space")drawSpace(ctx,width,height,seed);
  else drawStage(ctx,width,height,scene,seed);

  const mood=scene.mood||"";
  if(mood==="悬疑"||mood==="压迫"){
    const vignette=ctx.createRadialGradient(width*.5,height*.48,Math.min(width,height)*.2,width*.5,height*.48,Math.max(width,height)*.72);
    vignette.addColorStop(0,"rgba(0,0,0,0)");
    vignette.addColorStop(1,"rgba(0,0,0,.52)");
    ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  }
  ctx.restore();
  ctx.globalAlpha=1;
}
