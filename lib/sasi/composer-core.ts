export type SasiMode="drama"|"website"|"book"|"learning"|"research";

export const SASI_UNIFIED_EXTENSIONS=[
 ".txt",".md",".json",".csv",".yaml",".yml",".pdf",".docx",".pptx",".xlsx",".epub",".odt",".rtf",
 ".jpg",".jpeg",".png",".webp",".gif",".mp3",".wav",".m4a",".mp4",".mov",".webm",
 ".js",".jsx",".ts",".tsx",".css",".html",".sql",".py",".zip"
] as const;

export const SASI_UNIFIED_ACCEPT=SASI_UNIFIED_EXTENSIONS.join(",");

export type SasiConversationRow={question:string;answer:string};
