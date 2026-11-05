import type {Metadata} from "next";
import CommunityOpsDashboard from "./community-ops-dashboard";

export const metadata:Metadata={
 title:"社区运营数据｜灵犀场",
 description:"仅管理员可查看全球 SIAI 社区发布和引流数据",
 robots:{index:false,follow:false},
};

export default function Page(){return <CommunityOpsDashboard/>}
