// Reject requests with no session before loading Next.js on the free Worker.
// Presence is NOT authentication: every supplied credential goes to the original
// server handler for verification and authorization.
export function anonymousPrivateApi(request) {
  const path = new URL(request.url).pathname;
  if (!['GET', 'HEAD'].includes(request.method) || ![
    '/api/money/summary', '/api/sasi/account',
    '/api/sasi/marketplace/seller', '/api/sasi/marketplace/my-orders'
  ].includes(path)) return null;
  const hasSession = (request.headers.get('cookie') || '').split(';').some(part =>
    /^sb-[a-z0-9]+-auth-token(?:\.\d+)?=.+$/i.test(part.trim()));
  if (hasSession || request.headers.has('authorization')) return null;
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({error:'UNAUTHORIZED'}), {
    status:401, headers:{'content-type':'application/json; charset=utf-8',
      'cache-control':'private, no-store', 'x-content-type-options':'nosniff'}
  });
}
