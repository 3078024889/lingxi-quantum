import {test,expect} from "playwright/test";
import {indicatorBand,indicatorText,syntheticScore} from "../../lib/media/ai-indicator-bands";

test("AI image and video use consistent five-band presentation boundaries",()=>{
 const cases:[number,string][]=[
  [0,"minimal"],[0.149999,"minimal"],[0.15,"little"],[0.399999,"little"],
  [0.4,"uncertain"],[0.504,"uncertain"],[0.649999,"uncertain"],
  [0.65,"some"],[0.78,"some"],[0.849999,"some"],
  [0.85,"strong"],[0.976,"strong"],[1,"strong"]
 ];
 for(const [score,band] of cases)expect(indicatorBand(score)).toBe(band);
 expect(indicatorText(.504,"zh")).toBe("结果接近，暂时无法明确判断");
 expect(indicatorText(.976,"zh")).toBe("检测到较强的 AI 生成特征");
 expect(indicatorText(.78,"zh")).toBe("检测到一定的 AI 生成特征");
 expect(()=>indicatorBand(Number.NaN)).toThrow();
 expect(()=>indicatorBand(1.1)).toThrow();
});

test("classification reads FAKE class, never the REAL confidence as AI score",()=>{
 expect(syntheticScore([{label:"Fake",score:.504},{label:"Real",score:.496}])).toBe(.504);
 expect(syntheticScore([{label:"Real",score:.92},{label:"Fake",score:.08}])).toBe(.08);
 expect(syntheticScore([{label:"Real",score:.99}])).toBeNull();
 expect(syntheticScore([{label:"Fake",score:Number.NaN}])).toBeNull();
});
