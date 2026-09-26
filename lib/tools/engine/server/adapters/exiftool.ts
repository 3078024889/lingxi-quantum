import {commandFor,runCommand} from "../command";
const bin=()=>commandFor("LINGXI_EXIFTOOL_BIN","exiftool");
export async function exiftoolJson(input:string){const r=await runCommand(bin(),["-json","-G1","-a","-s",input],{timeoutMs:60_000,maxOutputBytes:8*1024*1024});return JSON.parse(r.stdout) as Array<Record<string,unknown>>;}
export async function exiftoolRemoveAll(input:string,output:string){return runCommand(bin(),["-all=","-o",output,input],{timeoutMs:120_000,maxOutputBytes:2*1024*1024});}
