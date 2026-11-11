/** Only one first-party source-code license. The compiled-only offer was retired.
 * Currency values are independent list prices, not exchange-rate conversions.
 * Historical orders remain in the order/fulfillment tables, not in this storefront list.
 */
export const SASI_SOFTWARE_CATALOG=Object.freeze([
 {id:"sasi-copernicus-si95-source",titleZh:"哥白尼 SI9.5 · MT5 源码授权版",titleEn:"Copernicus SI9.5 · MT5 Source Code License",kind:"source" as const,priceCny:6900,priceUsd:6900,
 featureZh:"MT5 源码包 · 安装、编译与 F7 参数使用教程 · 版本及许可范围 · 模拟账户只读观察",
 featureEn:"MT5 source package · installation, build and F7 parameter guide · license terms · read-only demo access",
 tagZh:"仅售源码授权",tagEn:"Source license only"}
] as const);
export type SasiSoftwareId=(typeof SASI_SOFTWARE_CATALOG)[number]["id"];
export function softwareOffer(id:string){return SASI_SOFTWARE_CATALOG.find(x=>x.id===id)||null;}
export function softwareProductPrice(id:string,currency:"CNY"|"USD"){const x=softwareOffer(id);return x?currency==="CNY"?x.priceCny:x.priceUsd:null;}
