export function validateCandidateDecision(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const {candidateKey,decision,reason}=value;
 if(typeof candidateKey!=='string'||!/^hf:(models|spaces):[\w.-]+\/[\w.-]+$/.test(candidateKey))return null;
 if(!['verified','rejected'].includes(decision))return null;
 if(typeof reason!=='string'||reason.trim().length<10||reason.trim().length>1000)return null;
 return {candidateKey,decision,reason:reason.trim()};
}
