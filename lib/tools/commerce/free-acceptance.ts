import {ADVANCED_TOOLS} from '../advanced-catalog';
import {getTool} from '../registry';

const localAdvanced=new Set(
 ADVANCED_TOOLS.filter(tool=>tool.localOnly).map(tool=>tool.href.slice('/tools/'.length))
);

/** Only browser-local processing joins the unrestricted acceptance run here. */
export function isFreeLocalAcceptanceTool(slug:string):boolean {
 if(process.env.NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE!=="true")return false;
 const tool=getTool(slug);
 if(tool)return tool.status==="live"&&tool.localOnly===true;
 return localAdvanced.has(slug);
}
