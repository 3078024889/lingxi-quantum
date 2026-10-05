export type SasiArtifactKind="website"|"video"|"script"|"storyboard"|"document"|"dataset"|"code"|"source";
export type SasiArtifactVersion={
 artifactId:string;
 versionId:string;
 parentVersionId:string|null;
 kind:SasiArtifactKind;
 runId:string;
 turnId:string;
 projectId:string|null;
 contentRef:string;
 checksum:string;
 createdAt:string;
};
export type SasiArtifactAction="create"|"revise"|"restore"|"branch";

export function artifactLineageKey(v:SasiArtifactVersion){
 return `${v.artifactId}:${v.versionId}`;
}
