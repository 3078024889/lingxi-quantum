export interface MigrationRecord{name:string;installed:boolean;appliedToProduction:boolean}
export function migrationState(rows:MigrationRecord[]){return {installed:rows.filter(x=>x.installed).map(x=>x.name),productionApplied:rows.filter(x=>x.appliedToProduction).map(x=>x.name),pendingProduction:rows.filter(x=>x.installed&&!x.appliedToProduction).map(x=>x.name)}}
