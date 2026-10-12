const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
const exportsValue={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/developer-data.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsValue});
const {convertIntegerBase:base,csvToJson:csv}=exportsValue;
for(const integer of ['9007199254740993','-123456789012345678901234567890','0','255']){const hex=base(integer,10,16);assert.equal(hex,BigInt(integer).toString(16).toUpperCase());assert.equal(base(hex,16,10),integer)}
assert.equal(base('ZZ',36,10),'1295');for(const input of ['12x','2','1.5',''])assert.throws(()=>base(input,2,16));for(const radix of [1,37,2.5,NaN])assert.throws(()=>base('10',radix,16));
const result=csv('\uFEFFname,note\r\n灵犀场,"line one\r\nline two, ""quoted"""\r\n');assert.deepEqual(JSON.parse(JSON.stringify(result)),[{name:'灵犀场',note:'line one\r\nline two, "quoted"'}]);
for(const invalid of ['a,a\n1,2','a,b\n1','a,b\n1,2,3','a,b\n1,"unterminated','a,b\n1,"closed"junk'])assert.throws(()=>csv(invalid));assert.deepEqual(JSON.parse(JSON.stringify(csv('a,b\n"",value'))),[{a:'',b:'value'}]);
console.log('PASS: exact large signed integer round trips, radix/digit rejection, quoted Unicode multiline CSV, escaped quotes/BOM, malformed records rejected instead of losing data.');
