import type {Metadata} from "next";
import {buildFivePosts, singaporeDay} from "@/lib/telegram/editorial";
import ShareKitClient from "./share-kit-client";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"全球 SIAI 社区文案复制工作台｜LINGXIFIELD",
 description:"官方社区推广素材复制与发布工作台",
 robots:{index:false,follow:false},
};
export default function CommunityShareKitPage(){
 const date=new Date();
 const telegram=buildFivePosts(date,"telegram");
 const qq=buildFivePosts(date,"qq");
 return <ShareKitClient day={singaporeDay(date)} telegram={telegram} qq={qq}/>;
}
