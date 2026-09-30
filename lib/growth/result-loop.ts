export type GrowthSurface="download"|"share"|"template"|"remix"|"creator-profile"|"public-result";
export type GrowthAttribution={surface:GrowthSurface;artifactId?:string;templateId?:string;creatorId?:string;parentId?:string;campaign?:string};
export const growthUrl=(path:string,a:GrowthAttribution)=>{const u=new URL(path,"https://lingxifield.com");u.searchParams.set("from",a.surface);if(a.templateId)u.searchParams.set("template",a.templateId);if(a.parentId)u.searchParams.set("remix",a.parentId);return u.pathname+u.search};
export const PUBLICATION_RULES={userOwnsOutput:true,publicByDefault:false,templateRequiresExplicitConsent:true,publicTemplateRequiresReview:true,forcedWatermark:false,optionalLingxifieldAttribution:true};
