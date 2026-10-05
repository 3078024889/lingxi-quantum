export type SasiUnifiedMode="drama"|"website"|"book"|"learning"|"research";
export type SasiTurnState="pending"|"streaming"|"complete"|"needs-connection"|"failed";
export type SasiArtifactRef={id:string;kind:"website"|"video"|"document"|"source"|"file";label?:string;url?:string};
export type SasiUnifiedTurn={
 id:string;
 user:string;
 assistant:string;
 mode:SasiUnifiedMode;
 state:SasiTurnState;
 createdAt:string;
 updatedAt:string;
 runId?:string|null;
 projectId?:string|null;
 artifacts?:SasiArtifactRef[];
};

export function createUnifiedTurn(user:string,mode:SasiUnifiedMode):SasiUnifiedTurn{
 const now=new Date().toISOString();
 return {
  id:typeof crypto!=="undefined"&&"randomUUID"in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`,
  user,assistant:"",mode,state:"pending",createdAt:now,updatedAt:now,runId:null,projectId:null,artifacts:[]
 };
}

export function completeUnifiedTurn(turn:SasiUnifiedTurn,assistant:string,extra:Partial<SasiUnifiedTurn>={}):SasiUnifiedTurn{
 return {...turn,...extra,assistant,state:"complete",updatedAt:new Date().toISOString()};
}

export function failUnifiedTurn(turn:SasiUnifiedTurn,state:"needs-connection"|"failed"):SasiUnifiedTurn{
 return {...turn,state,updatedAt:new Date().toISOString()};
}
