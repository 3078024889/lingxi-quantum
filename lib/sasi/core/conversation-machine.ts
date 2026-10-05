import type{SasiUnifiedMode,SasiTurnState}from"./unified-conversation";

export type ConversationEvent=
 |{type:"USER_SUBMIT";turnId:string;mode:SasiUnifiedMode}
 |{type:"RUN_STARTED";turnId:string;runId:string}
 |{type:"PARTIAL_RESULT";turnId:string}
 |{type:"RESULT_READY";turnId:string}
 |{type:"NEEDS_CONNECTION";turnId:string}
 |{type:"RUN_FAILED";turnId:string}
 |{type:"RETRY";turnId:string};

export type ConversationTurnMachine={state:SasiTurnState;attempt:number;runId:string|null};

export function reduceConversationTurn(current:ConversationTurnMachine,event:ConversationEvent):ConversationTurnMachine{
 switch(event.type){
  case"USER_SUBMIT":return{state:"pending",attempt:0,runId:null};
  case"RUN_STARTED":return{state:"pending",attempt:current.attempt+1,runId:event.runId};
  case"PARTIAL_RESULT":return{...current,state:"streaming"};
  case"RESULT_READY":return{...current,state:"complete"};
  case"NEEDS_CONNECTION":return{...current,state:"needs-connection"};
  case"RUN_FAILED":return{...current,state:"failed"};
  case"RETRY":return{...current,state:"pending",attempt:current.attempt+1};
 }
}
