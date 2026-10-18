"use client";
import {readPptx} from '@/lib/files/pptx-reader';
export async function pptxToText(file:File){
 const {text,slides}=await readPptx(file);
 return {name:`${file.name.replace(/\.pptx$/i,'')||'presentation'}.txt`,blob:new Blob([text],{type:'text/plain;charset=utf-8'}),slides,characters:text.length};
}
