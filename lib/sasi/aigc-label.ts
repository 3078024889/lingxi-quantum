import "server-only";
import { createHash } from "node:crypto";

export const SASI_AIGC_LABEL_MODE = "sasi_aigc_v1";

export type SasiAigcMetadata = {
  AIGC: {
    Label: "1";
    ContentProducer: string;
    ProduceID: string;
    ReservedCode1: string;
    ContentPropagator: string;
    PropagateID: string;
    ReservedCode2: string;
  };
};

function asciiField(value: string, fallback: string) {
  const cleaned = value.normalize("NFKC").replace(/[^\x21\x23-\x5B\x5D-\x7E]/g, "").slice(0, 128);
  return cleaned || fallback;
}

export function createSasiAigcMetadata(produceId: string): SasiAigcMetadata {
  const producer = asciiField(process.env.SASI_CONTENT_PRODUCER_CODE ?? "LINGXIFIELD", "LINGXIFIELD");
  const id = asciiField(produceId, "UNKNOWN");
  const integrity = createHash("sha256").update(`${producer}:${id}:1`).digest("hex");
  return { AIGC: { Label: "1", ContentProducer: producer, ProduceID: id, ReservedCode1: integrity, ContentPropagator: producer, PropagateID: id, ReservedCode2: "" } };
}

function uint32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

function concat(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.byteLength; }
  return output;
}

/**
 * Adds one ISO-BMFF metadata box whose field keyword is AIGC. It is appended as
 * a top-level box so media offsets remain unchanged and players can safely
 * ignore it. The payload follows GB 45438-2025 appendix E.
 */
export function embedSasiAigcMetadata(mp4: Uint8Array, metadata: SasiAigcMetadata) {
  if (mp4.byteLength < 12 || String.fromCharCode(...mp4.slice(4, 8)) !== "ftyp") throw new Error("AIGC_LABEL_REQUIRES_MP4");
  const payload = new TextEncoder().encode(JSON.stringify(metadata));
  const type = new TextEncoder().encode("AIGC");
  const box = concat([uint32(8 + payload.byteLength), type, payload]);
  return concat([mp4, box]);
}

export function readSasiAigcMetadata(mp4: Uint8Array): SasiAigcMetadata | null {
  let offset = 0;
  while (offset + 8 <= mp4.byteLength) {
    const size = new DataView(mp4.buffer, mp4.byteOffset + offset, 4).getUint32(0, false);
    if (size < 8 || offset + size > mp4.byteLength) return null;
    const type = new TextDecoder("ascii").decode(mp4.slice(offset + 4, offset + 8));
    if (type === "AIGC") {
      try { return JSON.parse(new TextDecoder().decode(mp4.slice(offset + 8, offset + size))) as SasiAigcMetadata; }
      catch { return null; }
    }
    offset += size;
  }
  return null;
}
