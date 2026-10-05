import fs from "node:fs";
import path from "node:path";

const root=process.argv[2]||process.cwd();
const file=path.join(root,"components/tools/ToolsHubV11.tsx");
let s=fs.readFileSync(file,"utf8");

if(!s.includes('import {publicToolSurface} from "@/lib/tools/public-surface";')){
  if(!s.includes('import { liveTools } from "@/lib/tools/registry";')){
    throw new Error("TOOL_SURFACE_IMPORT_DRIFT");
  }
  s=s.replace(
    'import { liveTools } from "@/lib/tools/registry";',
    'import {publicToolSurface} from "@/lib/tools/public-surface";'
  );
}

const newAllTools=`function allTools(): ToolItem[] {
  const map = new Map<string, ToolItem>();

  for(const tool of publicToolSurface()){
    map.set(tool.href,{
      href:tool.href,
      titleZh:tool.titleZh,
      titleEn:tool.titleEn,
      descZh:tool.descZh,
      descEn:tool.descEn,
      kind:tool.kind,
      category:
        tool.category==="pdf"?"pdf":
        tool.category==="image"?"image":
        tool.category==="media"||tool.category==="subtitle"?"media":
        tool.category==="privacy"?"privacy":
        tool.category==="recognition"?"qr":
        "utility",
      localOnly:tool.localOnly,
    });
  }

  for(const item of dedicated){
    if(!map.has(item.href))map.set(item.href,item);
  }

  if(process.env.NEXT_PUBLIC_PRIVACY_TOOLS_ENABLED==="true"){
    for(const item of privacyInfrastructureTools)map.set(item.href,item);
  }
  return [...map.values()];
}`;

const start=s.indexOf("function allTools(): ToolItem[] {");
const endMarker='\n\nconst categories: Category[]';
const end=s.indexOf(endMarker,start);
if(start<0||end<0)throw new Error("TOOL_SURFACE_ALLTOOLS_BOUNDARY_DRIFT");

s=s.slice(0,start)+newAllTools+s.slice(end);

fs.writeFileSync(file,s);
console.log("TOOLS_HUB_UNIFIED_SURFACE_PATCH=PASS");
