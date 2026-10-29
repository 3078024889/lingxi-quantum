/** Pure, fail-closed sponsorship workflow. No payment requests or database mutations. */
export const STATES=Object.freeze(["inquiry","review","approved","rejected","expired"]);
const TRANSITIONS=Object.freeze({inquiry:["review","rejected"],review:["approved","rejected"],approved:["expired"],rejected:[],expired:[]});
export function transitionSponsorship(record,next,{actor,at,reason}={}){
 if(!record||!STATES.includes(record.status)||!STATES.includes(next))throw Error("INVALID_SPONSORSHIP_STATE");
 if(!TRANSITIONS[record.status].includes(next))throw Error("SPONSORSHIP_TRANSITION_DENIED");
 if(typeof actor!=="string"||actor.trim().length<2||typeof reason!=="string"||reason.trim().length<5)throw Error("AUDIT_METADATA_REQUIRED");
 if(typeof at!=="string"||!Number.isFinite(Date.parse(at)))throw Error("INVALID_AUDIT_TIMESTAMP");
 if(next==="approved"&&(!record.verified_payment_id||!record.disclosure_label||!record.starts_at||!record.ends_at))throw Error("PAID_PLACEMENT_REQUIREMENTS_MISSING");
 if(next==="approved"&&Date.parse(record.starts_at)>=Date.parse(record.ends_at))throw Error("INVALID_PLACEMENT_WINDOW");
 return {...record,status:next,audit:[...(Array.isArray(record.audit)?record.audit:[]),{from:record.status,to:next,actor:actor.trim(),at,reason:reason.trim()}]};
}
export function canDisplaySponsorship(record,now){
 const t=Date.parse(now);
 return !!record&&record.status==="approved"&&!!record.verified_payment_id&&record.disclosure_label==="Sponsored"&&Number.isFinite(t)&&Number.isFinite(Date.parse(record.starts_at))&&Number.isFinite(Date.parse(record.ends_at))&&t>=Date.parse(record.starts_at)&&t<Date.parse(record.ends_at);
}
