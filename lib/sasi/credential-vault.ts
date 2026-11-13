import "server-only";
import {createCipheriv,createDecipheriv,createHash,randomBytes} from "crypto";
export const BYOK_PROVIDERS=["openai","xai","anthropic","gemini","deepseek","openrouter","luma","volcengine","aliyun","compatible"] as const;
export type ByokProvider=typeof BYOK_PROVIDERS[number];
function masterKey(){const raw=process.env.SASI_BYOK_ENCRYPTION_KEY?.trim();if(!raw)throw new Error("SASI_BYOK_ENCRYPTION_KEY_MISSING");const key=Buffer.from(raw,"base64");if(key.length!==32)throw new Error("SASI_BYOK_ENCRYPTION_KEY_INVALID");return key}
function aad(version:"v1"|"v2",userId:string,provider:ByokProvider){return Buffer.from(`sasi-byok:${version.slice(1)}:${userId}:${provider}`,"utf8")}
export function byokVaultConfigured(){try{return masterKey().length===32}catch{return false}}
export function validByokProvider(v:unknown):v is ByokProvider{return typeof v==="string"&&(BYOK_PROVIDERS as readonly string[]).includes(v)}
export function validateProviderKey(_provider:ByokProvider,v:unknown){if(typeof v!=="string")return"KEY_REQUIRED";const key=v.trim();if(key.length<8||key.length>1024||/[\r\n\0]/.test(key))return"KEY_FORMAT_INVALID";return null}
export function encryptProviderKey(userId:string,provider:ByokProvider,plaintext:string){const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",masterKey(),iv);cipher.setAAD(aad("v2",userId,provider));const ciphertext=Buffer.concat([cipher.update(plaintext.trim(),"utf8"),cipher.final()]),tag=cipher.getAuthTag();return["v2",iv.toString("base64url"),tag.toString("base64url"),ciphertext.toString("base64url")].join(".")}
export function decryptProviderKey(userId:string,provider:ByokProvider,payload:string){const[version,ivText,tagText,ciphertextText]=payload.split(".");if((version!=="v1"&&version!=="v2")||!ivText||!tagText||!ciphertextText)throw new Error("BYOK_CIPHERTEXT_INVALID");const v=version as "v1"|"v2",d=createDecipheriv("aes-256-gcm",masterKey(),Buffer.from(ivText,"base64url"));d.setAAD(aad(v,userId,provider));d.setAuthTag(Buffer.from(tagText,"base64url"));return Buffer.concat([d.update(Buffer.from(ciphertextText,"base64url")),d.final()]).toString("utf8")}
export function providerKeyFingerprint(v:string){return createHash("sha256").update(v.trim()).digest("hex").slice(0,16)}
export function providerKeyHint(v:string){const key=v.trim();return`••••${key.slice(-4)}`}
