import { SITE, GLOBAL_TOOL_CATALOG, localePath } from "@/lib/seo/global-seo";

export default function ToolsIndexJsonLd() {
  const items = GLOBAL_TOOL_CATALOG.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${SITE}${localePath("zh", `/tools/${tool.slug}`)}`,
  }));
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/tools#tool-list`,
    name: "灵犀场 LINGXIFIELD 在线实用工具",
    numberOfItems: items.length,
    itemListElement: items,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
