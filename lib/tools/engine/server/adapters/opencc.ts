import {commandFor,runCommand} from "../command";
const bin=()=>commandFor("LINGXI_OPENCC_BIN","opencc");
export async function openccFile(input:string,output:string,config="t2s.json"){return runCommand(bin(),["-i",input,"-o",output,"-c",config],{timeoutMs:60_000,maxOutputBytes:2*1024*1024});}
export async function openccText(text:string,config="t2s.json"){const r=await runCommand(bin(),["-c",config],{timeoutMs:60_000,maxOutputBytes:4*1024*1024,stdin:text});return {text:r.stdout};}
