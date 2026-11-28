import 'server-only';
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
export const TOOL_DEVICE_COOKIE='lx-tool-device';
function secret(){const value=process.env.LINGXIFIELD_PRIVACY_HASH_SECRET;if(!value||value.length<32)throw Error('DEVICE_SECRET_UNAVAILABLE');return value}
function mac(domain:string,value:string){return createHmac('sha256',secret()).update(domain+value).digest('hex')}
export function readToolDevice(token:string|undefined){
 if(!token)return null;
 const match=/^v1\.([a-f0-9-]{36})\.([a-f0-9]{64})$/.exec(token);
 if(!match||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(match[1]))return null;
 const expected=Buffer.from(mac('tool-device-signature:v1:',match[1]),'hex'),actual=Buffer.from(match[2],'hex');
 if(!timingSafeEqual(actual,expected))return null;
 return mac('tool-device-usage:v1:',match[1]);
}
export function newToolDevice(){const id=randomUUID();return `v1.${id}.${mac('tool-device-signature:v1:',id)}`}
