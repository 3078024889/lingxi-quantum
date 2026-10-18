const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),readBaseline=require('./fixtures/read-v86-baseline.cjs');
function functions(source){const ast=ts.createSourceFile('cron.tsx',source,99,true,4);const code=ast.statements.filter(node=>ts.isFunctionDeclaration(node)&&['expandPart','parseField','parseCron','matches','cronMatches','describe'].includes(node.name?.text)).map(node=>node.getText(ast)).join('\n');return new Function(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+'\nreturn {expandPart,parseCron,cronMatches};')();}
const before=functions(readBaseline('cron'));const current=functions(fs.readFileSync('components/tools/CronParserWorkbench.tsx','utf8'));
assert.deepEqual([...before.expandPart('0/15',0,59)],[0]);assert.deepEqual([...current.expandPart('0/15',0,59)],[0,15,30,45]);assert.deepEqual([...current.expandPart('10-20/5',0,59)],[10,15,20]);
for(const bad of ['*/','*/2/3','1.5-4','1e1','0x10','1-4-5','*/0','-1','60'])assert.throws(()=>current.expandPart(bad,0,59));
for(let minute=0;minute<60;minute++){const date=new Date(2026,0,1,9,minute);assert.equal(current.cronMatches(date,current.parseCron('0/15 9 * * *')),minute%15===0);}
const cron=current.parseCron('0 0 13 * 5');for(const [day,expected]of [[9,true],[13,true],[10,false]])assert.equal(current.cronMatches(new Date(2026,0,day,0,0),cron),expected);
console.log('PASS: actual baseline N/step loses later times; start/range step expansion, strict syntax, complete hour matching and day-of-month/day-of-week OR contract verified.');

for(const expression of ['0 9 * * 1','0 9 */1 * 1'])for(let day=18;day<=31;day++){const date=new Date(2026,9,day,9,0);assert.equal(current.cronMatches(date,current.parseCron(expression)),date.getDay()===1);}
for(let day=1;day<=31;day++){const date=new Date(2026,9,day,9,0);assert.equal(current.cronMatches(date,current.parseCron('0 9 */2 * */2')),day%2===1&&date.getDay()%2===0);}
assert.equal(before.cronMatches(new Date(2026,9,18,9,0),before.parseCron('0 9 */1 * 1')),true);
console.log('PASS: wildcard day/week steps intersect; literal restrictions retain union; Sunday baseline reproduces unwanted daily runs.');
