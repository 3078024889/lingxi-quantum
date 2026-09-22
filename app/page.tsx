import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const metadata:Metadata={
  title:"灵犀场｜一念即达 · 一念显化",
  description:"把问题、资料与想法带进来。灵犀场用工具、SASI 与场域系统，把下一步变得易懂、易做、可抵达。",
  alternates:{canonical:"/"}
};

export default function Home(){
  return <>
    <Nav/>
    <HomeProblemHub/>
    <Footer/>
  </>;
}
