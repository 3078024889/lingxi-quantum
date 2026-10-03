import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/",homeFact.title,homeFact.description);

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
