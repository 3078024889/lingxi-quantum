import{SASI_INTAKE_ACCEPT,SASI_INTAKE_EXTENSIONS}from"@/lib/sasi/core/intake-contract";
export type SasiMode="drama"|"website"|"book"|"learning"|"research";

export const SASI_UNIFIED_EXTENSIONS=SASI_INTAKE_EXTENSIONS;
export const SASI_UNIFIED_ACCEPT=SASI_INTAKE_ACCEPT;

export type SasiConversationRow={question:string;answer:string};
