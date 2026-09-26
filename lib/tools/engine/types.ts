export type EnginePrivacy="local-browser"|"self-hosted"|"first-party-db"|"optional-external";
export type EngineLicenseRisk="allow"|"review"|"deny";
export type EngineDomain="image"|"pdf"|"document"|"media"|"vision"|"web"|"privacy"|"nutrition"|"search"|"utility";
export type RuntimeKind="browser"|"node-command"|"node-module"|"python"|"http-service"|"database";

export type LicenseProfile={
 codeLicense:string;modelLicense?:string|null;datasetLicense?:string|null;spdx?:string[];
 commercialUse:"allowed"|"review"|"denied";attributionRequired?:boolean;sourceDisclosure?:boolean;
 shareAlike?:boolean;networkCopyleft?:boolean;patentNotes?:string;redistributionNotes?:string;
 approvedRuntime?:string[];reviewedAt?:string;artifactSha256?:string;version?:string;commit?:string;
};

export type EngineDescriptor={
 id:string;label:string;domain:EngineDomain;privacy:EnginePrivacy;runtime:RuntimeKind;
 licenseRisk:EngineLicenseRisk;license:LicenseProfile;source:string;capabilities:string[];
 commandEnv?:string;defaultCommand?:string;versionArgs?:string[];notes?:string;
};

export type StageRequirement={capability:string;primary:string[];fallback?:string[];optional?:boolean;checks?:string[]};
export type ToolStage={id:string;label:string;requires:StageRequirement[];checks?:string[];parallelSafe?:boolean};
export type ToolEngineGraph={toolId:string;stages:ToolStage[];resultChecks:string[];externalOptional?:string[]};

export type EngineProbe={id:string;available:boolean;version?:string;reason?:string;latencyMs?:number;runtime?:RuntimeKind};
export type StageRoute={stageId:string;selected:Record<string,string>;missing:string[];degraded:boolean};
export type RoutedToolGraph={toolId:string;stages:StageRoute[];blocked:boolean;degraded:boolean;missing:string[];resultChecks:string[]};

export type EngineEstimate={cpu:"low"|"medium"|"high";memoryMB:number;gpuPreferred?:boolean;secondsPerUnit?:number;unit?:string};
export type EngineHealth={ok:boolean;engineId:string;version?:string;checkedAt:string;details?:Record<string,unknown>;reason?:string};
