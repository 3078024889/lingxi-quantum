// UI quote context only. Actual payment settlement requires independent server validation.
export function currencyFromCountry(country){return String(country||'').trim().toUpperCase()==='CN'?'CNY':'USD';}
