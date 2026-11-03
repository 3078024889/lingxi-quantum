/** Media metadata arrives with missing or generic MIME types on some browsers. */
const VIDEO_EXTENSIONS=new Set(["mp4","mov","m4v","webm","mkv","avi"]);
const AUDIO_EXTENSIONS=new Set(["wav","mp3","m4a","aac","ogg","opus","flac","wma"]);
export function isLikelyVideoMediaFile(file:{name:string;type:string}):boolean{
 const mime=(file.type||"").toLowerCase();
 if(mime.startsWith("video/"))return true;
 if(mime.startsWith("audio/"))return false;
 const ext=String(file.name||"").split(/[\\/]/).pop()?.split(".").pop()?.toLowerCase()||"";
 return VIDEO_EXTENSIONS.has(ext);
}
export function safeMediaExtension(name:string):string{
 const ext=String(name||"").split(/[\\/]/).pop()?.split(".").pop()?.toLowerCase()||"";
 return VIDEO_EXTENSIONS.has(ext)||AUDIO_EXTENSIONS.has(ext)?ext:"bin";
}
