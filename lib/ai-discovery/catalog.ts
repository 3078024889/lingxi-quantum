/** Editorial discovery catalog. Presence does not imply independent verification or endorsement. */
export type AITool = {slug:string;name:string;provider:string;category:string;url:string;description:string;tags:string[];pricing:string;evidenceStatus:string};
export const aiTools:AITool[] = [
  {
    "slug": "chatgpt",
    "name": "ChatGPT",
    "provider": "OpenAI",
    "category": "Assistants",
    "url": "https://chatgpt.com",
    "description": "Writing, brainstorming, coding and research",
    "tags": [
      "writing",
      "research",
      "coding",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "claude",
    "name": "Claude",
    "provider": "Anthropic",
    "category": "Assistants",
    "url": "https://claude.ai",
    "description": "Writing, analysis and coding",
    "tags": [
      "writing",
      "research",
      "coding"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "gemini",
    "name": "Gemini",
    "provider": "Google",
    "category": "Assistants",
    "url": "https://gemini.google.com",
    "description": "Everyday assistance, writing and research",
    "tags": [
      "writing",
      "research",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "grok",
    "name": "Grok",
    "provider": "xAI",
    "category": "Assistants",
    "url": "https://grok.com",
    "description": "Conversational AI and research",
    "tags": [
      "writing",
      "research"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "qwen",
    "name": "Qwen",
    "provider": "Alibaba",
    "category": "Assistants",
    "url": "https://chat.qwen.ai",
    "description": "Multilingual assistance and coding",
    "tags": [
      "writing",
      "coding",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "deepseek",
    "name": "DeepSeek",
    "provider": "DeepSeek",
    "category": "Assistants",
    "url": "https://chat.deepseek.com",
    "description": "Reasoning and coding assistance",
    "tags": [
      "coding",
      "research",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "microsoft-copilot",
    "name": "Microsoft Copilot",
    "provider": "Microsoft",
    "category": "Assistants",
    "url": "https://copilot.microsoft.com",
    "description": "AI assistance for everyday tasks",
    "tags": [
      "writing",
      "research",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "meta-ai",
    "name": "Meta AI",
    "provider": "Meta",
    "category": "Assistants",
    "url": "https://www.meta.ai",
    "description": "Conversational AI assistant",
    "tags": [
      "writing",
      "research"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "perplexity",
    "name": "Perplexity",
    "provider": "Perplexity",
    "category": "Research",
    "url": "https://www.perplexity.ai",
    "description": "Answer-focused web research",
    "tags": [
      "research",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "notebooklm",
    "name": "NotebookLM",
    "provider": "Google",
    "category": "Research",
    "url": "https://notebooklm.google.com",
    "description": "Research and study with your own sources",
    "tags": [
      "research",
      "study",
      "documents"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "elicit",
    "name": "Elicit",
    "provider": "Elicit",
    "category": "Research",
    "url": "https://elicit.com",
    "description": "Research literature workflows",
    "tags": [
      "research",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "consensus",
    "name": "Consensus",
    "provider": "Consensus",
    "category": "Research",
    "url": "https://consensus.app",
    "description": "Scientific literature search",
    "tags": [
      "research",
      "study"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "github-copilot",
    "name": "GitHub Copilot",
    "provider": "GitHub",
    "category": "Coding",
    "url": "https://github.com/features/copilot",
    "description": "Coding assistance in development workflows",
    "tags": [
      "coding",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "cursor",
    "name": "Cursor",
    "provider": "Anysphere",
    "category": "Coding",
    "url": "https://cursor.com",
    "description": "AI-assisted code editor",
    "tags": [
      "coding"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "windsurf",
    "name": "Windsurf",
    "provider": "Windsurf",
    "category": "Coding",
    "url": "https://windsurf.com",
    "description": "AI coding environment",
    "tags": [
      "coding"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "replit",
    "name": "Replit",
    "provider": "Replit",
    "category": "Coding",
    "url": "https://replit.com",
    "description": "Build and run software online",
    "tags": [
      "coding",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "bolt-new",
    "name": "Bolt",
    "provider": "StackBlitz",
    "category": "Coding",
    "url": "https://bolt.new",
    "description": "Build web applications from prompts",
    "tags": [
      "coding",
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "lovable",
    "name": "Lovable",
    "provider": "Lovable",
    "category": "Coding",
    "url": "https://lovable.dev",
    "description": "Create web applications with AI",
    "tags": [
      "coding",
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "v0",
    "name": "v0",
    "provider": "Vercel",
    "category": "Coding",
    "url": "https://v0.app",
    "description": "Generate web interfaces",
    "tags": [
      "coding",
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "runway",
    "name": "Runway",
    "provider": "Runway",
    "category": "Video",
    "url": "https://runwayml.com",
    "description": "AI video creation and editing",
    "tags": [
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "luma",
    "name": "Luma",
    "provider": "Luma AI",
    "category": "Video",
    "url": "https://lumalabs.ai",
    "description": "Generative video and visual creation",
    "tags": [
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "pika",
    "name": "Pika",
    "provider": "Pika",
    "category": "Video",
    "url": "https://pika.art",
    "description": "AI video generation",
    "tags": [
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "kling",
    "name": "Kling AI",
    "provider": "Kuaishou",
    "category": "Video",
    "url": "https://klingai.com",
    "description": "AI video generation",
    "tags": [
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "heygen",
    "name": "HeyGen",
    "provider": "HeyGen",
    "category": "Video",
    "url": "https://www.heygen.com",
    "description": "AI avatar video and translation",
    "tags": [
      "video",
      "audio"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "synthesia",
    "name": "Synthesia",
    "provider": "Synthesia",
    "category": "Video",
    "url": "https://www.synthesia.io",
    "description": "Presenter-style AI videos",
    "tags": [
      "video",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "canva",
    "name": "Canva",
    "provider": "Canva",
    "category": "Design",
    "url": "https://www.canva.com",
    "description": "Graphic design and presentations",
    "tags": [
      "design",
      "documents",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "adobe-firefly",
    "name": "Adobe Firefly",
    "provider": "Adobe",
    "category": "Design",
    "url": "https://firefly.adobe.com",
    "description": "Creative image generation",
    "tags": [
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "midjourney",
    "name": "Midjourney",
    "provider": "Midjourney",
    "category": "Design",
    "url": "https://www.midjourney.com",
    "description": "AI image generation",
    "tags": [
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "ideogram",
    "name": "Ideogram",
    "provider": "Ideogram",
    "category": "Design",
    "url": "https://ideogram.ai",
    "description": "AI image generation and typography",
    "tags": [
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "leonardo-ai",
    "name": "Leonardo AI",
    "provider": "Leonardo",
    "category": "Design",
    "url": "https://leonardo.ai",
    "description": "AI creative images and assets",
    "tags": [
      "design"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "elevenlabs",
    "name": "ElevenLabs",
    "provider": "ElevenLabs",
    "category": "Audio",
    "url": "https://elevenlabs.io",
    "description": "AI speech and voice tools",
    "tags": [
      "audio",
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "suno",
    "name": "Suno",
    "provider": "Suno",
    "category": "Audio",
    "url": "https://suno.com",
    "description": "AI music generation",
    "tags": [
      "audio"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "udio",
    "name": "Udio",
    "provider": "Udio",
    "category": "Audio",
    "url": "https://www.udio.com",
    "description": "AI music creation",
    "tags": [
      "audio"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "descript",
    "name": "Descript",
    "provider": "Descript",
    "category": "Audio",
    "url": "https://www.descript.com",
    "description": "Audio and video editing",
    "tags": [
      "audio",
      "video"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "gamma",
    "name": "Gamma",
    "provider": "Gamma",
    "category": "Documents",
    "url": "https://gamma.app",
    "description": "AI presentations and documents",
    "tags": [
      "documents",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "notion-ai",
    "name": "Notion AI",
    "provider": "Notion",
    "category": "Documents",
    "url": "https://www.notion.so/product/ai",
    "description": "Writing and knowledge workflows",
    "tags": [
      "documents",
      "writing",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "grammarly",
    "name": "Grammarly",
    "provider": "Grammarly",
    "category": "Documents",
    "url": "https://www.grammarly.com",
    "description": "Writing and editing assistance",
    "tags": [
      "writing",
      "documents"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "zapier",
    "name": "Zapier",
    "provider": "Zapier",
    "category": "Automation",
    "url": "https://zapier.com",
    "description": "Connect apps and automate tasks",
    "tags": [
      "automation",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "make",
    "name": "Make",
    "provider": "Make",
    "category": "Automation",
    "url": "https://www.make.com",
    "description": "Visual workflow automation",
    "tags": [
      "automation",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "n8n",
    "name": "n8n",
    "provider": "n8n",
    "category": "Automation",
    "url": "https://n8n.io",
    "description": "Workflow automation platform",
    "tags": [
      "automation", "agent",
      "coding"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  },
  {
    "slug": "lingxifield",
    "name": "LINGXIFIELD",
    "provider": "LINGXIFIELD",
    "category": "Documents",
    "url": "https://lingxifield.com/tools",
    "description": "Document, image, audio and video tools",
    "tags": [
      "documents",
      "video",
      "design",
      "audio",
      "work"
    ],
    "pricing": "Check official site",
    "evidenceStatus": "Unverified catalog entry"
  }
, {"slug":"ahrefs-brand-radar","name":"Ahrefs Brand Radar","provider":"Ahrefs","category":"SEO","url":"https://ahrefs.com/brand-radar","description":"AI visibility, brand mentions and citations","tags":["seo","geo","marketing"],"pricing":"Check official site","evidenceStatus":"Unverified catalog entry"}
];
export const categories=[...new Set(aiTools.map(t=>t.category))].sort();
export const goals=[{key:"writing",name:"Write better",detail:"Articles, emails and ideas"},{key:"research",name:"Research",detail:"Find answers and sources"},{key:"video",name:"Create videos",detail:"Clips and presentations"},{key:"design",name:"Make images",detail:"Designs and graphics"},{key:"coding",name:"Build software",detail:"Apps and websites"},{key:"audio",name:"Work with audio",detail:"Voices and music"},{key:"documents",name:"Handle documents",detail:"Slides, PDFs and notes"},{key:"automation",name:"Automate work",detail:"Connect tasks and apps"}];
export function searchTools(q:string,category:string,goal:string=""){const s=q.trim().toLocaleLowerCase();return aiTools.filter(t=>(!category||t.category===category)&&(!goal||t.tags.includes(goal))&&(!s||[t.name,t.provider,t.category,t.description,...t.tags].join(" ").toLocaleLowerCase().includes(s)));}
export function toolBySlug(slug:string){return aiTools.find(t=>t.slug===slug);}
