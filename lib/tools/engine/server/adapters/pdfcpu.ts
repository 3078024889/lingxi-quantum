import {commandFor,runCommand} from "../command";
const bin=()=>commandFor("LINGXI_PDFCPU_BIN","pdfcpu");
export async function pdfcpuValidate(input:string){return runCommand(bin(),["validate",input],{timeoutMs:60000});}
export async function pdfcpuOptimize(input:string,output:string){return runCommand(bin(),["optimize",input,output],{timeoutMs:120000});}
export async function pdfcpuMerge(output:string,inputs:string[]){return runCommand(bin(),["merge",output,...inputs],{timeoutMs:120000});}
export async function pdfcpuSplit(input:string,outDir:string){return runCommand(bin(),["split",input,outDir],{timeoutMs:120000});}
