import {commandFor,runCommand} from "../command";
const ffmpeg=()=>commandFor("LINGXI_FFMPEG_BIN","ffmpeg");
export async function extractAudio(input:string,outputWav:string){return runCommand(ffmpeg(),["-y","-i",input,"-vn","-ac","1","-ar","16000","-c:a","pcm_s16le",outputWav],{timeoutMs:15*60_000,maxOutputBytes:2*1024*1024});}
export async function transcodeMedia(input:string,output:string,args:string[]=[]){return runCommand(ffmpeg(),["-y","-i",input,...args,output],{timeoutMs:30*60_000,maxOutputBytes:2*1024*1024});}
