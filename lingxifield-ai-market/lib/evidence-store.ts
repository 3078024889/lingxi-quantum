import "server-only";
import raw from '../data/evidence.json';
import { EvidenceRecord, evidenceIsValid } from './evidence';
export function getPublicEvidence(): EvidenceRecord[] {
 return (raw as EvidenceRecord[]).filter(evidenceIsValid).filter(r => r.status === 'verified');
}
