export function seriesProgressState(readyEpisodes:number,totalEpisodes:number,runs:Array<{state:string;output_json?:unknown}>):'ready'|'planning'|'needs-connection'|'failed'{
 if(readyEpisodes===totalEpisodes)return 'ready';
 // One blocked episode does not mean the other queued episodes have finished.
 if(runs.some(run=>['created','queued','running','waiting'].includes(run.state)))return 'planning';
 if(runs.some(run=>(run.output_json as {state?:string}|null)?.state==='needs-connection'))return 'needs-connection';
 if(runs.some(run=>['failed','cancelled','expired'].includes(run.state))||runs.length>=totalEpisodes)return 'failed';
 return 'planning';
}
