import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("long-image");
export default function ToolLayout({children}:{children:ReactNode}){return children}
