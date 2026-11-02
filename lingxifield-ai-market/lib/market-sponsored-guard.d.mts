export type SponsoredRecord={project_id:string;label:string;target_url:string;placement:string;ends_at:string};
export function visibleSponsored(rows:SponsoredRecord[],allowedIds:string[],now?:Date):{projectId:string;label:string;targetUrl:string;sponsored:true}[];
