export interface ProviderProbe{name:string;pass:boolean;details?:string}
export function providerContract(probes:ProviderProbe[]){const required=["authentication","capability","timeout","error-normalization"];const missing=required.filter(name=>!probes.some(p=>p.name===name&&p.pass));return {pass:missing.length===0,missing}}
