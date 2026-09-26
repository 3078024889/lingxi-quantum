export async function sanitizeHtml(html:string){
  const [{JSDOM},purifyModule]=await Promise.all([import("jsdom"),import("dompurify")]);
  const dom=new JSDOM("<!doctype html><html><body></body></html>");
  const createDOMPurify=(purifyModule as any).default||purifyModule;
  const DOMPurify=createDOMPurify(dom.window as any);
  return String(DOMPurify.sanitize(html,{USE_PROFILES:{html:true}}));
}
export async function extractArticle(html:string,url="https://local.invalid/"){
  const [{JSDOM},{Readability}]=await Promise.all([import("jsdom"),import("@mozilla/readability")]);
  const clean=await sanitizeHtml(html);
  const dom=new JSDOM(clean,{url});
  const article=new Readability(dom.window.document).parse();
  return article?{
    title:article.title||"",byline:article.byline||"",excerpt:article.excerpt||"",
    content:article.content||"",textContent:article.textContent||"",length:article.length||0,
    siteName:article.siteName||"",lang:article.lang||""
  }:null;
}
export async function htmlToMarkdown(html:string){
  const m=await import("turndown");const TurndownService=(m as any).default||m;
  const td=new TurndownService({headingStyle:"atx",codeBlockStyle:"fenced",bulletListMarker:"-"});
  const clean=await sanitizeHtml(html);
  return {markdown:String(td.turndown(clean)||"")};
}
