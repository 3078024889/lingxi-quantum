export type AITool = { slug:string; name:string; category:string; description:string; url:string; pricing:"Free"|"Freemium"|"Paid"; verifiedAt:string };
export const aiTools:AITool[] = [
{slug:"chatgpt",name:"ChatGPT",category:"Writing & Research",description:"Conversational AI for writing, reasoning, and research.",url:"https://chatgpt.com",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"claude",name:"Claude",category:"Writing & Research",description:"AI assistant for writing, analysis, and coding.",url:"https://claude.ai",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"perplexity",name:"Perplexity",category:"Search & Research",description:"Answer engine for web research with cited sources.",url:"https://www.perplexity.ai",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"github-copilot",name:"GitHub Copilot",category:"Coding",description:"AI-assisted code completion and development.",url:"https://github.com/features/copilot",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"runway",name:"Runway",category:"Video Creation",description:"AI-powered video generation and editing.",url:"https://runwayml.com",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"canva",name:"Canva",category:"Design",description:"Design platform with AI-assisted creative tools.",url:"https://www.canva.com",pricing:"Freemium",verifiedAt:"2026-10-26"},
{slug:"lingxifield",name:"LINGXIFIELD",category:"Documents & Productivity",description:"Online document, image, audio and video tools.",url:"https://lingxifield.com/tools",pricing:"Freemium",verifiedAt:"2026-10-26"}
];
export function searchTools(q:string,category:string){const s=q.trim().toLowerCase();return aiTools.filter(t=>(!category||t.category===category)&&(!s||[t.name,t.category,t.description].join(" ").toLowerCase().includes(s)));}
export const categories=[...new Set(aiTools.map(t=>t.category))].sort();
