import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import HeicWorkbench from "@/components/tools/HeicWorkbench";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={
 title:"HEIC 转 JPG｜灵犀场",
 description:"批量把 HEIC / HEIF 转成 JPG，浏览器本地处理，支持直接下载。",
 alternates:{canonical:"/tools/heic-to-jpg",languages:languageAlternates("/tools/heic-to-jpg")}
};
export default function Page(){
 return <AdvancedToolPage
  title={<LxText zh="HEIC 转 JPG" en="HEIC to JPG" ja="HEIC を JPG に変換" ko="HEIC를 JPG로 변환" fr="HEIC vers JPG" de="HEIC zu JPG" es="HEIC a JPG" pt="HEIC para JPG" ar="تحويل HEIC إلى JPG"/>}
  intro={<LxText {...TOOL_INTROS["heic-to-jpg"]}/>}>
  <HeicWorkbench/>
 </AdvancedToolPage>;
}
