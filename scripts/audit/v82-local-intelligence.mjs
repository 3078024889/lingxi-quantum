import fs from "node:fs";

const must=(value,message)=>{if(!value)throw new Error(message)};
const publicCopyFiles=[
 "lib/sasi/browser/local-ui-copy.ts",
 "lib/public-feature-copy.ts",
 "lib/footer-catalog-copy.ts",
 "lib/sasi/function-menu-i18n.ts",
 "lib/sasi/browser/user-resource-ui-copy.ts",
];
const banned=[
 "WebGPU","Provider","Runtime","Gateway","Worker","BYOK","API Key","Token","Route",
 "模型供应商","运行时","网关","令牌","路由"
];

for(const file of publicCopyFiles){
 const source=fs.readFileSync(file,"utf8");
 for(const word of banned)must(!source.includes(word),`V82_ENGINEERING_COPY_VISIBLE:${file}:${word}`);
}

const local=fs.readFileSync("lib/sasi/browser/local-text.ts","utf8");
const prompt=fs.readFileSync("components/SasiPromptConversation.tsx","utf8");
const action=fs.readFileSync("components/SasiLocalIntelligenceAction.tsx","utf8");
const userResource=fs.readFileSync("lib/sasi/browser/user-resource-text.ts","utf8");
const userAction=fs.readFileSync("components/SasiUserResourceAction.tsx","utf8");

must(local.includes('status!=="available"'),"V82_LOCAL_FAST_PATH_MUST_NOT_AUTO_DOWNLOAD");
must(local.includes("prepareBrowserLocalText"),"V82_LOCAL_EXPLICIT_PREP_MISSING");
must(action.includes("prepareBrowserLocalText"),"V82_LOCAL_OPTIN_ACTION_MISSING");
must(prompt.includes("SasiLocalIntelligenceAction"),"V82_LOCAL_OPTIN_NOT_WIRED");
must(prompt.includes("tryBrowserLocalText"),"V82_LOCAL_FAST_PATH_NOT_WIRED");
must(userResource.includes("https://js.puter.com/v2/"),"V82_USER_RESOURCE_SCRIPT_MISSING");
must(userResource.includes("localStorage.setItem"),"V82_USER_RESOURCE_OPTIN_PERSISTENCE_MISSING");
must(userAction.includes("connectUserResource"),"V82_USER_RESOURCE_ACTION_MISSING");
must(prompt.includes("tryUserResourceText"),"V82_USER_RESOURCE_FALLBACK_NOT_WIRED");
must(prompt.indexOf("tryUserResourceText")<prompt.indexOf("fetch('/api/sasi/experience/text'"),"V82_USER_RESOURCE_MUST_PRECEDE_SHARED_POOL");

console.log("V82_LOCAL_INTELLIGENCE_EXPLICIT_OPTIN=PASS");
console.log("V82_LOCAL_INTELLIGENCE_NO_AUTO_DOWNLOAD=PASS");
console.log("V82_ENGINEERING_COPY_VISIBLE=0");
console.log("V82_USER_FUNDED_RESOURCE=PASS");
console.log("LINGXIFIELD_V82_LOCAL_INTELLIGENCE_AUDIT=PASS");
