export type ExportPlan={sourcePageCount:number;pages:number[];quantity:number;normalized:string;valid:boolean;error?:string};

export function createExportPlan(input:string,sourcePageCount:number):ExportPlan{
 const max=Math.max(0,Math.floor(sourcePageCount));
 if(max<=0)return{sourcePageCount:0,pages:[],quantity:0,normalized:"",valid:false,error:"NO_PAGES"};
 const raw=input.trim();
 if(!raw){const pages=Array.from({length:max},(_,i)=>i+1);return{sourcePageCount:max,pages,quantity:pages.length,normalized:`1-${max}`,valid:true};}
 const out=new Set<number>();
 for(const token0 of raw.split(",")){
  const token=token0.trim();if(!token)continue;
  if(/^\d+$/.test(token)){
   const n=Number(token);if(n<1||n>max)return{sourcePageCount:max,pages:[],quantity:0,normalized:raw,valid:false,error:"PAGE_OUT_OF_RANGE"};
   out.add(n);continue;
  }
  const m=token.match(/^(\d+)\s*-\s*(\d+)$/);if(!m)return{sourcePageCount:max,pages:[],quantity:0,normalized:raw,valid:false,error:"INVALID_PAGE_RANGE"};
  const a=Number(m[1]),b=Number(m[2]);if(a<1||b<1||a>max||b>max||b<a)return{sourcePageCount:max,pages:[],quantity:0,normalized:raw,valid:false,error:"INVALID_PAGE_RANGE"};
  for(let n=a;n<=b;n++)out.add(n);
 }
 const pages=[...out].sort((a,b)=>a-b);if(!pages.length)return{sourcePageCount:max,pages:[],quantity:0,normalized:raw,valid:false,error:"NO_SELECTED_PAGES"};
 return{sourcePageCount:max,pages,quantity:pages.length,normalized:pages.join(","),valid:true};
}
