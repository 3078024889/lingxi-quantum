import {notFound} from 'next/navigation';
import Home from '../../market-workbench';
import {findPlatform} from '../../../lib/platform-repository';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);return {title:product?`${product.name} 功能、费用与使用条件｜灵犀场`:'产品未找到',robots:{index:false,follow:false}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);if(!product)notFound();return <Home initialPlatforms={[product]} initialSelected={product.id}/>;}
