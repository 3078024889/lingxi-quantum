import {DOCUMENT_OPERATIONS} from "./document-engine-contract";import {IMAGE_OPERATIONS} from "./image-engine-contract";import {VIDEO_OPERATIONS} from "./video-engine-contract";import {WEB_OPERATIONS} from "./web-engine-contract";import type {EngineKind} from "./contracts";
const ops:Partial<Record<EngineKind,readonly string[]>>={document:DOCUMENT_OPERATIONS,image:IMAGE_OPERATIONS,video:VIDEO_OPERATIONS,web:WEB_OPERATIONS};
export function operationAllowed(kind:EngineKind,operation:string){const allowed=ops[kind];return allowed?allowed.includes(operation):true}
