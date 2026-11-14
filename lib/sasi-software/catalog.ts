/** Only one first-party source-code license. The compiled-only offer was retired.
 * Currency values are independent list prices, not exchange-rate conversions.
 * Historical orders remain in the order/fulfillment tables, not in this storefront list.
 */
// Stable product ID is retained for historical order lookup. Display the version-neutral product name until the uploaded release package has passed verification.
export const SASI_SOFTWARE_CATALOG=Object.freeze([
 {id:"sasi-copernicus-si95-source",titleZh:"哥白尼 SI · MT5 源码授权版",titleEn:"Copernicus SI · MT5 Source Code License",kind:"source" as const,priceCny:6900,priceUsd:6900,
 featureZh:"MT5 MQ5 源码包 · 安装、编译与 F7 参数教程 · 版本及源码授权范围",
 featureEn:"MT5 MQ5 source package · installation, compilation and F7 parameter guide · version and source-license scope",
 tagZh:"仅售源码授权",tagEn:"Source license only"}
] as const);
export type SasiSoftwareId=(typeof SASI_SOFTWARE_CATALOG)[number]["id"];
export function softwareOffer(id:string){return SASI_SOFTWARE_CATALOG.find(x=>x.id===id)||null;}
export function softwareProductPrice(id:string,currency:"CNY"|"USD"){const x=softwareOffer(id);return x?currency==="CNY"?x.priceCny:x.priceUsd:null;}
