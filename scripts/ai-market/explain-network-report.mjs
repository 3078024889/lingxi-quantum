// Analyze a local Windows network report without pretending that this proves a cause.
import{readFile}from'node:fs/promises';
export function diagnose(r){
 const hosts=new Map((r.Checks||[]).map(x=>[x.Host,x]));
 const hf=hosts.get('huggingface.co'),gh=hosts.get('github.com');
 if(!hf)return 'MISSING_HF_PROBE';
 if(!hf.DNS)return 'HUGGINGFACE_DNS_UNAVAILABLE';
 if(!hf.TCP443)return gh?.TCP443?'HUGGINGFACE_SPECIFIC_TCP_BLOCK_OR_RESET':'GENERAL_TCP_OR_PROXY_ISSUE';
 return 'TCP_REACHABLE_CHECK_TLS_PROXY_AND_CERTIFICATES';
}
if(process.argv[1]&&process.argv[1].endsWith('explain-network-report.mjs')){
 const path=process.argv[2];if(!path)throw Error('REPORT_PATH_REQUIRED');
 console.log(diagnose(JSON.parse(await readFile(path,'utf8'))));
}
