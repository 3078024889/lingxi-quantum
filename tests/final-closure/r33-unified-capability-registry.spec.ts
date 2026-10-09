import{test,expect}from"playwright/test";
import{TOOLS}from"../../lib/tools/registry";
import{LINGXIFIELD_PUBLIC_TOOL_REGISTRY}from"../../lib/tools/platform/tool-registry";
import{SASI_SKILLS}from"../../lib/sasi/skills/catalog";
import{getLingxiCapability,listLingxiCapabilities,sasiCapabilityId,toolCapabilityId}from"../../lib/platform/capability-registry";

test("every registered tool and SASI skill has exactly one unified capability id",()=>{
 const tools=listLingxiCapabilities("tool"),skills=listLingxiCapabilities("sasi-skill");
 expect(tools).toHaveLength(LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length);
 expect(skills).toHaveLength(Object.keys(SASI_SKILLS).length);
 expect(new Set([...tools,...skills].map(x=>x.id)).size).toBe(tools.length+skills.length);
 for(const tool of LINGXIFIELD_PUBLIC_TOOL_REGISTRY){
  const row=getLingxiCapability(toolCapabilityId(tool.slug));
  expect(row?.route).toBe("/tools/"+tool.slug);
  expect(row?.metadata?.contractVersion).toBe(tool.contractVersion);
 }
 for(const tool of TOOLS){
  const row=getLingxiCapability(toolCapabilityId(tool.slug));
  if(row)expect(row.status).toBe(tool.status);
 }
 for(const id of Object.keys(SASI_SKILLS) as Array<keyof typeof SASI_SKILLS>){
  expect(getLingxiCapability(sasiCapabilityId(id))?.kind).toBe("sasi-skill");
 }
});
