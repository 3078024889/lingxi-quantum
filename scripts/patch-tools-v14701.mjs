import fs from "node:fs";
const failures=[],read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){let s=read(p);if(s.includes(b)){console.log(`ALREADY ${n}`);return}if(!s.includes(a)){console.error(`MISS ${n}`);failures.push(n);return}save(p,s.replace(a,b));console.log(`PASS ${n}`)}
function rex(p,re,b,n){let s=read(p);if(!re.test(s)){console.error(`MISS ${n}`);failures.push(n);return}save(p,s.replace(re,b));console.log(`PASS ${n}`)}
const p="components/tools/ToolsHubV11.tsx";
rep(p,'import {toolDescription,toolTitle,toolUi} from "@/lib/tools/card-i18n";','import {toolTitle} from "@/lib/tools/card-i18n";\nimport {toolCategoryLabel,toolHubCopy,toolSummary,type ToolDisplayCategory} from "@/lib/tools/hub-copy-v1470";',"imports");
rep(p,'type Category = "all" | "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr";','type SourceCategory = "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr";\ntype Category = ToolDisplayCategory;',"source/display category separation");
rep(p,'  category: Exclude<Category, "all">;','  category: SourceCategory;',"ToolItem source category");
rex(p,/const categoryLabels:[\s\S]*?\n};\n\n/,'',"old labels");
rep(p,'function registryCategory(category: string): ToolItem["category"] {','function registryCategory(category: string): SourceCategory {',"registry source return");
rep(p,'  const foreign = lang !== "zh";\n','',"remove foreign flag");
rex(p,/  const localCount =[\s\S]*?const onlineCount = tools\.length - localCount;\n/,'',"remove counts");

