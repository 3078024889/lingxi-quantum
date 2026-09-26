import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("food-calorie");
export default function ToolLayout({children}:{children:ReactNode}){return children}
