/**
 * V340 publication guard.
 *
 * This layer deliberately does not translate modern prose by word replacement.
 * Living prose must already have been composed from evidence, cost, lived scene
 * and falsifier. The guard only protects evidence blocks and normalizes layout.
 */
export const CLASSICAL_EDITORIAL_VERSION = "V340.1-LIVING-WEB";
export const CLASSICAL_EDITORIAL_MARKER = `<!-- classical-editorial:${CLASSICAL_EDITORIAL_VERSION} -->`;

const BANNED = ["这说明","这意味着","可能表明","综合来看","总体而言","从某个角度","你需要意识到","在一定程度上"];

function normalize(value:string){return value.replace(/\r\n?/g,"\n").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").replace(/，，+/g,"，").trim();}

export function auditLivingLanguage(value:string){
  const banned=BANNED.filter(term=>value.includes(term));
  const mechanical=["结构：","机制：","现实：","行动："].filter(term=>value.includes(term));
  return{ok:banned.length===0&&mechanical.length===0,banned,mechanical};
}

/** Compatibility entry point for older callers. No lexical classicalization. */
export function classicalizeChineseSection(value:string,_sectionIndex=0){return normalize(value);}

export function stampClassicalReport(value:string){const normalized=normalize(value);return normalized.includes(CLASSICAL_EDITORIAL_MARKER)?normalized:`${CLASSICAL_EDITORIAL_MARKER}\n${normalized}`;}
