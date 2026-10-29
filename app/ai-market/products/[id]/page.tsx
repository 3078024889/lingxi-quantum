import ProductDetails from '@/components/ai-market/ProductDetails';
export const metadata={title:'AI 产品真实资料 | LINGXIFIELD',robots:{index:false,follow:false}};
export default function ProductPage({params}:{params:{id:string}}){return <ProductDetails id={params.id}/>;}
