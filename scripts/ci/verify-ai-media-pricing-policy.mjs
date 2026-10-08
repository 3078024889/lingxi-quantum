import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const policy=JSON.parse(readFileSync(new URL("../../lib/tools/commerce/pricing-policy.json",import.meta.url),"utf8"));
const image=policy.tools["ai-image-check"], media=policy.tools["ai-video-audio-check"];
assert.equal(image.mode,"disabled-quality-gate");
assert.equal(media.mode,"disabled-quality-gate");
assert.equal(image.free.perAccountPerDay,3);
assert.equal(media.free.sharedVideoAudioPerAccountPerDay,3);
for(const currency of ["CNY","USD"]){assert.equal(image[currency].perImage,1);assert.equal(media[currency].perStartedMinute,1);}
const minutes=s=>Math.ceil(s/60);
for(const [seconds,expected] of [[1,1],[60,1],[61,2],[121,3],[179,3]])assert.equal(minutes(seconds),expected);
assert.equal([61,121].reduce((sum,s)=>sum+minutes(s),0),5);
console.log("AI_MEDIA_PRICING_POLICY_PASS disabled=true dailyFree=3 rounding=per-file");
