/** Display bands for uncalibrated synthetic-image classifier scores.
 * These are editorial presentation bands, NOT empirically calibrated probabilities. */
export type DetectorPrediction={label:string;score:number};
export type ScoreBand="strong"|"some"|"uncertain"|"little"|"minimal";
export function syntheticScore(predictions:readonly DetectorPrediction[]):number|null{
 const fake=predictions.find(p=>p.label.trim().toLowerCase()==="fake"&&Number.isFinite(p.score)&&p.score>=0&&p.score<=1);
 return fake?fake.score:null;
}
export function indicatorBand(value:number):ScoreBand{
 if(!Number.isFinite(value)||value<0||value>1)throw Error("Invalid image indicator score");
 // Calculate using the raw score, avoiding rounding across thresholds.
 if(value>=0.85)return "strong";
 if(value>=0.65)return "some";
 if(value>=0.4)return "uncertain";
 if(value>=0.15)return "little";
 return "minimal";
}
const descriptions:Record<ScoreBand,{zh:string;en:string}>={
 strong:{zh:"检测到较强的 AI 生成特征",en:"Stronger AI-generation indicators detected"},
 some:{zh:"检测到一定的 AI 生成特征",en:"Some AI-generation indicators detected"},
 uncertain:{zh:"结果接近，暂时无法明确判断",en:"Mixed signals — no clear conclusion"},
 little:{zh:"未发现明显的 AI 生成特征",en:"No clear AI-generation indicators detected"},
 minimal:{zh:"几乎未发现 AI 生成特征",en:"Very few AI-generation indicators detected"}
};
export function indicatorText(value:number,lang:string):string{
 return descriptions[indicatorBand(value)][lang==="zh"?"zh":"en"];
}
export function indicatorPercent(value:number):string{return (value*100).toFixed(1)+"%";}
