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
 assert.match(route,/SASI_SOFTWARE_CATALOG\.find/);
});

test("only a single Copernicus SI 9.5 MQ5 and installation/compile guide can activate the source SKU",()=>{
 assert.match(route,/ONE_9_5_SOURCE_REQUIRED/);
 assert.ok(route.includes('#property\\\\s+version\\\\s+'));
 assert.match(route,/INSTALL_AND_COMPILE_GUIDE_REQUIRED/);
 assert.match(route,/ZIP_PATH_INVALID/);
 assert.match(route,/ZIP_SYMLINK_FORBIDDEN/);
 assert.match(route,/ZIP_UNPACKED_SIZE_LIMIT/);
 assert.match(route,/ZIP_FILE_TYPE_FORBIDDEN/);
 assert.match(route,/privateBucketReady\(admin\)/);
 assert.match(route,/data\?\.public===false/);
 assert.match(route,/allowed_mime_types\.includes\("application\/zip"\)/);
});

test("sale readiness follows immutable private upload and byte-for-byte SHA256 readback",()=>{
 const upload=route.indexOf("storage.upload(objectPath,bytes");
 const readback=route.indexOf("storage.download(objectPath)",upload);
 const hash=route.indexOf("verifiedHash!==sha256",readback);
 const ready=route.indexOf("sale_ready:true",hash);
 assert.ok(upload>=0&&readback>upload&&hash>readback&&ready>hash);
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
