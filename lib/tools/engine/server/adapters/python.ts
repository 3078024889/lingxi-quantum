import path from "node:path";import {runCommand} from "../command";
const py=()=>process.env.LINGXI_PYTHON_BIN||"python";
function helper(name:string){return path.join(process.cwd(),"services","local-engine","python",name)}
export async function paddleOcr(input:string,lang="ch"){const r=await runCommand(py(),[helper("paddle_ocr.py"),"--input",input,"--lang",lang],{timeoutMs:20*60_000,maxOutputBytes:8*1024*1024});return JSON.parse(r.stdout)}
export async function argosTranslate(text:string,from:string,to:string){const r=await runCommand(py(),[helper("argos_translate.py"),"--from",from,"--to",to],{timeoutMs:120000,maxOutputBytes:8*1024*1024,stdin:text});return JSON.parse(r.stdout)}
export async function opencvInpaint(input:string,mask:string,output:string){return runCommand(py(),[helper("opencv_inpaint.py"),"--input",input,"--mask",mask,"--output",output],{timeoutMs:10*60_000,maxOutputBytes:2*1024*1024});}
