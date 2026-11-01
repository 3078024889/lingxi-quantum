/** Compression should never claim to save bytes when the encoded result is larger.
 * When resizing/re-timing was explicitly requested, preserve that requested transform.
 */
export type CompressionDelivery="smaller"|"original"|"larger-transformed";
export function chooseCompressionDelivery(sourceBytes:number,encodedBytes:number,geometryChanged:boolean):CompressionDelivery{
 if(!Number.isSafeInteger(sourceBytes)||sourceBytes<=0||!Number.isSafeInteger(encodedBytes)||encodedBytes<=0)
  throw new RangeError("INVALID_COMPRESSION_SIZE");
 if(encodedBytes<sourceBytes)return "smaller";
 return geometryChanged?"larger-transformed":"original";
}
