import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("scripts/ai-discovery/refresh-github.mjs","utf8");
test("refresh fetches from official GitHub API only",()=>{assert.match(source,/https:\/\/api\.github\.com\/repos\//);assert.match(source,/body\.full_name/);assert.match(source,/stargazers_count/);assert.match(source,/forks_count/);});
test("refresh is fail-closed and atomic",()=>{assert.match(source,/AbortSignal\.timeout/);assert.match(source,/response\.ok/);assert.match(source,/renameSync\(tmp,path\)/);assert.match(source,/randomUUID/);assert.match(source,/await wait\(1000\)/);});
test("no automatic publish or GitHub push from refresh script",()=>{assert.doesNotMatch(source,/git push|create_pull_request|execSync|child_process/);});
