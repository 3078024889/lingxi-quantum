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
// Cursor timestamps are interpolated into PostgREST's .or() filter grammar.
// Accept only bounded RFC 3339 instants; Date.parse alone accepts loose strings
// that can contain filter punctuation or normalize impossible calendar dates.
const ISO_INSTANT=/^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,6})?(Z|([+-])([01]\d|2[0-3]):([0-5]\d))$/;

function validIsoInstant(value:unknown):value is string{
 if(typeof value!=="string")return false;
 const match=ISO_INSTANT.exec(value);
 if(!match)return false;
 const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
 if(month<1||month>12||day<1||day>new Date(Date.UTC(year,month,0)).getUTCDate())return false;
 return Number.isFinite(Date.parse(value));
}

function validPosition(value:unknown,snapshotAt:string):value is WalletLedgerPosition|null{
 if(value===null)return true;
 if(!value||typeof value!=="object")return false;
 const position=value as Record<string,unknown>;
 if(!validIsoInstant(position.createdAt))return false;
 if(Date.parse(position.createdAt)>Date.parse(snapshotAt))return false;
 return typeof position.id==="string"&&UUID.test(position.id);
}

export function encodeWalletLedgerCursor(value:WalletLedgerCursor):string{
 return Buffer.from(JSON.stringify(value),"utf8").toString("base64url");
}

export function decodeWalletLedgerCursor(raw:string|null,currency:WalletLedgerCurrency):WalletLedgerCursor|null{
 if(!raw||raw.length>2048||!/^[A-Za-z0-9_-]+$/.test(raw))return null;
 try{
  const decoded=Buffer.from(raw,"base64url").toString("utf8");
  if(Buffer.from(decoded,"utf8").toString("base64url")!==raw)return null;
  const value=JSON.parse(decoded) as Partial<WalletLedgerCursor>;
  if(value.v!==2||value.currency!==currency||!validIsoInstant(value.snapshotAt))return null;
  if(!validPosition(value.sasiAfter,value.snapshotAt)||!validPosition(value.aiAfter,value.snapshotAt))return null;
  return value as WalletLedgerCursor;
 }catch{return null;}
}

export function walletLedgerAfterFilter(position:WalletLedgerPosition):string{
 if(!validIsoInstant(position.createdAt)||!UUID.test(position.id))throw new Error("INVALID_LEDGER_CURSOR_POSITION");
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
