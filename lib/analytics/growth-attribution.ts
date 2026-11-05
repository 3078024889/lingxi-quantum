export type GrowthVisit={
 occurred_at:string;path:string;session_hash:string|null;utm_source:string|null;
 utm_campaign:string|null;utm_content:string|null;referrer_host:string|null;
};
export type GrowthChannel={
 source:string;campaign:string;partner:string;views:number;sessions:number;
 flaggedViews:number;
};
export type GrowthSnapshot={
 totalRecorded:number;analyzed:number;truncated:boolean;sampledSessions:number;
 attributedViews:number;attributedSessions:number;flaggedViews:number;
 flaggedMinutes:number;channels:GrowthChannel[];
};

/**
 * Heuristic review only. Clusters of many independent sessions scanning many
 * different pages in one minute deserve inspection; they are NOT proof of bots.
 * Never claim one session == one human or a pageview == a completed tool action.
 */
export function summarizeGrowthVisits(rows:readonly GrowthVisit[],totalRecorded:number):GrowthSnapshot{
 type Minute={views:number;sessions:Set<string>;paths:Set<string>};
 const minutes=new Map<string,Minute>();
 for(const r of rows){
  const epoch=Date.parse(r.occurred_at);
  if(!Number.isFinite(epoch))continue;
  const key=String(Math.floor(epoch/60000));
  const item=minutes.get(key)||{views:0,sessions:new Set<string>(),paths:new Set<string>()};
  item.views++;
  if(r.session_hash)item.sessions.add(r.session_hash);
  item.paths.add(r.path);
  minutes.set(key,item);
 }
 const suspect=new Set<string>();
 for(const [minute,m] of minutes){
  if(m.views>=25&&m.sessions.size>=15&&m.paths.size>=12)suspect.add(minute);
 }
 type Group={views:number;sessions:Set<string>;flaggedViews:number;source:string;campaign:string;partner:string};
 const groups=new Map<string,Group>();
 const uniqueSessions=new Set<string>(), attributedSessions=new Set<string>();
 let attributedViews=0,flaggedViews=0;
 for(const r of rows){
  const source=r.utm_source||r.referrer_host||"未知来源";
  const campaign=r.utm_source?r.utm_campaign||"未设置":"—";
  const partner=r.utm_source?r.utm_content||"未设置":"—";
  const key=JSON.stringify([source,campaign,partner]);
  let g=groups.get(key);
  if(!g){
   g={views:0,sessions:new Set(),flaggedViews:0,source,campaign,partner};
   groups.set(key,g);
  }
  g.views++;
  if(r.session_hash){uniqueSessions.add(r.session_hash);g.sessions.add(r.session_hash);}
  if(r.utm_source){attributedViews++;if(r.session_hash)attributedSessions.add(r.session_hash);}
  const epoch=Date.parse(r.occurred_at);
  if(Number.isFinite(epoch)&&suspect.has(String(Math.floor(epoch/60000)))){
   g.flaggedViews++;flaggedViews++;
  }
 }
 const channels=[...groups.values()]
  .map(g=>({source:g.source,campaign:g.campaign,partner:g.partner,
   views:g.views,sessions:g.sessions.size,flaggedViews:g.flaggedViews}))
  .sort((a,b)=>b.views-a.views||a.source.localeCompare(b.source)).slice(0,25);
 return {
  totalRecorded:Math.max(rows.length,Number.isFinite(totalRecorded)?totalRecorded:rows.length),
  analyzed:rows.length,truncated:totalRecorded>rows.length,
  sampledSessions:uniqueSessions.size,attributedViews,attributedSessions:attributedSessions.size,
  flaggedViews,flaggedMinutes:suspect.size,channels
 };
}
