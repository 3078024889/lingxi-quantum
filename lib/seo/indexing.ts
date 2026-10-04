/** Private/transactional pages can be crawled to see noindex, never indexed. */
export function privateSearchPath(path:string){
 return /^\/(?:account|admin|auth|checkout|checkout-usd|share)(?:\/|$)/.test(path)
  || /^\/tools\/(?:admin|pay)(?:\/|$)/.test(path)
  || /^\/tools\/burn-after-read\/.+/.test(path)
  || /^\/sasi\/(?:connections|chat|operator|project-dna)(?:\/|$)/.test(path)
  || /^\/(?:ai-wallet|sasi\/pricing)(?:\/|$)/.test(path)
  || /^\/paypal\/(?:return|cancel)(?:\/|$)/.test(path);
}
