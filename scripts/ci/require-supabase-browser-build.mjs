#!/usr/bin/env node
/**
 * Fail-closed preflight for browser client build of either Lingxifield main site.
 * Unlike server SSR runtime lookup, NEXT_PUBLIC_ keys are inlined by Next.js
 * at build time; a build without valid values cannot support browser login.
 * Usage: node scripts/ci/require-supabase-browser-build.mjs --release
 */
import {pathToFileURL} from "node:url";
import {activePublicType} from "../ops/cn-main-auth-recover-verified.mjs";

export function checkSupabaseBrowserBuild(env=process.env,verify=activePublicType) {
  const url=String(env.NEXT_PUBLIC_SUPABASE_URL||"").trim();
  const key=String(env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").trim();
  if(url!=="https://sxsgdpqojepgbbrxrzlq.supabase.co")
    return {ok:false,reason:"PUBLIC_PROJECT_URL_NOT_SET_OR_DIFFERENT"};
  const type=verify(key);
  if(!type)return {ok:false,reason:"PUBLIC_BROWSER_KEY_NOT_ENABLED_OR_MISSING"};
  return {ok:true,project:"sxsgdpqojepgbbrxrzlq",keyType:type};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  if(process.argv.length!==3||process.argv[2]!=="--release") {
    console.error("USAGE: require-supabase-browser-build.mjs --release");process.exitCode=2;
  }else{
    const result=checkSupabaseBrowserBuild();
    console.log(JSON.stringify(result));
    process.exitCode=result.ok?0:1;
  }
}
