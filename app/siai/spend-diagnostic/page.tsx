import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SpendDiagnostic from "@/components/siai/SpendDiagnostic";
import {getVerifiedSiaiOptions} from "@/lib/siai/verified-spend-options";
export const metadata:Metadata={
 title:"免费AI花费诊断｜检查订阅浪费与潜在节省｜灵犀场 LINGXIFIELD",
 description:"不上传账单，不连接银行，不需注册。免费估算SI/AI订阅支出、低使用率与可节省的费用。可查看计算逻辑与限制。",
 alternates:{canonical:"https://lingxifield.com/siai/spend-diagnostic"},
 robots:{index:false,follow:true}
};
export default function Page(){return <><Nav/><SpendDiagnostic candidates={getVerifiedSiaiOptions()}/><Footer/></>;}
