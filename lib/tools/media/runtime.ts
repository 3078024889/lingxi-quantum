"use client";
import {FFmpeg} from "@ffmpeg/ffmpeg";
const BASE="/media/ffmpeg-0.12.10";
// The loader fetches and validates the same-origin engine once. Avoid a separate
// full WASM probe and unreleased Blob copies of the engine on every operation.
export async function createFfmpegRuntime(onProgress?:(p:number)=>void){
 if(typeof WebAssembly==='undefined')throw Error('FFMPEG_RUNTIME_UNAVAILABLE');
 const ffmpeg=new FFmpeg();
 if(onProgress)ffmpeg.on('progress',({progress})=>onProgress(Math.max(0,Math.min(1,Number(progress)||0))));
 try{await ffmpeg.load({coreURL:new URL(`${BASE}/ffmpeg-core.js`,location.origin).href,wasmURL:new URL(`${BASE}/ffmpeg-core.wasm`,location.origin).href});return ffmpeg}
 catch(error){try{ffmpeg.terminate()}catch{}throw error}
}
