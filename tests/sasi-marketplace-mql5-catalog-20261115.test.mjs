import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("MQL5-style catalogue keeps all public listings in compact image-first cards",()=>{
 const market=read("components/SasiOpenMarketplace.tsx");
 const css=read("components/SasiOpenMarketplace.module.css");
 assert.match(market,/const remainingVisible=visible/);
 assert.match(market,/styles\.quickPreview/);
 assert.match(market,/quickPreviewPrice/);
 assert.match(css,/repeat\(auto-fill,minmax\(min\(100%,148px\),1fr\)\)/);
 assert.match(css,/\.main \.card:is\(:hover,:focus-within\)/);
 assert.match(market,/href="\/sasi\/seller"/);
 assert.match(market,/sellerOnly&&showStudio&&<section id="sasi-seller-studio"/);
});

test("pending seller can prepare and submit a private listing, but cannot publish before approval",()=>{
 const ui=read("components/SasiOpenMarketplace.tsx");
 const listings=read("app/api/sasi/marketplace/listings/route.ts");
 const zip=read("app/api/sasi/marketplace/upload-ticket/route.ts");
 const photo=read("app/api/sasi/marketplace/image-ticket/route.ts");
 const submit=read("app/api/sasi/marketplace/submit/route.ts");
 const sql=read("supabase/migrations/20261108193000_sasi_market_scanner_and_admin_review.sql");
 for(const source of [listings,zip,photo,submit])assert.match(source,/pending_review","approved/);
 assert.match(ui,/seller\?\.status\?\?"\)\}/);
 assert.match(sql,/s\.status='approved'/);
 assert.match(sql,/SECURITY_SCAN_OR_SELLER_NOT_APPROVED/);
 assert.match(submit,/dispatchMarketplaceScan\(saved\.id\)/);
});

test("administrator can find the SASI moderation console from the management dashboard",()=>{
 const dashboard=read("components/MoneyAdminDashboard.tsx");
 const page=read("app/sasi/marketplace/admin/page.tsx");
 const api=read("app/api/sasi/marketplace/admin/review/route.ts");
 assert.match(dashboard,/href="\/sasi\/marketplace\/admin"/);
 assert.match(page,/moneyAdministrator\(\)/);
 assert.match(api,/sasi_market_review_seller/);
 assert.match(api,/sasi_market_review_listing/);
 assert.match(api,/sasi_market_review_media/);
});

test("product detail exposes one main image, four detail images, complete 5,000-character description and lightbox",()=>{
 const page=read("components/SasiMarketplaceProductDetail.tsx");
 const editor=read("components/SasiOpenMarketplace.tsx");
 const sql=read("supabase/migrations/20261109110500_sasi_market_description_5000.sql");
 assert.match(page,/galleryPhotos/);
 assert.match(page,/lightboxOpen/);
 assert.match(page,/fullDescription/);
 assert.match(editor,/maxLength=\{5000\}/);
 assert.match(sql,/char_length\(description\) <= 5000/);
 assert.match(page,/setActivePhotoIndex/);
});

test("global visual override normalizes compact page spacing and white wallet/account surfaces",()=>{
 const css=read("app/global-compact-white-20261115.css");
 assert.match(css,/\.lx10-page/);
 assert.match(css,/\.lx11-page/);
 assert.match(css,/\.lx-seo-question-grid/);
 assert.match(css,/\.lx26-wallet-overview/);
 assert.match(css,/\.lx26-balance-card/);
});
