/** Conservative source-code reuse gate. Metadata is evidence, never legal authorization. */
const REPO=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const PERMISSIVE=new Set(["MIT","Apache-2.0","BSD-2-Clause","BSD-3-Clause","ISC","0BSD"]);
export function reviewReuseCandidate(record){
 if(!record||typeof record!=="object"||!REPO.test(record.repository||""))throw Error("Invalid repository");
 if(record.sourceUrl!=="https://github.com/"+record.repository)throw Error("Source URL mismatch");
 const license=typeof record.spdxId==="string"?record.spdxId.trim():"";
 const verified=record.licenseSource==="github_api"&&Number.isFinite(Date.parse(record.checkedAt||""));
 const status=record.archived===true?"archived":record.archived===false?"active":"unknown";
 const flags=[];
 if(!verified)flags.push("license_unverified");
 if(!license||license==="NOASSERTION"||license==="OTHER")flags.push("license_unknown");
 if(license&&!PERMISSIVE.has(license))flags.push("license_requires_review");
 if(status!=="active")flags.push("maintenance_requires_review");
 if(record.modelWeights===true)flags.push("model_weights_separate_license");
 if(record.brandAssets===true)flags.push("brand_assets_separate_rights");
 return {repository:record.repository,spdxId:license||null,sourceUrl:record.sourceUrl,checkedAt:verified?record.checkedAt:null,status,flags,passesPreliminaryScreen:flags.length===0,canAutoImport:false,requiresHumanReview:true};
}
