import LearnHubClient from "./LearnHubClient";

export const metadata={
 title:"探索 | 灵犀场 LINGXIFIELD",
 description:"从一个真实问题进入，连接理解、练习与行动。",
 alternates:{canonical:"/learn"}
};

export default function LearnHub(){
 return <LearnHubClient/>;
}
