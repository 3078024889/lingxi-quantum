import {detectMiniPaymentContext,miniPaymentBridge} from './payment-client';

export function publicMiniSharePath(input:string){
 try{
  const url=new URL(input,'https://lingxifield.cn');
  if(!['https://lingxifield.cn','https://lingxifield.com'].includes(url.origin))return '/';
  const path=url.pathname;
  if(path==='/sasi'){
   const mode=url.searchParams.get('mode');
   return mode&&['chat','image','drama','website','book','learning','research'].includes(mode)?'/sasi?mode='+mode:'/sasi';
  }
  return path==='/'||path==='/tools'||/^\/tools\/[a-z0-9-]+$/.test(path)||['/ai-knowledge','/ai-learning','/ai-research'].includes(path)?path:'/';
 }catch{return '/'}
}
export async function openMiniShare(title='灵犀场 LINGXIFIELD'){
 if(!await detectMiniPaymentContext())return false;
 const bridge=await miniPaymentBridge();if(!bridge)return false;
 const path=publicMiniSharePath(location.href);
 return new Promise<boolean>(resolve=>{const timer=setTimeout(()=>resolve(false),5000);bridge.navigateTo({url:'/pages/share/index?path='+encodeURIComponent(path)+'&title='+encodeURIComponent(title.slice(0,100)),success:()=>{clearTimeout(timer);resolve(true)},fail:()=>{clearTimeout(timer);resolve(false)}})});
}
