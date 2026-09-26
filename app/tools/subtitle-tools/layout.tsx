import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("subtitle-tools");
export default function ToolLayout({children}:{children:ReactNode}){return children}
