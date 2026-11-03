export type VoiceDurationPlan={needsFit:boolean;tempo:number;filter:string};
/** Whole-track tempo fit only; never claim lip sync or word alignment.
 * Reject impossible durations and excessive tempo to avoid chopping the voice.
 */
export function planVoiceDurationFit(audioSeconds:number,videoSeconds:number):VoiceDurationPlan{
 if(!Number.isFinite(audioSeconds)||!Number.isFinite(videoSeconds)||
    audioSeconds<=0||videoSeconds<0.3||videoSeconds>7200||audioSeconds>14400)
  throw Error("DUB_DURATION_UNVERIFIED");
 if(audioSeconds<=videoSeconds+0.04)return {needsFit:false,tempo:1,filter:"apad"};
 const target=Math.max(.2,videoSeconds-Math.min(.07,videoSeconds*.01));
 const tempo=audioSeconds/target;
 if(!Number.isFinite(tempo)||tempo<.5||tempo>1.8)throw Error("DUB_AUDIO_TOO_LONG_FOR_VIDEO");
 return {needsFit:true,tempo,filter:"atempo="+tempo.toFixed(6)+",apad"};
}
