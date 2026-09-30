export const NEVER_BLIND_DELETE=["supabase/migrations","orders","ledger","payment","withdrawal","user-assets","production-evidence"] as const;
export function deletionAllowed(path:string,references:number,generated:boolean){const p=path.replace(/\\/g,"/").toLowerCase();if(NEVER_BLIND_DELETE.some(x=>p.includes(x)))return false;return generated&&references===0}
