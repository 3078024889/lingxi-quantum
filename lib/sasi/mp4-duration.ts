/**
 * Read the presentation duration from an MP4 movie header (moov/mvhd).
 *
 * This helper intentionally avoids BigInt literals because the repository
 * TypeScript target is lower than ES2020.
 */
export function readMp4DurationSeconds(bytes: Uint8Array): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  function u32(offset: number) {
    if (offset < 0 || offset + 4 > view.byteLength) return null;
    return view.getUint32(offset, false);
  }

  function u64AsNumber(offset: number) {
    if (offset < 0 || offset + 8 > view.byteLength) return null;
    const high = view.getUint32(offset, false);
    const low = view.getUint32(offset + 4, false);
    const value = high * 4294967296 + low;
    return Number.isSafeInteger(value) ? value : null;
  }

  function typeAt(offset: number) {
    if (offset < 0 || offset + 4 > bytes.byteLength) return "";
    return String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
  }

  function parseMvhd(payloadStart: number, payloadEnd: number): number | null {
    if (payloadStart + 20 > payloadEnd) return null;
    const version = bytes[payloadStart];

    if (version === 0) {
      const timescale = u32(payloadStart + 12);
      const duration = u32(payloadStart + 16);
      if (!timescale || duration == null || duration <= 0) return null;
      const seconds = duration / timescale;
      return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
    }

    if (version === 1) {
      if (payloadStart + 32 > payloadEnd) return null;
      const timescale = u32(payloadStart + 20);
      const duration = u64AsNumber(payloadStart + 24);
      if (!timescale || duration == null || duration <= 0) return null;
      const seconds = duration / timescale;
      return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
    }

    return null;
  }

  function scan(start: number, end: number, depth = 0): number | null {
    if (depth > 8) return null;

    let offset = start;
    while (offset + 8 <= end) {
      const size32 = u32(offset);
      if (size32 == null) return null;

      const type = typeAt(offset + 4);
      let headerSize = 8;
      let boxSize: number;

      if (size32 === 0) {
        boxSize = end - offset;
      } else if (size32 === 1) {
        const extended = u64AsNumber(offset + 8);
        if (extended == null) return null;
        boxSize = extended;
        headerSize = 16;
      } else {
        boxSize = size32;
      }

      if (boxSize < headerSize || offset + boxSize > end) return null;

      const payloadStart = offset + headerSize;
      const boxEnd = offset + boxSize;

      if (type === "mvhd") {
        return parseMvhd(payloadStart, boxEnd);
      }

      if (
        type === "moov" ||
        type === "trak" ||
        type === "mdia" ||
        type === "minf" ||
        type === "stbl" ||
        type === "edts" ||
        type === "udta" ||
        type === "meta"
      ) {
        const nestedStart = type === "meta" ? payloadStart + 4 : payloadStart;
        const found = scan(nestedStart, boxEnd, depth + 1);
        if (found != null) return found;
      }

      offset = boxEnd;
    }

    return null;
  }

  return scan(0, bytes.byteLength);
}

export function billableWholeSeconds(durationSeconds: number | null): number | null {
  if (
    durationSeconds == null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const rounded = Math.max(1, Math.round(durationSeconds));
  return Number.isSafeInteger(rounded) ? rounded : null;
}
