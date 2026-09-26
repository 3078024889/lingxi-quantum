import path from "node:path";import {runCommand} from "../command";
const py=()=>process.env.LINGXI_PYTHON_BIN||"python";
const helper=()=>path.join(process.cwd(),"services","local-engine","python","faster_whisper_transcribe.py");
export async function fasterWhisper(input:string,language?:string){const args=[helper(),"--input",input];if(language)args.push("--language",language);const r=await runCommand(py(),args,{timeoutMs:30*60_000,maxOutputBytes:16*1024*1024});return JSON.parse(r.stdout) as {text:string;srt:string;language?:string;duration?:number};}
