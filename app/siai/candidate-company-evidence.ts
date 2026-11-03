/** Publisher-history entries with first-party sources. Product launches are identified explicitly.
 * Listing status distinguishes a directly public company from a public parent. */
export type CandidateHistory={year:string;yearSource:string;listing?:"listed_parent"|"listed_company";listingSource?:string;creator?:{en:string;zh:string;source:string}};
export const CANDIDATE_HISTORY:Readonly<Record<string,CandidateHistory>>={
  "microsoft-copilot": {
    "year": "1975",
    "yearSource": "https://news.microsoft.com/facts-about-microsoft/",
    "listing": "listed_company",
    "listingSource": "https://www.microsoft.com/en-us/investor/faq",
    "creator": {
      "en": "Bill Gates · Paul Allen",
      "zh": "比尔·盖茨 · 保罗·艾伦",
      "source": "https://news.microsoft.com/about/"
    }
  },
  "github-copilot": {
    "year": "2008",
    "yearSource": "https://github.blog/security/application-security/how-github-used-secret-scanning-to-reach-inbox-zero/",
    "listing": "listed_parent",
    "listingSource": "https://github.com/frequently-asked-questions"
  },
  "figma-make": {
    "year": "2012",
    "yearSource": "https://investor.figma.com/overview/",
    "listing": "listed_company",
    "listingSource": "https://investor.figma.com/overview/",
    "creator": {
      "en": "Dylan Field · Evan Wallace",
      "zh": "迪伦·菲尔德 · 埃文·华莱士",
      "source": "https://www.figma.com/blog/figma-ipo-founder-letter/"
    }
  },
  "adobe-firefly": {
    "year": "1982",
    "yearSource": "https://www.adobe.com/cc-shared/assets/investor-relations/pdfs/adbe-2024-proxy.pdf",
    "listing": "listed_company",
    "listingSource": "https://news.adobe.com/news/2026/09/adobe-productivity-agent-in-acrobat-now-transforms-complex-documents"
  },
  "canva-magic-studio": {
    "year": "2013（Canva 上线）",
    "yearSource": "https://www.canva.com/about/"
  },
  "recraft": {
    "year": "2022",
    "yearSource": "https://www.recraft.ai/about",
    "creator": {
      "en": "Anna Veronika Dorogush",
      "zh": "安娜·维罗妮卡·多罗古什",
      "source": "https://www.recraft.ai/authors/anna-veronika-dorogush"
    }
  },
  "synthesia": {
    "year": "2017",
    "yearSource": "https://www.synthesia.io/about",
    "creator": {
      "en": "Victor Riparbelli · Steffen Tjerrild · Matt Niessner · Lourdes Agapito",
      "zh": "维克托·里帕贝利 · 斯特芬·杰里尔德 · 马特·尼斯纳 · 卢尔德斯·阿加皮托",
      "source": "https://www.synthesia.io/about"
    }
  },
  "freepik-ai": {
    "year": "2010（Freepik 起始）",
    "yearSource": "https://www.freepik.com/company/about-us",
    "creator": {
      "en": "Alejandro Sánchez · Pablo Blanes · Joaquín Cuenca (Freepik founders)",
      "zh": "亚历杭德罗·桑切斯 · 巴勃罗·布拉内斯 · 华金·昆卡（Freepik 创始人）",
      "source": "https://www.freepik.com/company/about-us"
    }
  }
};
