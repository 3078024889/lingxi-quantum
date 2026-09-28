import "server-only";
import {capabilityManifests} from "@/lib/sasi-kernel/registry";
import {nativeModelCatalogPublic} from "@/lib/sasi-kernel/models/catalog";
import type {SasiV5Stage} from "./types";
export type SasiV5CapabilityRegistryEntry={id:string;version:string;stage:SasiV5Stage;executionClass:string;localFirst:boolean;deterministic:boolean;externalOptional:boolean};
export function sasiV5CapabilityRegistry():SasiV5CapabilityRegistryEntry[]{return capabilityManifests().map(m=>({id:m.id,version:m.version,stage:"stable",executionClass:m.executionClass,localFirst:m.localFirst,deterministic:m.deterministic,externalOptional:m.externalOptional}))}
export function sasiV5NativeModelRegistry(){return nativeModelCatalogPublic().map(model=>({...model,stage:"candidate" as const,productionDefault:false,reason:"Requires current hardware, quality and license verification before production promotion."}))}
