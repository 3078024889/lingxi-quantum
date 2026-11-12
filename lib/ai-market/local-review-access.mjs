// Explicit, expiring local read-only review. Never use for mutation authorization.
export function mayViewLocalReview({user,host,forwardedHost,origin,emails,expiresAt,now=Date.now()}) {
 if(!user?.email_confirmed_at||typeof user.email!=='string')return false;
 const expiry=Date.parse(expiresAt||'');
 if(!Number.isFinite(expiry)||expiry<=now)return false;
 try {
  const url=new URL(origin||'');
  if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||url.origin!==origin)return false;
  if(host!==url.host||(forwardedHost&&forwardedHost!==host))return false;
  return (emails||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).includes(user.email.toLowerCase());
 }catch{return false;}
}
