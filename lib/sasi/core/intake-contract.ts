export const SASI_INTAKE_EXTENSIONS=[
 ".txt",".md",".json",".jsonl",".csv",".tsv",".yaml",".yml",".xml",".html",".htm",
 ".pdf",".doc",".docx",".rtf",".ppt",".pptx",".xls",".xlsx",".ods",".epub",
 ".odt",".jpg",".jpeg",".png",".webp",".gif",".mp3",".wav",".m4a",".mp4",".mov",".webm",
 ".js",".jsx",".ts",".tsx",".css",".sql",".py",".java",".c",".cpp",".h",".hpp",".go",".rs",".zip"
] as const;

export const SASI_INTAKE_ACCEPT=SASI_INTAKE_EXTENSIONS.join(",");

export const SASI_INTAKE_LIMITS={
 maxFiles:30,
 maxFileBytes:30*1024*1024,
 maxBatchBytes:300*1024*1024,
} as const;

export type SasiIntakeKind="document"|"image"|"audio"|"video"|"code"|"archive"|"text"|"unknown";
export type SasiIntakeFileLike={name:string;type?:string;size?:number};

const DOCUMENT=new Set(["pdf","doc","docx","rtf","ppt","pptx","xls","xlsx","ods","epub","odt"]);
const IMAGE=new Set(["jpg","jpeg","png","webp","gif"]);
const AUDIO=new Set(["mp3","wav","m4a"]);
const VIDEO=new Set(["mp4","mov","webm"]);
const CODE=new Set(["js","jsx","ts","tsx","css","html","htm","sql","py","java","c","cpp","h","hpp","go","rs"]);
const TEXT=new Set(["txt","md","json","jsonl","csv","tsv","yaml","yml","xml"]);

function extension(name:string){return(name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||"")}
export function classifySasiIntakeFile(file:SasiIntakeFileLike):SasiIntakeKind{
 const ext=extension(file.name),type=(file.type||"").toLowerCase();
 if(DOCUMENT.has(ext)||type==="application/pdf")return"document";
 if(IMAGE.has(ext)||type.startsWith("image/"))return"image";
 if(AUDIO.has(ext)||type.startsWith("audio/"))return"audio";
 if(VIDEO.has(ext)||type.startsWith("video/"))return"video";
 if(CODE.has(ext))return"code";
 if(ext==="zip")return"archive";
 if(TEXT.has(ext)||type.startsWith("text/"))return"text";
 return"unknown";
}

export function sasiIntakeBatchBytes(files:ArrayLike<{size:number}>){
 let total=0;for(let i=0;i<files.length;i++)total+=Number(files[i]?.size||0);return total;
}
export function validateSasiIntakeBatch(files:ArrayLike<SasiIntakeFileLike>){
 const issues:string[]=[];
 if(files.length>SASI_INTAKE_LIMITS.maxFiles)issues.push("TOO_MANY_FILES");
 let total=0;
 for(let i=0;i<files.length;i++){
  const size=Number(files[i]?.size||0);total+=size;
  if(size>SASI_INTAKE_LIMITS.maxFileBytes)issues.push(`FILE_TOO_LARGE:${files[i]?.name||i}`);
  if(classifySasiIntakeFile(files[i]!)==="unknown")issues.push(`UNSUPPORTED_FILE:${files[i]?.name||i}`);
 }
 if(total>SASI_INTAKE_LIMITS.maxBatchBytes)issues.push("BATCH_TOO_LARGE");
 return{ok:issues.length===0,issues,totalBytes:total};
}
