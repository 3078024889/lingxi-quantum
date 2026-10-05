"use client";
import{SasiUserMessage}from"@/components/SasiComposerCore";
import{SasiAssistantText}from"@/components/SasiResultCore";
import type{SasiUnifiedTurn}from"@/lib/sasi/core/unified-conversation";

export function SasiUnifiedTurns({turns}:{turns:SasiUnifiedTurn[]}){
 return <>{turns.map(turn=><div key={turn.id} data-sasi-unified-turn={turn.id} data-sasi-mode={turn.mode} data-sasi-state={turn.state} className="mb-10">
  <SasiUserMessage className="mb-6">{turn.user}</SasiUserMessage>
  {turn.assistant&&<SasiAssistantText>{turn.assistant}</SasiAssistantText>}
 </div>)}</>;
}
