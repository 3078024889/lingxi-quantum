/**
 * C2PA validation-state adapter, independent of the browser SDK.
 * Official specification: Valid verifies cryptographic integrity; Trusted also
 * verifies signer trust. A signed file does not prove the depicted event is true.
 */
export type ProvenanceStatus="checking"|"trusted"|"valid"|"untrusted"|"invalid"|"absent"|"unavailable";
export type ProvenanceResult={status:ProvenanceStatus;issuer?:string;claim?:string;reason?:string};

const isObj=(input:unknown):input is Record<string,unknown>=>Boolean(input)&&typeof input==="object"&&!Array.isArray(input);
export function describeC2paManifest(store:unknown):ProvenanceResult{
 if(!isObj(store))return {status:"unavailable",reason:"INVALID_VERIFICATION_REPORT"};
 const manifests=isObj(store.manifests)?store.manifests:{};
 const active=typeof store.active_manifest==="string"?store.active_manifest:"";
 // A manifest-free result is not evidence that the source is human or AI.
 if(!active||!isObj(manifests[active]))return {status:"unavailable",reason:"MISSING_ACTIVE_MANIFEST"};
 const value=store.validation_state;
 const rawState=typeof value==="string"?value.toLowerCase():"";
 const details=manifests[active] as Record<string,unknown>;
 const sig=isObj(details.signature_info)?details.signature_info:{};
 const issuer=typeof sig.issuer==="string"?sig.issuer.slice(0,160):undefined;
 const claim=typeof details.title==="string"?details.title.slice(0,160):undefined;
 if(rawState==="trusted")return {status:"trusted",issuer,claim};
 // C2PA Valid = integrity verified, but signer trust not established.
 // Only Trusted confirms a trust-list chain; never show Valid as a trusted signer.
 if(rawState==="valid")return {status:"untrusted",issuer,claim};
 if(rawState==="invalid"){
  const validation=isObj(store.validation_results)?store.validation_results:{};
  const activeResults=isObj(validation.activeManifest)?validation.activeManifest:{};
  const failures=Array.isArray(activeResults.failure)?activeResults.failure.filter(isObj):[];
  const successes=Array.isArray(activeResults.success)?activeResults.success.filter(isObj):[];
  const signatureValidated=successes.some(item=>item.code==="claimSignature.validated");
  const trustOnly=failures.length>0&&failures.every(item=>typeof item.code==="string"&&
    (item.code==="signingCredential.untrusted"||item.code==="timeStamp.untrusted"));
  if(signatureValidated&&trustOnly)return {status:"untrusted",issuer,claim};
  return {status:"invalid",issuer,claim};
 }
 // An unrecognized or missing validation_state must never be marked valid.
 return {status:"unavailable",issuer,claim,reason:"VERIFICATION_STATE_UNAVAILABLE"};
}
