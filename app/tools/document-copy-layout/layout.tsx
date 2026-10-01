import ToolGuide from "@/components/seo/ToolGuide";
import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("document-copy-layout");
export default function ToolLayout({children}:{children:ReactNode}){return <>{children}<ToolGuide slug="document-copy-layout"/></>}
