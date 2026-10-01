import ToolGuide from "@/components/seo/ToolGuide";
import {buildToolMetadata} from '@/lib/tools/seo';
export const metadata=buildToolMetadata('image-translator');
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<ToolGuide slug="image-translator"/></>}
