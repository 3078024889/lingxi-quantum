import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8"),ok=(n,v)=>{console.log(`${n}=${v?"PASS":"FAIL"}`);if(!v)process.exitCode=1};
const p=r("lib/tools/id-photo/browser-processor.ts"),m=r("lib/tools/id-photo/modnet-runtime.ts"),u=r("components/tools/IdPhotoAiWorkbench.tsx");
ok("IDPHOTO_TRUE_MATTE_RUNTIME",m.includes("InferenceSession.create")&&m.includes("alphaAt"));
ok("IDPHOTO_NO_BORDER_COLOR_GUESS",!p.includes("near-uniform")&&!p.includes("dd<42"));
ok("IDPHOTO_ALPHA_COMPOSITE",p.includes("portraitMatte")&&p.includes("d[si+3]"));
ok("IDPHOTO_MANUAL_POSITION",u.includes("左右位置")&&u.includes("上下位置"));
ok("IDPHOTO_VISIBLE_MODEL_FAILURE",u.includes('role="alert"')&&u.includes("模型没有加载成功"));
ok("IDPHOTO_PRIVACY_COPY",u.includes("浏览器本地处理"));
if(!process.exitCode)console.log("GRADUATION_IDPHOTO_TRUE_MATTING=PASS");
