import type {EngineKind} from "./contracts";export interface ToolCapabilityBinding{tool:string;engine:EngineKind;operation:string;localFirst:boolean}
export const CORE_BINDINGS:ToolCapabilityBinding[]=[
{tool:"pdf.merge",engine:"document",operation:"merge",localFirst:true},{tool:"pdf.split",engine:"document",operation:"split",localFirst:true},{tool:"pdf.compress",engine:"document",operation:"compress",localFirst:true},{tool:"pdf.sign",engine:"document",operation:"sign",localFirst:true},
{tool:"image.compress",engine:"image",operation:"compress",localFirst:true},{tool:"image.convert",engine:"image",operation:"convert",localFirst:true},{tool:"image.stitch",engine:"image",operation:"stitch",localFirst:true},
{tool:"video.transcribe",engine:"video",operation:"transcribe",localFirst:false},{tool:"video.subtitle.translate",engine:"video",operation:"subtitle.translate",localFirst:false},
{tool:"web.extract",engine:"web",operation:"extract",localFirst:true},{tool:"web.toMarkdown",engine:"web",operation:"toMarkdown",localFirst:true},
{tool:"nutrition.analyze",engine:"nutrition",operation:"analyze",localFirst:true},{tool:"website.create",engine:"website",operation:"create",localFirst:false}
];export function bindingFor(tool:string){return CORE_BINDINGS.find(x=>x.tool===tool)}
