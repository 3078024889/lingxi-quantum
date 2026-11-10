export function editableMarketplaceListing(ownerId:string,listing:{seller_id:string;status:string}|null){
 return Boolean(listing&&listing.seller_id===ownerId&&['draft','rejected'].includes(listing.status));
}
export function validatedMarketplaceDraft(body:Record<string,unknown>){
 const title=typeof body.title==='string'?body.title.trim():'';
 const description=typeof body.description==='string'?body.description.trim():'';
 const category=typeof body.category==='string'?body.category:'';
 const price=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=100&&value<=1_000_000_000;
 if(title.length<4||title.length>120||description.length>5000||
  !['mt5-ea','mt5-indicator','automation','desktop-app','developer-tool','software'].includes(category)||
  !price(body.priceCnyMinor)||!price(body.priceUsdMinor))return null;
 return {title,description,category,price_cny_minor:body.priceCnyMinor as number,price_usd_minor:body.priceUsdMinor as number};
}
