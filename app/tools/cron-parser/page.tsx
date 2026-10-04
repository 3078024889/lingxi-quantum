import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import CronParserWorkbench from "@/components/tools/CronParserWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"Cron 表达式解析器｜灵犀场",
 description:"解析标准 5 段 Cron，验证范围并计算未来运行时间。",
 alternates:{canonical:"/tools/cron-parser",languages:languageAlternates("/tools/cron-parser")}
};

export default function Page(){
 return <AdvancedToolPage title="Cron 表达式解析器" intro="解析标准 5 段 Cron，验证范围并计算未来运行时间。"><CronParserWorkbench/></AdvancedToolPage>
}
