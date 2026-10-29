import ProductDetails from '@/components/ai-market/ProductDetails';
export const metadata={title:'AI 产品真实资料 | LINGXIFIELD',robots:{index:false,follow:false}};
export default async function ProductPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ProductDetails id={id}/>;}
