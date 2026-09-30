export type PublishEvidence={buildOk:boolean;linksOk:boolean;responsiveOk:boolean;fakeActions:number;secrets:number;artifactFiles:number};
export function publishGate(e:PublishEvidence){
 const reasons:string[]=[];
 if(!e.buildOk)reasons.push("BUILD_FAILED");
 if(!e.linksOk)reasons.push("BROKEN_LINKS");
 if(!e.responsiveOk)reasons.push("RESPONSIVE_NOT_VERIFIED");
 if(e.fakeActions)reasons.push("FAKE_ACTIONS");
 if(e.secrets)reasons.push("SECRET_FINDINGS");
 if(e.artifactFiles<1)reasons.push("NO_ARTIFACT");
 return{ready:reasons.length===0,reasons};
}
