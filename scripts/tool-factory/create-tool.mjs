import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const genome=JSON.parse(fs.readFileSync(path.join(root,"lib/tools/platform/capability-genome.json"),"utf8"));
const known=new Set(genome.map(x=>x.id));
const [slug,...capabilities]=process.argv.slice(2);
if(!slug||!capabilities.length){
 console.error("Usage: node scripts/tool-factory/create-tool.mjs <slug> <capability...>");
 process.exit(2);
}
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error("INVALID_TOOL_SLUG");
for(const id of capabilities)if(!known.has(id))throw new Error(`UNKNOWN_CAPABILITY:${id}`);

const target=path.join(root,"tool-factory-output",slug);
if(fs.existsSync(target))throw new Error(`OUTPUT_EXISTS:${target}`);
fs.mkdirSync(target,{recursive:true});

const contract={
 slug,contractVersion:1,capabilities,
 inputs:["TODO"],outputs:["TODO"],
 privacyMode:"local-first",
 pricing:"free-unless-online-or-model-cost",
 locales:["zh","en","ja","ko","fr","de","es","pt","ar"],
 acceptance:["desktop","mobile","real-fixture","invalid-input","large-input","privacy-boundary"]
};
fs.writeFileSync(path.join(target,"tool-contract.json"),JSON.stringify(contract,null,2));

const page=`import AdvancedToolPage from "@/components/tools/AdvancedToolPage";

export default function Page(){
 return <AdvancedToolPage
  title="TODO: 用户能得到的结果"
  intro="TODO: 用结果描述，不展示内部能力名称。"
  note="TODO: 说明文件是在本地处理还是需要在线处理。"
 ><div>TODO: compose existing LINGXIFIELD capabilities</div></AdvancedToolPage>;
}
`;
fs.writeFileSync(path.join(target,"page.tsx"),page);
fs.writeFileSync(path.join(target,"README.md"),
`# 灵犀场 ${slug}

Generated from Capability Genome.

## Capabilities
${capabilities.map(x=>`- ${x}`).join("\n")}

## Before production
- replace all TODO user copy in 9 languages
- add real input/output fixture
- add mobile + desktop browser E2E
- add pricing only if online/model cost exists
- pass license firewall
- keep engineering names out of public UI
`);
console.log(`LINGXIFIELD_TOOL_FACTORY_OUTPUT=${target}`);
