import type {Metadata} from 'next';
import {SHARE_IMAGES,SHARE_IMAGE_URL} from '@/lib/share-image';
import {localePath,languageAlternates,type SeoLocale} from './global-seo';
export function publicPageMetadata(locale:SeoLocale,path:string,title:string,description:string):Metadata{
 const url=localePath(locale,path);
 return {title:{absolute:`${title} | LINGXIFIELD`},description,
  alternates:{canonical:url,languages:languageAlternates(path)},
  openGraph:{type:'website',url,title,description,siteName:'灵犀场 LINGXIFIELD',images:SHARE_IMAGES},
  twitter:{card:'summary_large_image',title,description,images:[SHARE_IMAGE_URL]},
  robots:{index:true,follow:true,'max-snippet':-1,'max-image-preview':'large','max-video-preview':-1},
 };
}
