/**
 * Explicit editorial release gate: a source observation is never publication approval.
 * A published row must be explicitly named in the manifest, even when a batch is ingested.
 * The manifest is the only count authority. No hard-coded 32/62 limits are allowed here.
 */
export type DirectoryPublicationManifest={
 schema:"lingxifield_siai_publication_manifest_v1";
 revision:string;
 policy:string;
 curatedIds:readonly string[];
 sourcePreviewIds:readonly string[];
};
export type DirectoryIdentity={id:string};
const ident=/^[a-z0-9][a-z0-9-]{1,79}$/;

function checkIds(ids:readonly string[],label:string){
 const seen=new Set<string>();
 for(const id of ids){
  if(typeof id!=="string"||!ident.test(id))throw Error("SIAI_PUBLIC_MANIFEST_INVALID_ID:"+label+":"+String(id));
  if(seen.has(id))throw Error("SIAI_PUBLIC_MANIFEST_DUPLICATE_ID:"+id);
  seen.add(id);
 }
 return seen;
}
export function assertSiaiPublicationManifest(
 manifest:DirectoryPublicationManifest,
 curated:readonly DirectoryIdentity[],
 preview:readonly DirectoryIdentity[]
):{curated:number;preview:number;total:number;revision:string}{
 if(manifest?.schema!=="lingxifield_siai_publication_manifest_v1"||
  typeof manifest.revision!=="string"||!manifest.revision||
  typeof manifest.policy!=="string"||!manifest.policy||
  !Array.isArray(manifest.curatedIds)||!Array.isArray(manifest.sourcePreviewIds))
  throw Error("SIAI_PUBLICATION_MANIFEST_INVALID");
 const expectedCurated=checkIds(manifest.curatedIds,"curated");
 const expectedPreview=checkIds(manifest.sourcePreviewIds,"preview");
 if(manifest.curatedIds.some(id=>expectedPreview.has(id)))
  throw Error("SIAI_PUBLICATION_MANIFEST_CROSS_TIER_DUPLICATE");
 const actualCurated=checkIds(curated.map(row=>row.id),"curated-actual");
 const actualPreview=checkIds(preview.map(row=>row.id),"preview-actual");
 const identical=(expected:Set<string>,actual:Set<string>)=>
  expected.size===actual.size&&[...expected].every(id=>actual.has(id));
 if(!identical(expectedCurated,actualCurated))throw Error("SIAI_CURATED_IDS_NOT_IN_EDITORIAL_MANIFEST");
 if(!identical(expectedPreview,actualPreview))throw Error("SIAI_PREVIEW_IDS_NOT_IN_EDITORIAL_MANIFEST");
 if([...actualCurated].some(id=>actualPreview.has(id)))throw Error("SIAI_PUBLICATION_ACTUAL_DUPLICATE");
 return {curated:actualCurated.size,preview:actualPreview.size,
  total:actualCurated.size+actualPreview.size,revision:manifest.revision};
}
