import {permanentRedirect} from "next/navigation";

export const metadata={
 title:"页面已调整｜灵犀场 LINGXIFIELD",
 description:"旧版推广视频制作入口已退役。灵犀场当前提供在线实用工具、全球 SIAI 排行榜与 SASI 智能软件市场。",
 robots:{index:false,follow:false}
};

export default function RetiredUrlPromotionPage(){
 permanentRedirect("/tools");
}
