import fs from"node:fs";
import vm from"node:vm";
import ts from"typescript";

const file="lib/sasi/core/intent-router.ts";
const source=fs.readFileSync(file,"utf8");
for(const [mode,words] of Object.entries({
 website:["网站","website","ウェブサイト","웹사이트","site web","webseite","sitio web","موقع ويب"],
 drama:["短剧","video","ショート動画","숏드라마","vidéo","kurzvideo","vídeo corto","فيديو قصير"],
 research:["研究","research","論文","연구","recherche","forschung","investigación","بحث"],
 learning:["学习","study","勉強","학습","apprendre","lernen","estudiar","تعلم"],
 book:["书","book","著者","책","livre","buch","libro","كتاب"]
})){
 if(!source.includes(`mode:"${mode}"`))throw new Error("R17_INTENT_MODE_MISSING:"+mode);
 for(const word of words)if(!source.includes(`"${word}"`))throw new Error(`R17_INTENT_WORD_MISSING:${mode}:${word}`);
}
if(!source.includes("ranked[0]![1]===ranked[1]![1]"))throw new Error("R17_AMBIGUOUS_TIE_GUARD_MISSING");

const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const sandbox={exports:{},module:{exports:{}},require:()=>({})};
sandbox.module.exports=sandbox.exports;
vm.runInNewContext(js,sandbox,{filename:file});
const infer=sandbox.module.exports.inferSasiMode||sandbox.exports.inferSasiMode;
if(typeof infer!=="function")throw new Error("R17_INTENT_EXPORT_MISSING");
const cases=[
 ["帮我做一个网站","website"],["build a website","website"],["ウェブサイトを作る","website"],["웹사이트 만들기","website"],
 ["faire un site web","website"],["eine webseite erstellen","website"],["crear un sitio web","website"],["إنشاء موقع ويب","website"],
 ["把这个做成短剧","drama"],["make a short video","drama"],["研究这些论文","research"],["研究","research"],
 ["教我这一章","learning"],["study this lesson","learning"],["读这本书","book"],["read this book","book"],
 ["",null],["帮我一下",null]
];
for(const [text,expected] of cases){const got=infer(text);if(got!==expected)throw new Error(`R17_INTENT_CASE_FAILED:${text}:${got}:${expected}`)}
const ambiguous=infer("learn novel");
if(ambiguous!==null)throw new Error("R17_AMBIGUOUS_INTENT_NOT_NEUTRAL:"+ambiguous);
console.log("R17_INTENT_ROUTER_5_TASK_FAMILIES=PASS");
console.log("R17_INTENT_ROUTER_9LANG=PASS");
console.log("R17_AMBIGUOUS_INTENT_FAILS_NEUTRAL=PASS");
