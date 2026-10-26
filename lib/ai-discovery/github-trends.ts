import type {GitHubObservation} from "./github-observations";
import raw from "./github-history.json";
export const githubHistory:readonly GitHubObservation[]=raw;
export type GitHubTrend={repository:string;first:GitHubObservation;last:GitHubObservation;starDelta:number;forkDelta:number;elapsedHours:number};
export function calculateGithubTrends(records:readonly GitHubObservation[]):GitHubTrend[]{
 const groups=new Map<string,GitHubObservation[]>();
 for(const r of records){if(!Number.isSafeInteger(r.stars)||r.stars<0||!Number.isSafeInteger(r.forks)||r.forks<0||!Number.isFinite(Date.parse(r.observedAt)))continue;groups.set(r.repository,[...(groups.get(r.repository)||[]),r]);}
 const trends:GitHubTrend[]=[];
 for(const [repository,items] of groups){items.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt));const first=items[0],last=items[items.length-1],elapsedHours=(Date.parse(last.observedAt)-Date.parse(first.observedAt))/3600000;if(elapsedHours<=0)continue;trends.push({repository,first,last,starDelta:last.stars-first.stars,forkDelta:last.forks-first.forks,elapsedHours});}
 return trends.sort((a,b)=>a.repository.localeCompare(b.repository));
}
