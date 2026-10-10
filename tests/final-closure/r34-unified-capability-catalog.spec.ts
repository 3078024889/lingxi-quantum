import{test,expect}from"playwright/test";
import{assertUnifiedCapabilityCatalog,findUnifiedCapabilities}from"../../lib/capabilities/unified-catalog";

test("unified catalog includes 100+ tools and all SASI platform skills",()=>{
 const stats=assertUnifiedCapabilityCatalog();
 expect(stats.tools).toBeGreaterThanOrEqual(100);
 expect(stats.skills).toBeGreaterThanOrEqual(20);
 expect(stats.total).toBe(stats.tools+stats.skills);
});

test("PDF signature intent resolves to the signing tool",()=>{
 const matches=findUnifiedCapabilities("给 PDF 添加手写签名",{limit:12});
 expect(matches.some(x=>x.kind==="tool"&&x.id==="e-sign-pdf")).toBeTruthy();
});

test("watermark removal and research tracking resolve to correct capability families",()=>{
 const remove=findUnifiedCapabilities("图片去水印",{limit:12});
 expect(remove.some(x=>x.kind==="tool"&&/watermark-remover/.test(x.id))).toBeTruthy();
 const papers=findUnifiedCapabilities("追踪最近60天 arxiv 论文",{mode:"research",limit:12});
 expect(papers.some(x=>x.kind==="skill"&&x.id==="research-tracker")).toBeTruthy();
});

test("mode filtering does not leak incompatible SASI skills",()=>{
 const rows=findUnifiedCapabilities("短剧分镜",{mode:"research",limit:20,kinds:["skill"]});
 expect(rows.some(x=>x.id==="drama-storyboard")).toBeFalsy();
});

test("compact Chinese tool intent resolves without requiring spaces",()=>{
 const excel=findUnifiedCapabilities("帮我把这个PDF转Excel",{limit:12});
 expect(excel.some(x=>x.kind==="tool"&&x.id==="pdf-to-xlsx"&&x.score>=5)).toBeTruthy();
 const watermark=findUnifiedCapabilities("给这张图片去水印",{limit:12});
 expect(watermark.some(x=>x.kind==="tool"&&x.id==="image-watermark-remover")).toBeTruthy();
});
