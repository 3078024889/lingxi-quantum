import fs from"node:fs";const p="components/Nav.tsx";let s=fs.readFileSync(p,"utf8");
if(!s.includes('LingxifieldFeedback'))s=s.replace('import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";','import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";\nimport LingxifieldFeedback from "@/components/support/LingxifieldFeedback";');
const anchor='      <div className="lx11-sidebar-bottom">';
const block=`      <div style={{padding:"10px 12px 4px"}}>\n        <button type="button" onClick={()=>window.dispatchEvent(new Event("lingxifield:feedback"))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,border:"1px solid rgba(150,125,70,.20)",borderRadius:14,padding:"11px 12px",background:"rgba(255,255,255,.55)",fontWeight:650,cursor:"pointer"}}><span aria-hidden="true">✦</span><span>告诉我们</span></button>\n        <Link href="/account/support" style={{display:"block",padding:"7px 12px 0",fontSize:12,opacity:.55}}>查看处理进度</Link>\n      </div>\n\n`;
if(!s.includes("查看处理进度")){if(!s.includes(anchor))throw new Error("NAV_ANCHOR_NOT_FOUND");s=s.replace(anchor,block+anchor)}
if(!s.includes("<LingxifieldFeedback />"))s=s.replace("    </>\n  );\n}",'      <LingxifieldFeedback />\n    </>\n  );\n}');
fs.writeFileSync(p,s);console.log("SUPPORT_NAV_PATCH=PASS");
