export function redactOperationalError(error:unknown){
 const raw=error instanceof Error?error.message:String(error??"UNKNOWN");
 return raw
  .replace(/Bearer\s+\S+/gi,"Bearer [REDACTED]")
  .replace(/((?:api[_-]?key|token|secret|authorization)\s*[:=]\s*)[^\s,;]+/gi,"$1[REDACTED]")
  .replace(/\b(sk|rk|pk)-[A-Za-z0-9_-]{8,}\b/g,"$1-[REDACTED]")
  .slice(0,240);
}
