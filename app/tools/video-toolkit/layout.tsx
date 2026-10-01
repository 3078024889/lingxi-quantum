import ToolGuide from "@/components/seo/ToolGuide";
import type {ReactNode} from "react";
import {buildToolMetadata} from "@/lib/tools/seo";
export const metadata=buildToolMetadata("video-toolkit");
export default function ToolLayout({children}:{children:ReactNode}){return <>{children}<ToolGuide slug="video-toolkit"/></>}
