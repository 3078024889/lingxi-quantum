import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const observations=JSON.parse(readFileSync("lib/ai-discovery/github-observations.json","utf8"));
test("real GitHub observations are source linked and not marketed as users",()=>{assert.ok(observations.length>=4);for(const r of observations){assert.match(r.sourceUrl,/^https:\/\/api\.github\.com\/repos\//);assert.ok(Number.isInteger(r.stars)&&r.stars>=0);assert.ok(Number.isInteger(r.forks)&&r.forks>=0);assert.ok(!Number.isNaN(Date.parse(r.observedAt)));assert.equal(r.reviewStatus,"raw_api_observation");assert.match(r.metricDefinition,/not users or downloads/);}});
test("archived repositories are disclosed",()=>{assert.ok(observations.some(x=>x.archived));assert.match(readFileSync("app/ai/open-source/page.tsx","utf8"),/Archived repository/);});
