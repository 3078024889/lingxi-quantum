import {getGlobalTool} from '@/lib/seo/global-seo';
import {ToolSeoJsonLd} from './GlobalSeoJsonLd';
import ToolGuideContent from './ToolGuideContent';
export default function ToolGuide({slug}:{slug:string}){
 const tool=getGlobalTool(slug);if(!tool)return null;
 return <><ToolSeoJsonLd tool={tool} locale="zh"/><ToolGuideContent slug={slug}/></>;
}
