export const PRIMARY_HOST="lingxifield.com" as const;
export const CHINA_HOST="lingxifield.cn" as const;
export const PRIMARY_SITE=`https://${PRIMARY_HOST}` as const;
export const CHINA_SITE=`https://${CHINA_HOST}` as const;
export const PUBLIC_HOSTS=new Set<string>([PRIMARY_HOST,CHINA_HOST,`www.${PRIMARY_HOST}`,`www.${CHINA_HOST}`]);
export function barePublicHost(host:string){const h=host.trim().toLowerCase().split(":")[0];return h.startsWith("www.")?h.slice(4):h}
export function canonicalSiteForHost(_host:string){return PRIMARY_SITE}
export function absolutePrimary(pathname:string){const p=pathname.startsWith("/")?pathname:`/${pathname}`;return `${PRIMARY_SITE}${p}`}
