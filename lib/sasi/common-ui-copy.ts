import type {LingxiLang} from "@/lib/lingxi-i18n";
const COPY={
  "zh": {
    "ask": "问问 SASI",
    "downloadDocument": "下载文档",
    "downloadResult": "下载结果",
    "websiteDefault": "我的网站",
    "modes": "SASI 功能"
  },
  "en": {
    "ask": "Ask SASI",
    "downloadDocument": "Download document",
    "downloadResult": "Download result",
    "websiteDefault": "My website",
    "modes": "SASI features"
  },
  "ja": {
    "ask": "SASIに質問",
    "downloadDocument": "文書をダウンロード",
    "downloadResult": "結果をダウンロード",
    "websiteDefault": "自分のサイト",
    "modes": "SASIの機能"
  },
  "ko": {
    "ask": "SASI에 질문",
    "downloadDocument": "문서 다운로드",
    "downloadResult": "결과 다운로드",
    "websiteDefault": "내 웹사이트",
    "modes": "SASI 기능"
  },
  "fr": {
    "ask": "Demandez à SASI",
    "downloadDocument": "Télécharger le document",
    "downloadResult": "Télécharger le résultat",
    "websiteDefault": "Mon site",
    "modes": "Fonctions SASI"
  },
  "de": {
    "ask": "SASI fragen",
    "downloadDocument": "Dokument herunterladen",
    "downloadResult": "Ergebnis herunterladen",
    "websiteDefault": "Meine Website",
    "modes": "SASI-Funktionen"
  },
  "es": {
    "ask": "Pregunta a SASI",
    "downloadDocument": "Descargar documento",
    "downloadResult": "Descargar resultado",
    "websiteDefault": "Mi sitio web",
    "modes": "Funciones SASI"
  },
  "pt": {
    "ask": "Pergunte ao SASI",
    "downloadDocument": "Baixar documento",
    "downloadResult": "Baixar resultado",
    "websiteDefault": "Meu site",
    "modes": "Funções SASI"
  },
  "ar": {
    "ask": "اسأل SASI",
    "downloadDocument": "تنزيل المستند",
    "downloadResult": "تنزيل النتيجة",
    "websiteDefault": "موقعي",
    "modes": "وظائف SASI"
  }
} as const;
export function sasiCommonText(lang:LingxiLang,key:keyof typeof COPY.zh){return COPY[lang][key]}
