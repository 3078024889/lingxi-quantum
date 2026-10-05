import fs from "node:fs";
import path from "node:path";

const root=process.argv[2]||process.cwd();
const file=path.join(root,"components/tools/ToolsHubV11.tsx");
let s=fs.readFileSync(file,"utf8");

function mustReplace(from,to,label){
  if(!s.includes(from))throw new Error(`TOOL_SURFACE_PATCH_DRIFT:${label}`);
  s=s.replace(from,to);
}

mustReplace(
'import { liveTools } from "@/lib/tools/registry";',
'import {publicToolSurface} from "@/lib/tools/public-surface";',
"import"
);

mustReplace(
`function allTools(): ToolItem[] {
  const registryItems: ToolItem[] = liveTools().map((tool) => ({
    href: \`/tools/\${tool.slug}\`,
    titleZh: tool.titleZh,
    titleEn: tool.titleEn,
    descZh: tool.oneLinerZh,
    descEn: tool.oneLinerEn,
    kind: registryKind(tool.category),
    category: registryCategory(tool.category),
    localOnly: Boolean(tool.localOnly),
  }));
  const map = new Map<string, ToolItem>();
  for (const item of registryItems) map.set(item.href, item);
  for (const item of dedicated) map.set(item.href, item);
  if(process.env.NEXT_PUBLIC_PRIVACY_TOOLS_ENABLED==="true"){
    for(const item of privacyInfrastructureTools) map.set(item.href,item);
  }
  return [...map.values()];
}`,
`function allTools(): ToolItem[] {
  const map = new Map<string, ToolItem>();

  for(const tool of publicToolSurface()){
    map.set(tool.href,{
      href:tool.href,
      titleZh:tool.titleZh,
      titleEn:tool.titleEn,
      descZh:tool.descZh,
      descEn:tool.descEn,
      kind:tool.kind,
      category:tool.category==="pdf"?"pdf":tool.category==="image"?"image":tool.category==="media"||tool.category==="subtitle"?"media":tool.category==="privacy"?"privacy":tool.category==="recognition"?"qr":"utility",
      localOnly:tool.localOnly,
    });
  }

  // Preserve legacy dedicated cards only as compatibility fallbacks. The unified
  // public surface wins for every duplicate href.
  for(const item of dedicated) if(!map.has(item.href)) map.set(item.href,item);

  if(process.env.NEXT_PUBLIC_PRIVACY_TOOLS_ENABLED==="true"){
    for(const item of privacyInfrastructureTools) map.set(item.href,item);
  }
  return [...map.values()];
}`,
"allTools"
);

fs.writeFileSync(file,s);
console.log("TOOLS_HUB_UNIFIED_SURFACE_PATCH=PASS");
