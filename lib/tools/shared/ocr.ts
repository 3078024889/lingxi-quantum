import {createOcrWorker} from './ocr-runtime';
export async function ocrImage(file:File,lang='eng+chi_sim'){const worker=await createOcrWorker(lang);try{const r=await worker.recognize(file);return r.data.text;}finally{await worker.terminate();}}
