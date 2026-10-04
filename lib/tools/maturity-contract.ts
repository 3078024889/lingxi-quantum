export type ToolMaturityLevel="thin"|"practical"|"professional";
export type ToolMaturityContract={
  slug:string;
  level:ToolMaturityLevel;
  mustHave:string[];
  notes:string;
};

export const TOOL_MATURITY_CONTRACTS:ToolMaturityContract[]=[
 {slug:"resize-image",level:"professional",mustHave:["aspect-ratio","smart-crop","manual-focus","contain","batch","multi-format"],notes:"Ratio/preset/pixel resize with smart crop and manual fallback."},
 {slug:"long-image",level:"professional",mustHave:["vertical","horizontal","reorder","align","background","multi-format"],notes:"Stitch screenshots or images in either direction."},
 {slug:"video-toolkit",level:"professional",mustHave:["compress","trim","extract-audio","mute","rotate","speed","resolution","fps"],notes:"Common local video jobs in one workbench."},
 {slug:"subtitle-tools",level:"professional",mustHave:["parse","shift","scale","fps-correct","rebuild-index","srt","vtt","txt"],notes:"Timeline-safe subtitle repair and conversion."},
 {slug:"privacy-cleaner",level:"professional",mustHave:["scan","risk-summary","batch-clean","image-metadata","pdf-metadata"],notes:"Show risk before destructive cleaning."},
 {slug:"screenshot-redact",level:"professional",mustHave:["blur","black","pixelate","undo","remove-box","permanent-export"],notes:"Local permanent screenshot redaction."},
 {slug:"id-photo-ai",level:"professional",mustHave:["preset","background","position","zoom","preview","hd-export","resume"],notes:"Real browser photo preparation and paid HD export."},
 {slug:"video-dubbing",level:"professional",mustHave:["transcribe","translate","tts","mux","subtitle-export","resume"],notes:"Real dubbed MP4 + translated subtitle export; no lip-sync claim."},
 {slug:"video-translate",level:"professional",mustHave:["batch","remote-link","transcribe","translate","soft-subtitle-mp4","srt","vtt","txt","optional-dub","minute-billing"],notes:"Batch video translation with public-link import, timed subtitles, optional AI dubbing and high-quality MP4 export."},
];

export function toolMaturity(slug:string){return TOOL_MATURITY_CONTRACTS.find(x=>x.slug===slug)??null}
