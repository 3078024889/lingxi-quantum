import {ADVANCED_TOOLS} from '../advanced-catalog';
import {getTool} from '../registry';

const localAdvanced=new Set(
 ADVANCED_TOOLS.filter(tool=>tool.localOnly).map(tool=>tool.href.slice('/tools/'.length))
);

// These workbenches run Whisper entirely in the browser.
const localTranscription=new Set(["audio-transcription","video-transcription"]);

export function isFreeTranslationAcceptanceTool(slug:string):boolean {
 return process.env.NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE==="true" &&
  (slug==="document-translate"||slug==="subtitle-translate"||slug==="image-translator");
}

/** Only browser-local processing joins the unrestricted acceptance run here. */
export function isFreeLocalAcceptanceTool(slug:string):boolean {
 if(process.env.NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE!=="true")return false;
 if(localTranscription.has(slug))return true;
 const tool=getTool(slug);
 if(tool)return tool.status==="live"&&tool.localOnly===true;
 return localAdvanced.has(slug);
}