let s=read(p);
if(!s.includes("const DISPLAY_CATEGORY_BY_SLUG")){
 const idx=s.indexOf("function registryCategory(category: string): SourceCategory {");
 if(idx<0){failures.push("taxonomy anchor");console.error("MISS taxonomy anchor")}
 else{
  const block=`const DISPLAY_CATEGORY_BY_SLUG:Record<string,Exclude<Category,"all">>={
 "merge-pdf":"pdf","split-pdf":"pdf","compress-pdf":"pdf","image-to-pdf":"pdf","image-to-pdf-pro":"pdf","pdf-to-jpg":"pdf","pdf-merge-split":"pdf","pdf-compress":"pdf","pdf-pages":"pdf","pdf-editor":"pdf","e-sign-pdf":"pdf","document-copy-layout":"pdf","pdf-redact":"pdf","pdf-ocr":"pdf",
 "png-to-jpg":"image","jpg-to-png":"image","webp-to-jpg":"image","compress-image":"image","compress-image-to-20kb":"image","compress-image-to-50kb":"image","compress-image-to-100kb":"image","compress-image-to-200kb":"image","compress-image-to-500kb":"image","resize-image":"image","heic-to-jpg":"image","batch-image":"image","avif-to-jpg":"image","heic-local":"image","svg-to-png":"image","long-image":"image","image-watermark-remover":"image","batch-image-watermark-remover":"image",
 "video-toolkit":"media","video-transcription":"media","audio-transcription":"media","video-dubbing":"media","video-watermark-remover":"media",
 "subtitle-tools":"subtitle","subtitle-translate":"subtitle",
 "xlsx-to-csv":"table","csv-to-xlsx":"table","json-formatter":"table",
 "temp-mail":"privacy","burn-after-read":"privacy","privacy-cleaner":"privacy","screenshot-redact":"privacy","remove-exif":"privacy",
 "ocr":"recognition","food-calorie":"recognition","id-photo-ai":"recognition","qr-code-reader":"recognition","qr-safe-reader":"recognition","qr-code-generator":"recognition",
 "text-counter":"file","remove-duplicate-lines":"file","remove-empty-lines":"file","url-encode-decode":"file","base64-encode-decode":"file","file-type-detector":"file","md5-sha256":"file","file-compare":"file","docx-to-txt":"file","pptx-to-txt":"file","timestamp-converter":"file"
};
function displayCategory(item:ToolItem):Exclude<Category,"all">{return DISPLAY_CATEGORY_BY_SLUG[item.href.replace("/tools/","")]||"file";}

`;
  save(p,s.slice(0,idx)+block+s.slice(idx));console.log("PASS taxonomy");
 }
}
rex(p,/const categories: Category\[\] = \[[^\]]+\];/,'const categories: Category[] = ["all","pdf","image","media","subtitle","table","privacy","recognition","file"];',"display categories");
rep(p,'      const categoryMatch = category === "all" || item.category === category;','      const categoryMatch = category === "all" || displayCategory(item) === category;',"display filter");
rex(p,/<section className="lx11-tools-hero">[\s\S]*?<\/section>\n\n        <section className="lx11-tool-searchbar/,`<section className="lx11-tools-hero">
          <div><span>{toolHubCopy(lang,"kicker")}</span><h1>{toolHubCopy(lang,"title")}</h1></div>
        </section>

        <section className="lx11-tool-searchbar`,"compact hero");
rep(p,'<input value={q} onChange={(e) => setQ(e.target.value)} placeholder={toolUi(lang,"search")} />','<input value={q} onChange={(e) => setQ(e.target.value)} placeholder={toolHubCopy(lang,"search")} />',"search");
rep(p,'              const label = toolUi(lang,id);','              const label = toolCategoryLabel(lang,id);',"labels");
const old=`            {list.map((item) => (
              <Link href={item.href} key={item.href} className="lx11-tool-card lx-tools-v124-card">
                <div className="lx11-tool-cover"><ToolGlyph kind={item.kind} /></div>
                <div className="lx11-tool-copy">
                  <div className="lx11-tool-title-row"><h3>{toolTitle(lang,item.href.replace("/tools/",""),lang==="zh"?item.titleZh:item.titleEn)}</h3></div>
                  <p className="lx-tools-v124-desc">{toolDescription(lang,toolTitle(lang,item.href.replace("/tools/",""),lang==="zh"?item.titleZh:item.titleEn))}</p>
                  <div className="lx11-tool-meta">
                    <span>{toolUi(lang,"privacyMark")}</span>
                    <b>{toolUi(lang,"open")}</b>
                  </div>
                </div>
              </Link>
            ))}`;
const neu=`            {list.map((item) => {
              const slug=item.href.replace("/tools/","");
              const title=toolTitle(lang,slug,lang==="zh"?item.titleZh:item.titleEn);
              const summary=toolSummary(lang,slug);
              return <Link href={item.href} key={item.href} className="lx11-tool-card lx-tools-v124-card">
                <div className="lx11-tool-cover"><ToolGlyph kind={item.kind} /></div>
                <div className="lx11-tool-copy">
                  <div className="lx11-tool-title-row"><h3>{title}</h3></div>
                  {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
                  <div className="lx11-tool-meta"><b>{toolHubCopy(lang,"open")}</b></div>
                </div>
              </Link>;
            })}`;
rep(p,old,neu,"selective descriptions");

const f="lib/privacy-tools-i18n.ts";let x=read(f);
x=x.replace('tempLead:"临时接收验证码、注册确认和一次性邮件。无需注册，到期自动销毁。"', 'tempLead:"即时生成临时邮箱，无需注册即可接收普通邮件、注册确认和验证码；收件箱自动刷新，可复制邮箱和验证码、手动刷新、延长10分钟或立即销毁。单个邮箱最长可延长至60分钟；登录后还可付费批量生成11–100个，并复制全部地址或导出CSV。"');
x=x.replace('tempLead:"Receive verification codes, sign-up confirmations and one-time messages. No sign-up required; the inbox expires automatically."', 'tempLead:"Create a temporary inbox instantly without signing up. Receive regular mail, sign-up confirmations and verification codes; auto-refresh the inbox, copy the address and codes, refresh manually, add 10 minutes or destroy it instantly. One inbox can be extended up to 60 minutes; signed-in users can also generate 11–100 inboxes in a paid batch and copy or export them as CSV."');
save(f,x);console.log("PASS temp mail lead");
rep("app/tools/temp-mail/page.tsx",'description:"生成一个只用于临时收信的邮箱地址，到期后邮箱与收件内容自动销毁。"', 'description:"即时生成临时邮箱，接收普通邮件、注册确认和验证码，支持自动刷新、复制邮箱与验证码、续时、销毁，以及登录后的11–100个批量生成与CSV导出。"',"temp mail metadata");
if(failures.length){console.error(`V14.70.1_PATCH_FAILURES=${failures.length}`);process.exit(1)}console.log("V14.70.1_PATCH=PASS");
