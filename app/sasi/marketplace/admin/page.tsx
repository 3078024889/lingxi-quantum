import {notFound} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiMarketplaceReviewConsole from "@/components/SasiMarketplaceReviewConsole";
import {moneyAdministrator} from "@/lib/money/operator-settings";
export const dynamic="force-dynamic";
export const metadata={title:"SASI 智能软件 · 审核管理 | 灵犀场",robots:{index:false,follow:false}};
export default async function MarketplaceAdminPage(){
 const reviewer=await moneyAdministrator().catch(()=>null);
 if(!reviewer)notFound();
 return <><Nav/><SasiMarketplaceReviewConsole/><Footer/></>;
}
