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

export type GrowthToolEvent={
 session_id:string|null;tool_id:string;event_type:string;
 metadata:Record<string,unknown>|null;created_at:string;
};
export type GrowthToolChannel={
 source:string;campaign:string;partner:string;views:number;sessions:number;
 toolOpens:number;starts:number;completed:number;failed:number;exports:number;
 openedSessions:number;startedSessions:number;completedSessions:number;
 completionRate:number;taskSuccessRate:number;
};
export type GrowthToolFunnel={
 toolEventsTotal:number;toolEventsAnalyzed:number;toolEventsTruncated:boolean;
 toolOpens:number;toolStarts:number;toolCompletions:number;toolFailures:number;
 completedSessions:number;toolFunnelChannels:GrowthToolChannel[];
};
const safeAttribution=(value:unknown)=>typeof value==="string"&&/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(value)?value.toLowerCase():null;

/**
 * Joins anonymous tool events to public pageview sessions using the shared,
 * daily host-scoped SHA-256 session hash. It reports sessions, not people,
 * and process completions, not payments or revenue.
 */
export function summarizeGrowthToolFunnel(
 visits:readonly GrowthVisit[],events:readonly GrowthToolEvent[],totalRecorded:number
):GrowthToolFunnel{
 type Group={
  source:string;campaign:string;partner:string;views:number;sessions:Set<string>;
  toolOpens:number;starts:number;completed:number;failed:number;exports:number;
  opened:Set<string>;started:Set<string>;completedSet:Set<string>;
 };
 const groups=new Map<string,Group>(),sessionGroup=new Map<string,string>();
 const keyOf=(source:string,campaign:string,partner:string)=>JSON.stringify([source,campaign,partner]);
 const ensure=(key:string,source:string,campaign:string,partner:string)=>{
  let g=groups.get(key);
  if(!g){g={source,campaign,partner,views:0,sessions:new Set(),toolOpens:0,starts:0,completed:0,failed:0,exports:0,opened:new Set(),started:new Set(),completedSet:new Set()};groups.set(key,g)}
  return g;
 };
 for(const visit of visits){
  const source=visit.utm_source||visit.referrer_host||"direct_or_unattributed";
  const campaign=visit.utm_source?visit.utm_campaign||"not_set":"—";
  const partner=visit.utm_source?visit.utm_content||"not_set":"—";
  const key=keyOf(source,campaign,partner),g=ensure(key,source,campaign,partner);
  g.views++;
  if(visit.session_hash){g.sessions.add(visit.session_hash);if(!sessionGroup.has(visit.session_hash))sessionGroup.set(visit.session_hash,key)}
 }
 for(const event of events){
  const meta=event.metadata||{};
  const fallbackSource=safeAttribution(meta.utm_source)||"unknown_source";
  const fallbackCampaign=safeAttribution(meta.utm_campaign)||"not_set";
  const fallbackPartner=safeAttribution(meta.utm_content)||"not_set";
  const key=event.session_id&&sessionGroup.get(event.session_id)||keyOf(fallbackSource,fallbackCampaign,fallbackPartner);
  const g=groups.get(key)||ensure(key,fallbackSource,fallbackCampaign,fallbackPartner);
  const session=event.session_id||"";
  if(session)g.sessions.add(session);
  switch(event.event_type){
   case "tool_open":g.toolOpens++;if(session)g.opened.add(session);break;
   case "process_started":g.starts++;if(session)g.started.add(session);break;
   case "process_completed":g.completed++;if(session)g.completedSet.add(session);break;
   case "process_failed":g.failed++;break;
   case "export_clicked":g.exports++;break;
  }
 }
 const allChannels=[...groups.values()].map(g=>({
  source:g.source,campaign:g.campaign,partner:g.partner,views:g.views,sessions:g.sessions.size,
  toolOpens:g.toolOpens,starts:g.starts,completed:g.completed,failed:g.failed,exports:g.exports,
  openedSessions:g.opened.size,startedSessions:g.started.size,completedSessions:g.completedSet.size,
  completionRate:g.sessions.size?g.completedSet.size/g.sessions.size*100:0,
  taskSuccessRate:g.starts?g.completed/g.starts*100:0
 })).sort((a,b)=>b.completedSessions-a.completedSessions||b.sessions-a.sessions||a.source.localeCompare(b.source));
 const channels=allChannels.slice(0,25);
 const sum=(key:"toolOpens"|"starts"|"completed"|"failed")=>allChannels.reduce((total,item)=>total+item[key],0);
 const completedSessions=new Set<string>();
 for(const event of events)if(event.event_type==="process_completed"&&event.session_id)completedSessions.add(event.session_id);
 return {
  toolEventsTotal:Math.max(events.length,Number.isFinite(totalRecorded)?totalRecorded:events.length),
  toolEventsAnalyzed:events.length,toolEventsTruncated:totalRecorded>events.length,
  toolOpens:sum("toolOpens"),toolStarts:sum("starts"),toolCompletions:sum("completed"),toolFailures:sum("failed"),
  completedSessions:completedSessions.size,toolFunnelChannels:channels
 };
}
