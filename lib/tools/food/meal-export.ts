import type {LingxiLang} from "@/lib/lingxi-i18n";
import type {MealResult,MealItem} from "./meal-calculation";
import {extraText} from "./workbench-extra-copy";
import {foodText} from "./workbench-copy";

const LANGUAGES=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;
const TOTALS=["合计","Total","合計","합계","Total","Gesamt","Total","Total","الإجمالي"] as const;
const GRAMS=["重量 (g)","Weight (g)","重量 (g)","무게 (g)","Poids (g)","Gewicht (g)","Peso (g)","Peso (g)","الوزن (غ)"] as const;
const labels=(l:LingxiLang,k:string)=>extraText(l,k)||foodText(l,k)||k;
const choose=(item:MealItem,lang:LingxiLang)=>item.displayNames?.[lang]||(lang==="zh"?item.name_zh:item.name_en||item.name_zh);
const fields=["kcal","protein_g","carbs_g","fat_g","fiber_g","sugar_g","sodium_mg"] as const;
// Excel, LibreOffice and spreadsheet apps may interpret text beginning with =, +, - or @ as a formula.
// Prefix user-supplied text (including food labels and external source URLs) to keep the CSV inert.
export function csvCell(value:string|number|null|undefined){
 const str=value==null?"":String(value);
 const safe=typeof value==="number"?str:/^[\s\u0000-\u001f]*[=+@-]/.test(str)?"'"+str:str;
 return '"'+safe.replace(/"/g,'""')+'"';
}
const row=(cells:Array<string|number|null|undefined>)=>cells.map(csvCell).join(",");
export function foodMealCsv(result:MealResult,lang:LingxiLang){
 const index=Math.max(0,LANGUAGES.indexOf(lang));
 const heads=[labels(lang,"foods"),GRAMS[index],labels(lang,"energy")+" (kcal)",...["protein","carbs","fat","fiber","sugar","sodium"].map(k=>labels(lang,k)+" ("+(k==="sodium"?"mg":"g")+")"),labels(lang,"source")];
 const rows=[row(heads)];
 for(const item of result.items)rows.push(row([choose(item,lang),item.grams,...fields.map(k=>item[k]),item.source||""]));
 rows.push(row([TOTALS[index],result.total.grams,...fields.map(k=>result.total[k]),result.sources.join("; ")]));
 return rows.join("\r\n")+"\r\n";
}
