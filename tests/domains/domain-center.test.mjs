import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {runInNewContext} from "node:vm";
import test from "node:test";
import ts from "typescript";

// Loads the standalone, side-effect-free business rules without Next.js.
const path=resolve(process.cwd(),"lib/domains/domain-center.ts");
const source=readFileSync(path,"utf8");
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
const module={exports:{}};
runInNewContext(outputText,{module,exports:module.exports,Date}, {filename:path});
const {parseDomainQuery,mapRegistrarStatus,normalizeAvailabilityResponse}=module.exports;

test("accepts valid label and matching full domain",()=>{
 assert.equal(parseDomainQuery("MyBrand","com").domain,"mybrand.com");
 assert.equal(parseDomainQuery("MYBRAND.COM","com").domain,"mybrand.com");
 assert.equal(parseDomainQuery("studio-72","ai").domain,"studio-72.ai");
});

test("rejects URLs, mismatched TLDs, IDN and malicious inputs",()=>{
 for(const name of ["https://example.com","bad.domain.org","foo/bar","a","-leading","trailing-","x".repeat(64),"a b","xn--bcher-kva","a--b"]){
  assert.throws(()=>parseDomainQuery(name,"com"),undefined,name);
 }
 assert.throws(()=>parseDomainQuery("mybrand","invalid"));
 assert.throws(()=>parseDomainQuery({}, "com"));
});

test("availability is only trusted for a matching returned domain",()=>{
 const r=normalizeAvailabilityResponse({domains:[{domainName:"mybrand.com",status:"available"}]},"mybrand.com","live");
 assert.equal(r.status,"available");
 assert.equal(r.domain,"mybrand.com");
 assert.equal(r.environment,"live");
 assert.equal(normalizeAvailabilityResponse({domains:[{domainName:"other.com",status:"available"}]},"mybrand.com","live").status,"unknown");
 assert.equal(normalizeAvailabilityResponse({domains:[{domainName:"mybrand.com",status:"unknown"}]},"mybrand.com","live").status,"unknown");
 assert.equal(normalizeAvailabilityResponse({},"mybrand.com","sandbox").status,"unknown");
});

test("unknown statuses cannot become purchasable",()=>{
 assert.equal(mapRegistrarStatus("available"),"available");
 assert.equal(mapRegistrarStatus("Taken"),"unavailable");
 assert.equal(mapRegistrarStatus("Premium"),"unknown");
 assert.equal(mapRegistrarStatus("Error"),"unknown");
 assert.equal(mapRegistrarStatus(undefined),"unknown");
});
