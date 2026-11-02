import type {MetadataRoute} from 'next';
import {mayIndexMarket,marketCanonicalOrigin} from '../lib/market-index-policy';

const crawlerPaths=['/api/','/vendor/'];

export default function robots():MetadataRoute.Robots{
 if(!mayIndexMarket())return {rules:{userAgent:'*',disallow:'/'}};
 // Search visibility for ChatGPT is controlled by OAI-SearchBot, independently
 // of GPTBot's model-training policy. This explicit group preserves the same
 // private API and vendor-submission exclusions as the general crawler group.
 return {
  rules:[
   {userAgent:'*',allow:'/',disallow:crawlerPaths},
   {userAgent:'OAI-SearchBot',allow:'/',disallow:crawlerPaths}
  ],
  sitemap:marketCanonicalOrigin+'/sitemap.xml',
  host:marketCanonicalOrigin
 };
}
