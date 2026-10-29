/** Next.js searchParams may contain repeated keys as arrays. Never pass those into string-only catalog functions. */
export function singleQueryValue(value:string|string[]|undefined,maxLength:number):string{
 return typeof value==="string"?value.slice(0,maxLength):"";
}
