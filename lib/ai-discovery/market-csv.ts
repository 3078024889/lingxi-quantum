/** CSV export utilities. Untrusted model fields must never become spreadsheet formulas. */
export type CsvModel={id:string;name:string;contextTokens:number|null;promptUsdPerMillion:number|null;completionUsdPerMillion:number|null};
export function csvCell(value:string|number|null):string{
 const raw=value===null?"Unknown":String(value);
 // Leading whitespace/control characters can disguise spreadsheet formulas.
 const safe=/^[\s\u0000-\u001f]*[=+@\-]/u.test(raw)?"'"+raw:raw;
 return '"'+safe.replace(/"/g,'""')+'"';
}
export function modelMarketCsv(models:CsvModel[],observedAt:string,source:string):string{
 if(models.length>200)throw new Error("Export exceeds row limit");
 const headers=["Model ID","Model name","Context tokens","Input USD per million tokens","Output USD per million tokens","Observed at","Source"];
 return [headers.map(csvCell).join(","),...models.map(m=>[m.id,m.name,m.contextTokens,m.promptUsdPerMillion,m.completionUsdPerMillion,observedAt,source].map(csvCell).join(","))].join("\r\n")+"\r\n";
}
