import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";
import {PUBLIC_FEATURE_COPY,PUBLIC_SEARCH_TITLES} from "@/lib/public-feature-copy";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/",PUBLIC_SEARCH_TITLES.zh,PUBLIC_FEATURE_COPY.zh.description);

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
