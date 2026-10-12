const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const taskRoot=fs.mkdtempSync(path.join(os.tmpdir(),'lingxi-path-test-'));const outer=fs.mkdtempSync(path.join(os.tmpdir(),'lingxi-path-outer-'));const exportsOut={};
try{
 const js=ts.transpileModule(fs.readFileSync('lib/tools/engine/server/safe-path.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInNewContext(js,{exports:exportsOut,require,process:{env:{LINGXI_ENGINE_WORK_ROOT:taskRoot}},Error});
 fs.writeFileSync(path.join(taskRoot,'input.txt'),'sample');fs.writeFileSync(path.join(outer,'private.txt'),'private');
 assert.equal(exportsOut.assertSafeLocalPath(path.join(taskRoot,'input.txt'),'read'),path.join(taskRoot,'input.txt'));
 assert.throws(()=>exportsOut.assertSafeLocalPath(path.join(outer,'private.txt'),'read'),/OUTSIDE_WORK_ROOT/);
 assert.throws(()=>exportsOut.assertSafeLocalPath(taskRoot,'write'),/OUTPUT_ROOT_DENIED/);
 exportsOut.assertSafeLocalPath(path.join(taskRoot,'outputs','result.txt'),'write');
 fs.symlinkSync(outer,path.join(taskRoot,'escape'),'junction');
 assert.throws(()=>exportsOut.assertSafeLocalPath(path.join(taskRoot,'escape','private.txt'),'read'),/SYMLINK_DENIED/);
 assert.throws(()=>exportsOut.assertSafeLocalPath(path.join(taskRoot,'escape','result.txt'),'write'),/SYMLINK_DENIED/);
 console.log('PASS: approved input/output, outside-root traversal and read/write junction escape checks.');
}finally{for(const target of [taskRoot,outer]){assert.equal(path.dirname(path.resolve(target)),path.resolve(os.tmpdir()));assert.match(path.basename(target),/^lingxi-path-(test|outer)-/);fs.rmSync(target,{recursive:true,force:true})}}
