import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";

export const metadata:Metadata={
 title:"SASI 卖家服务与软件发布工作台｜灵犀场",
 description:"申请成为 SASI 软件卖家，创建软件商品、上传安装包和商品图片，查看安全检查、审核进度及销售记录。",
 robots:{index:false,follow:true},
 alternates:{canonical:"/sasi/seller"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace view="seller"/><Footer/></>}
