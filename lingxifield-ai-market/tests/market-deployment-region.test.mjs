import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const config=JSON.parse(readFileSync(new URL('vercel.json',root),'utf8'));

test('server functions run in Tokyo close to the Supabase ap-northeast-1 database',()=>{
 assert.deepEqual(config.regions,['hnd1']);
 assert.equal(config.$schema,'https://openapi.vercel.sh/vercel.json');
});
