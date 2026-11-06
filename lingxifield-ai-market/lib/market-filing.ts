export function chinaMarketHost(host:string|null|undefined):boolean {
 const raw=(host||'').trim().toLowerCase();
 return raw==='globalsiai.cn'||raw==='www.globalsiai.cn';
}
export function verifiedFiling(value:string|undefined,kind:'icp'|'police'):string|null {
 const s=(value||'').trim();
 if(s.length>64||/[<>]/.test(s))return null;
 if(kind==='icp')return /^[\p{Script=Han}]{1,8}ICP备\d{6,12}号(?:-\d{1,4})?$/u.test(s)?s:null;
 return /^[\p{Script=Han}]{1,6}公网安备\s*\d{13,15}号?$/u.test(s)?s:null;
}
