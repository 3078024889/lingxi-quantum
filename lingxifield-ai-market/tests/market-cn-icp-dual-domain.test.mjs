import test from 'node:test';
import assert from 'node:assert/strict';
import {chinaMarketHost,verifiedFiling} from '../lib/market-filing.ts';

test('only globalsiai.cn hosts display mainland filing',()=>{
 for(const x of ['globalsiai.cn','www.globalsiai.cn','GLOBALSIAI.CN'])assert.equal(chinaMarketHost(x),true);
 for(const x of ['globalsiai.com','www.globalsiai.com','globalsiai.cn.evil.test','globalsiai.cn:443',''])assert.equal(chinaMarketHost(x),false);
});
test('Chinese ICP filing accepts real record number with suffix and rejects injections',()=>{
 assert.equal(verifiedFiling('湘ICP备2026031465号-4','icp'),'湘ICP备2026031465号-4');
 for(const bad of ['', '湘ICP备2026031465号-4<script>', '湘ICP备2026031465号-4zzz','https://fake.example','湘ICP备2026031465号-99999'])assert.equal(verifiedFiling(bad,'icp'),null);
});
