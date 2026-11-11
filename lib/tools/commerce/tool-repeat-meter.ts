/** Pure policy for client-side operation gating; server remains final authority. */
export function shouldClaimToolRun(
  uploadedSignature:string,
  lastProcessedSignature:string,
  currentSignature:string,
):boolean {
  if(!currentSignature)return false;
  // No matching upload claim, or already processed this uploaded batch.
  return uploadedSignature!==currentSignature||lastProcessedSignature===currentSignature;
}
