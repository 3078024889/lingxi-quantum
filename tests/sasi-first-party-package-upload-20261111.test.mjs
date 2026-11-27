import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const route=read("app/api/sasi/software/admin/package/route.ts");
const panel=read("components/SasiSoftwarePackageAdmin.tsx");
const page=read("app/sasi/marketplace/admin/page.tsx");

test("first-party source package upload is restricted to the configured marketplace administrator",()=>{
 assert.match(route,/moneyAdministrator\(\)/);
 assert.match(route,/isSameOriginMutation\(req\)/);
 assert.match(route,/enforceAbuseGuard\(req/);
 assert.match(route,/SOURCE_PRODUCT_ONLY/);
 assert.match(route,/SOURCE_PRODUCT_ID="sasi-copernicus-si95-source"/);
 assert.match(route,/x\.kind==="source"/);
 assert.match(route,/SASI_SOFTWARE_CATALOG\.find/);
});

test("first-party Copernicus SI 9.5 delivery is strictly source-only with PDF and guide",()=>{
 assert.match(route,/ONE_9_5_SOURCE_REQUIRED/);
 assert.ok(route.includes(String.raw`#property\s+version\s+`));
 assert.match(route,/ONE_WHITEPAPER_PDF_REQUIRED/);
 assert.match(route,/INSTALL_COMPILE_F7_AND_LICENSE_GUIDE_REQUIRED/);
 assert.match(route,/WHITEPAPER_FORMAT_INVALID/);
 assert.match(route,/ZIP_PATH_INVALID/);
 assert.match(route,/ZIP_SYMLINK_FORBIDDEN/);
 assert.match(route,/ZIP_UNPACKED_SIZE_LIMIT/);
 assert.match(route,/ZIP_FILE_TYPE_FORBIDDEN/);
 assert.match(route,/checkCRC32:true/);
 assert.doesNotMatch(route,/\.ex5|MATCHING_EX5_REQUIRED|EX5_SOURCE_BASENAME_MISMATCH|demoAccessFiles|DEMO_ACCESS/);
 assert.match(route,/privateBucketReady\(admin\)/);
 assert.match(route,/data\?\.public===false/);
 assert.match(route,/allowed_mime_types\.includes\("application\/zip"\)/);
});

test("upload verification and manual activation are separate operations",()=>{
 const upload=route.indexOf("storage.upload(objectPath,bytes");
 const readback=route.indexOf("storage.download(objectPath)",upload);
 const hash=route.indexOf("verifiedHash!==sha256",readback);
 const pending=route.indexOf("sale_ready:false",hash);
 const activate=route.indexOf('if(action==="activate")');
 const ready=route.indexOf("sale_ready:true",activate);
 assert.ok(upload>=0&&readback>upload&&hash>readback&&pending>hash&&activate>0&&ready>activate);
 assert.match(route,/verifyStoredPackage\(admin,product,record as PackageRow\)/);
 assert.match(panel,/确认审核并开放销售/);
 assert.match(panel,/这一步不会自动开放销售/);
 assert.match(route,/upsert:false/);
 assert.match(route,/sasi-software-delivery/);
 assert.ok(route.includes('first-party/'));
 assert.match(route,/eq\("sale_ready",false\)/);
});

test("admin UI exposes upload only from the protected review page and does not offer active package overwrite",()=>{
 assert.match(page,/moneyAdministrator\(\)/);
 assert.match(page,/SasiSoftwarePackageAdmin/);
 assert.match(panel,/data-testid="sasi-first-party-package-admin"/);
 assert.match(panel,/product\.saleReady\?/);
 assert.match(panel,/不提供覆盖操作/);
 assert.match(panel,/FormData/);
});
