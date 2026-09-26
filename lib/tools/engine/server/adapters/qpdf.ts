import {commandFor,runCommand} from "../command";
const bin=()=>commandFor("LINGXI_QPDF_BIN","qpdf");
export async function qpdfCheck(input:string){return runCommand(bin(),["--check",input],{timeoutMs:60000,acceptCodes:[0,2,3]});}
export async function qpdfOptimize(input:string,output:string){return runCommand(bin(),["--object-streams=generate","--stream-data=compress",input,output],{timeoutMs:120000});}
export async function qpdfLinearize(input:string,output:string){return runCommand(bin(),["--linearize",input,output],{timeoutMs:120000});}
