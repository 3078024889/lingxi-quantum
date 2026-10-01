import ToolGuide from "@/components/seo/ToolGuide";
import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("avif-to-jpg");
export default function ToolLayout({children}:{children:ReactNode}){return <>{children}<ToolGuide slug="avif-to-jpg"/></>}
