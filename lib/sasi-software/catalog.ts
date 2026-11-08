/** Public product facts; prices are fixed by currency, never FX-converted. */
export const SASI_SOFTWARE_CATALOG=Object.freeze([
 {id:"sasi-copernicus-si95-mt5",titleZh:"哥白尼 SI 9.5 · MT5 自动交易软件",titleEn:"Copernicus SI 9.5 · MT5 Trading Software",kind:"binary" as const,priceCny:2888,priceUsd:2888,featureZh:"成品软件授权 · MT5 安装包 · 参数说明 · 模拟账户只读观察",featureEn:"Compiled MT5 EA · installation guide · read-only demo observation",tagZh:"成品软件",tagEn:"Compiled software"},
 {id:"sasi-copernicus-si95-source",titleZh:"哥白尼 SI 9.5 · MT5 源码授权版",titleEn:"Copernicus SI 9.5 · Source License",kind:"source" as const,priceCny:6900,priceUsd:6900,featureZh:"含成品软件与源码许可 · 交付条款独立列明",featureEn:"Compiled software and source-code license · separate license terms",tagZh:"含源码",tagEn:"Source included"}
] as const);
export type SasiSoftwareId=(typeof SASI_SOFTWARE_CATALOG)[number]["id"];
export function softwareOffer(id:string){return SASI_SOFTWARE_CATALOG.find(x=>x.id===id)||null;}
export function softwareProductPrice(id:string,currency:"CNY"|"USD"){const x=softwareOffer(id);return x?currency==="CNY"?x.priceCny:x.priceUsd:null;}
