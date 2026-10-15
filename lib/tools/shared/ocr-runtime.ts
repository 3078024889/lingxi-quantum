"use client";
import type {Worker, LoggerMessage} from 'tesseract.js';

export const OCR_BASE='/media/ocr-7.0.0-v1';
export const OCR_LANGUAGES=['eng','chi_sim','chi_tra','jpn','kor','fra','deu','spa','por','ara'] as const;
type OcrOptions={signal?:AbortSignal;logger?:(message:LoggerMessage)=>void;initTimeoutMs?:number;recognitionTimeoutMs?:number};

/** The pinned Tesseract abort patch also terminates workers during initialization. */
export async function createOcrWorker(languages:string,options:OcrOptions={}):Promise<Worker>{
 if(!languages.split('+').every(code=>(OCR_LANGUAGES as readonly string[]).includes(code)))throw Error('OCR_LANGUAGE_UNSUPPORTED');
 const controller=new AbortController();
 const cancel=()=>controller.abort(Error('OCR_CANCELLED'));
 options.signal?.addEventListener('abort',cancel,{once:true});
 if(options.signal?.aborted)cancel();
 let timer:ReturnType<typeof setTimeout>|undefined;
 const cleanup=()=>{clearTimeout(timer);options.signal?.removeEventListener('abort',cancel)};
 const arm=(ms:number)=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(Error('OCR_TIMEOUT')),ms)};
 let worker:Worker|undefined;
 try{
  arm(options.initTimeoutMs??90_000);
  const {createWorker}=await import('tesseract.js');
  if(controller.signal.aborted)throw controller.signal.reason;
  worker=await createWorker(languages,1,{
   workerPath:`${OCR_BASE}/worker.min.js`,workerBlobURL:false,
   corePath:`${OCR_BASE}/core`,langPath:`${OCR_BASE}/lang`,
   cachePath:'lingxifield-ocr-7-v1',abortSignal:controller.signal,
   logger:options.logger??(()=>{}),errorHandler:()=>{},
  });
  clearTimeout(timer);
  const active=worker,recognize=active.recognize.bind(active),terminate=active.terminate.bind(active);
  active.recognize=async(...args:Parameters<Worker['recognize']>)=>{
   if(controller.signal.aborted)throw controller.signal.reason;
   arm(options.recognitionTimeoutMs??120_000);
   try{return await recognize(...args)}finally{clearTimeout(timer)}
  };
  active.terminate=async(...args:Parameters<Worker['terminate']>)=>{cleanup();return terminate(...args)};
  return active;
 }catch(error){cleanup();controller.abort(error);await worker?.terminate().catch(()=>{});throw error}
}
