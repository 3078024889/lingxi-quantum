import type {QpdfRunner,QpdfRunOptions,QpdfRunOneOptions} from 'qpdf-run';
let pending:Promise<QpdfRunner>|null=null;
/** Explicit origin avoids bundler-dependent file: bases inside package URL helpers. */
export function getQpdfRuntime():Promise<QpdfRunner>{
 if(!pending)pending=import('qpdf-run').then(async module=>{
  const url=(file:string)=>new URL(`/media/qpdf-0.2.1-v1/${file}`,window.location.origin).href;
  const raw=await module.createQpdfRunner({workerUrl:url('worker.js'),qpdfJsUrl:url('qpdf.js'),wasmUrl:url('qpdf.wasm'),timeoutMs:30000});
  let queue:Promise<unknown>=Promise.resolve();
  const run=(options:QpdfRunOptions)=>{
   const task=queue.then(()=>raw.run(options)).catch(async error=>{pending=null;await raw.destroy();throw error});queue=task.catch(()=>{});return task;
  };
  return {run,async runOne(options:QpdfRunOneOptions){const inputName=options.inputName||'input.pdf',outputName=options.outputName||'output.pdf';const result=await run({inputs:{[inputName]:options.input},args:options.args,outputs:[outputName]});const bytes=result.outputs[outputName];if(!bytes?.length)throw Error('QPDF_OUTPUT_MISSING');return bytes},async destroy(){pending=null;await raw.destroy()}};
 }).catch(error=>{pending=null;throw error});
 return pending;
}
