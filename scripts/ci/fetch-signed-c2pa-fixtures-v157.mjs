#!/usr/bin/env node
/**
 * Signed C2PA assets are imported only for CI from immutable, license-identified
 * upstream fixtures. Do not commit binary assets or copy third-party signatures.
 * Source: contentauth/c2pa-rs test fixtures, mirrored by richardwooding/c2pa-inspector.
 * See https://github.com/richardwooding/c2pa-inspector/blob/836aea283042cacef8fed15ab9b44d8b3273c1dc/README.md#the-samples
 * Upstream code MIT; the source fixtures are reported as Apache-2.0 / MIT.
 */
import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
const upstream="836aea283042cacef8fed15ab9b44d8b3273c1dc";
const files=[
 {name:"sample.jpg",bytes:166864,gitBlob:"551e611e5a4434355d62ce6952d65162fc991dfc"},
 {name:"sample.mp4",bytes:828571,gitBlob:"5802d5d210b5fde8e33249f87a63065de5f127f5"}
];
// Playwright removes test-results/ when a test run starts. Keep upstream assets
// in a separate ignored cache so preflight-verified media survives that cleanup.
const directory=path.join(".cache","ci-fixtures","c2pa-signed-v157");
await mkdir(directory,{recursive:true});
for(const spec of files){
 const url=`https://raw.githubusercontent.com/richardwooding/c2pa-inspector/${upstream}/site/${spec.name}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error(`C2PA_FIXTURE_FETCH_${response.status}:${spec.name}`);
 const body=Buffer.from(await response.arrayBuffer());
 const blobSha=createHash("sha1").update(Buffer.from(`blob ${body.length}\0`)).update(body).digest("hex");
 if(body.length!==spec.bytes||blobSha!==spec.gitBlob)throw Error(`C2PA_FIXTURE_INTEGRITY:${spec.name}`);
 await writeFile(path.join(directory,spec.name),body);
 console.log("SIGNED_C2PA_FIXTURE_VERIFIED",spec.name,body.length,blobSha);
}
