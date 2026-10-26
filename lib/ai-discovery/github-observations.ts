import records from "./github-observations.json";
export type GitHubObservation={slug:string;repository:string;stars:number;forks:number;archived:boolean;observedAt:string;sourceUrl:string;metricDefinition:string;sourceType:string;reviewStatus:string};
export const githubObservations:readonly GitHubObservation[]=records;
export const githubStarsSorted=[...githubObservations].sort((a,b)=>b.stars-a.stars);
