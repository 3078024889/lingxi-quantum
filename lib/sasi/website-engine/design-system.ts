export type DesignTokens={background:string;surface:string;surfaceElevated:string;textPrimary:string;textSecondary:string;border:string;accent:string;success:string;warning:string;danger:string;input:string;overlay:string};
const HEX=/^#[0-9a-f]{6}$/i;
export function validateTokens(t:DesignTokens){for(const[k,v]of Object.entries(t))if(!HEX.test(v))throw new Error(`DESIGN_TOKEN_INVALID:${k}`);return t}
export function cssVariables(t:DesignTokens){return`:root{${Object.entries(t).map(([k,v])=>`--lx-${k}:${v}`).join(";")}}`}
