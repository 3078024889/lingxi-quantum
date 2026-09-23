"use client";

import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {v104sText} from "@/lib/v104s-i18n";

const cards=[
{action:'让呼吸带我回来',actionEn:'Let breath bring me back',key:'breath',title:'量子息法',en:'Quantum Breath',body:'当思绪纷乱、注意力散开时，从身体与呼吸重新开始。循着完整五步引导，体验专注、心的品质与内外连接。',bodyEn:'When thoughts scatter, begin again with body and breath. Follow the five-step guide to explore focus, qualities of the heart, and inner–outer connection.',benefit:'让呼吸成为回到当下的入口',benefitEn:'Make breath a doorway back to the present'},
{action:'听见心里的声音',actionEn:'Hear the voice within',key:'intuition',title:'直觉丹道',en:'Intuitive Way',body:'在外界意见与内心感受之间，给自己一段安静。学习内听、容许与放手，以真实选择回应逐渐清晰的理解。',bodyEn:'Give yourself quiet between outside opinions and inner feeling. Practice listening inward, allowing and letting go, then answer growing clarity with real choices.',benefit:'听见内在，也用现实核对',benefitEn:'Hear within, and verify in reality'},
{action:'回到心的中央',actionEn:'Return to the center of the heart',key:'heart-reset',title:'归零心诀',en:'Heart Reset',body:'当心里装满压力与纷扰，停下片刻。从回心、温暖到绿色意象与心观世界，让自己重新找到柔和而清晰的位置。',bodyEn:'When the heart is full of pressure and noise, pause. Through returning inward, warmth, green imagery and heart-centered observation, rediscover a gentler, clearer position.',benefit:'把温暖与清晰带回心的中央',benefitEn:'Bring warmth and clarity back to the heart’s center'},
{action:'让生命向上展开',actionEn:'Let life unfold upward',key:'ascending-heart',title:'上升心经',en:'Ascending Heart',body:'将呼吸、心的觉察与生命表达连在一起。通过四式练习，在反复体验中寻找适合自己的节律，把内在理解带回日常。',bodyEn:'Connect breath, heart awareness and expression of life. Through four practices, find your own rhythm through repetition and bring inner understanding back into daily life.',benefit:'让觉察在生活中持续展开',benefitEn:'Let awareness keep unfolding in life'}];

export default function PracticeCards(){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>v104sText(lang,zh,en);
 return <div className="practice-index-cards">{cards.map(card=><article key={card.key}><img src={'/images/practice/v2/'+card.key+'.webp'} alt="" loading="lazy" width={768} height={512}/><div><h3>{t(card.title,card.en)}</h3><small>{card.en}</small><p>{t(card.body,card.bodyEn)}</p><div className="practice-card-actions"><Link href={'/practice/'+card.key}>{t(card.action,card.actionEn)} →</Link></div><p className="practice-card-benefit">{t(card.benefit,card.benefitEn)}</p></div></article>)}</div>
}
