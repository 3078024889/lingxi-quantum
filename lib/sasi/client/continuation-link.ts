export function continuationPath(threadId:string,mode='chat',projectId?:string|null){
 const params=new URLSearchParams();
 if(/^[0-9a-f-]{36}$/i.test(threadId))params.set('threadId',threadId);
 if(['chat','image','drama','website','book','learning','research'].includes(mode))params.set('mode',mode);
 if(projectId&&/^[0-9a-f-]{36}$/i.test(projectId))params.set('projectId',projectId);
 return '/sasi'+(params.size?'?'+params:'');
}
export function connectionLink(threadId:string,mode='chat',projectId?:string|null){
 return '/sasi/connections?next='+encodeURIComponent(continuationPath(threadId,mode,projectId));
}
export function safeContinuation(value:string|null){
 if(!value||!value.startsWith('/sasi?'))return '/sasi';
 try{const url=new URL(value,'https://lingxifield.com');if(url.origin!=='https://lingxifield.com'||url.pathname!=='/sasi')return '/sasi';return continuationPath(url.searchParams.get('threadId')||'',url.searchParams.get('mode')||'chat',url.searchParams.get('projectId'));}catch{return '/sasi'}
}
