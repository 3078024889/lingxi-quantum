import type {ContinuitySnapshot} from "./dna";import {continuityContext} from "./dna";import type {MemoryItem} from "./memory-policy";import {usableMemory} from "./memory-policy";
export function buildContinuity(snapshot:ContinuitySnapshot,memory:MemoryItem[]){return {context:continuityContext(snapshot),projectMemory:usableMemory(memory,"project"),personMemory:usableMemory(memory,"person")}}
