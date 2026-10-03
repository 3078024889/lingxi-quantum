import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import ToolsHubV11 from "@/components/tools/ToolsHubV11";

const toolsFact=pageGeoFact("tools","zh");
export const metadata=publicPageMetadata("zh","/tools",toolsFact.title,toolsFact.description);

export default function ToolsHubPage(){
  return <ToolsHubV11/>;
}
