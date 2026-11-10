export type WalletLedgerCurrency="CNY"|"USD";
export type WalletLedgerSource="sasi"|"ai";
export type WalletLedgerPosition={createdAt:string;id:string};
export type WalletLedgerCursor={
 v:2;
 currency:WalletLedgerCurrency;
 snapshotAt:string;
 sasiAfter:WalletLedgerPosition|null;
 aiAfter:WalletLedgerPosition|null;
};
export type WalletLedgerSortableRow={id:string;created_at:string;sourceKey:WalletLedgerSource};

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validPosition(value:unknown,snapshotAt:string):value is WalletLedgerPosition|null{
 if(value===null)return true;
 if(!value||typeof value!=="object")return false;
 const position=value as Record<string,unknown>;
 if(typeof position.createdAt!=="string"||!Number.isFinite(Date.parse(position.createdAt)))return false;
 if(Date.parse(position.createdAt)>Date.parse(snapshotAt))return false;
 return typeof position.id==="string"&&UUID.test(position.id);
}

export function encodeWalletLedgerCursor(value:WalletLedgerCursor):string{
 return Buffer.from(JSON.stringify(value),"utf8").toString("base64url");
}

export function decodeWalletLedgerCursor(raw:string|null,currency:WalletLedgerCurrency):WalletLedgerCursor|null{
 if(!raw||raw.length>2048)return null;
 try{
  const decoded=Buffer.from(raw,"base64url").toString("utf8");
  if(Buffer.from(decoded,"utf8").toString("base64url")!==raw)return null;
  const value=JSON.parse(decoded) as Partial<WalletLedgerCursor>;
  if(value.v!==2||value.currency!==currency||typeof value.snapshotAt!=="string"||!Number.isFinite(Date.parse(value.snapshotAt)))return null;
  if(!validPosition(value.sasiAfter,value.snapshotAt)||!validPosition(value.aiAfter,value.snapshotAt))return null;
  return value as WalletLedgerCursor;
 }catch{return null;}
}

export function walletLedgerAfterFilter(position:WalletLedgerPosition):string{
 return `created_at.lt.${position.createdAt},and(created_at.eq.${position.createdAt},id.lt.${position.id})`;
}

export function mergeWalletLedgerRows<T extends WalletLedgerSortableRow>(sasiRows:readonly T[],aiRows:readonly T[]):T[]{
 return [...sasiRows,...aiRows].sort((a,b)=>{
  const time=Date.parse(b.created_at)-Date.parse(a.created_at);
  if(time!==0)return time;
  if(a.sourceKey!==b.sourceKey)return a.sourceKey==="sasi"?-1:1;
  return b.id.localeCompare(a.id);
 });
}

export function advanceWalletLedgerCursor<T extends WalletLedgerSortableRow>(current:WalletLedgerCursor,visible:readonly T[]):WalletLedgerCursor{
 let sasiAfter=current.sasiAfter;
 let aiAfter=current.aiAfter;
 for(const row of visible){
  const position={createdAt:row.created_at,id:row.id};
  if(row.sourceKey==="sasi")sasiAfter=position;
  else aiAfter=position;
 }
 return {...current,sasiAfter,aiAfter};
}
