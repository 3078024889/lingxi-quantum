import type {Metadata} from "next";
import {pageGeoFact} from "@/lib/seo/site-facts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AboutBusinessClient from "@/components/AboutBusinessClient";

const aboutFact=pageGeoFact("about","zh");
export const metadata:Metadata={
 title:aboutFact.title,
 description:aboutFact.description,
 alternates:{canonical:"/about"}
};
export default function AboutPage(){
 return <><Nav/><AboutBusinessClient/><Footer/></>;
}
