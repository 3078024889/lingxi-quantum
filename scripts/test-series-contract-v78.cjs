const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const cache=new Map();
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const module={exports:{}};cache.set(file,module.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const relative=name=>{if(name==='server-only')return {};if(/resilient-text|step-store|run-store|supabase\/admin/.test(name))return {};return load(name.startsWith('@/')?name.slice(2)+'.ts':path.resolve(path.dirname(file),name)+'.ts')};
 vm.runInNewContext(code,{module,exports:module.exports,require:relative},{filename:file});return module.exports;
}
const {seriesSpecification}=load('lib/sasi/series-specification.ts');
const {parseEpisodePlan}=load('lib/sasi/durable/drama-episode-job.ts');
const {validateSeriesShots}=load('lib/sasi/series-plan.ts');
const {videoChargeMinor}=load('lib/sasi/pricing-v49.ts');
const spec=seriesSpecification('先计划20集，改成50集，每集1分钟，16:9');
assert.equal(spec.episodes,50);assert.equal(spec.totalSeconds,3000);assert.equal(spec.platform720Minor,60000);assert.equal(spec.platform1080Minor,90000);
const all=[];
for(let episode=1;episode<=50;episode++){
 const shots=Array.from({length:5},(_,i)=>({episode,duration:12,prompt:`Episode ${episode}, scene ${i+1}: continue the approved characters, voice and action.`,assetIds:[]}));
 all.push(...parseEpisodePlan(JSON.stringify({shots}),episode,60));
 const broken=[{...shots[0],episode:episode===50?1:episode+1},...shots.slice(1)];
 assert.throws(()=>parseEpisodePlan(JSON.stringify({shots:broken}),episode,60));
 assert.throws(()=>parseEpisodePlan(JSON.stringify({shots:shots.slice(1)}),episode,60));
 assert.throws(()=>parseEpisodePlan(JSON.stringify({shots:[{...shots[0],assetIds:['foreign-private-asset']},...shots.slice(1)]}),episode,60));
}
assert.equal(validateSeriesShots(all,12).length,250);
assert.throws(()=>validateSeriesShots(Array.from({length:11},()=>({episode:1,duration:12,prompt:'A complete dramatic scene.',assetIds:[]})),12),/EPISODE_EXCEEDS_120_SECONDS/);
assert.equal(all.reduce((sum,shot)=>sum+videoChargeMinor(shot.duration,'720p','CNY'),0),60000);
assert.equal(all.reduce((sum,shot)=>sum+videoChargeMinor(shot.duration,'1080p','CNY'),0),90000);
for(const text of ['0集，每集1分钟','51集，每集1分钟','50集，每集2分钟','2 episodes, per episode 7 seconds'])assert.throws(()=>seriesSpecification(text));
console.log('PASS: 50 distinct episode contracts, 250 shots, exact 3000-second duration, whole/clip quote agreement at 720p and 1080p, wrong episode/duration/private references rejected. Parser tests use synthetic plans; no supplier video was generated.');
