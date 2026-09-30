import type {Capability,CapabilityAdapter} from "./contracts";
export class CapabilityRegistry{
 private readonly adapters=new Map<string,CapabilityAdapter>();
 register(adapter:CapabilityAdapter){if(this.adapters.has(adapter.id))throw new Error("DUPLICATE_CAPABILITY_ADAPTER");this.adapters.set(adapter.id,adapter);return this;}
 candidates(capability:Capability){return [...this.adapters.values()].filter(x=>x.capabilities.has(capability));}
 get(id:string){return this.adapters.get(id);}
}
