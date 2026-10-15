import {videoChargeMinor} from './pricing-v49';
import {promotionSettings} from './promotion-brief';
export function seriesSpecification(text:string){
 const promotion=promotionSettings(text);
 if(promotion)return {episodes:1,seconds:promotion.seconds,totalSeconds:promotion.seconds,platform720Minor:videoChargeMinor(promotion.seconds,'720p','CNY'),platform1080Minor:videoChargeMinor(promotion.seconds,'1080p','CNY')};
 const counts=[...text.matchAll(/(\d{1,3})\s*(?:集|episodes?)/gi)];
 const episodes=counts.length?Number(counts[counts.length-1][1]):1;
 const minute=text.match(/(?:每集|每一集|each episode|per episode)\s*(\d{1,2})\s*(?:分钟|minutes?)/i);
 const second=text.match(/(?:每集|每一集|each episode|per episode)\s*(\d{1,3})\s*(?:秒|seconds?)/i);
 const seconds=minute?Number(minute[1])*60:second?Number(second[1]):12;
 if(episodes<1||episodes>50||seconds<4||seconds>120||episodes*seconds>3600||seconds%4!==0)throw Error('SERIES_SPEC_UNSUPPORTED');
 return {episodes,seconds,totalSeconds:episodes*seconds,platform720Minor:videoChargeMinor(episodes*seconds,'720p','CNY'),platform1080Minor:videoChargeMinor(episodes*seconds,'1080p','CNY')};
}
