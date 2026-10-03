import type {Metadata} from "next";
import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCatalogClient from "@/app/products/ProductCatalogClient";

const productsFact=pageGeoFact("products","zh");
export const metadata:Metadata=publicPageMetadata("zh","/products",productsFact.title,productsFact.description);

export default function Page(){
 return <><Nav/><ProductCatalogClient/><Footer/></>;
}
