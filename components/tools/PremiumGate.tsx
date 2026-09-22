'use client';
import { useRouter } from 'next/navigation';
export default function PremiumGate({productId,priceRmb,children}:{productId:string;priceRmb:number;children:React.ReactNode}){
  const router=useRouter();
  return <button type="button" onClick={()=>router.push(`/checkout?productId=${encodeURIComponent(productId)}&redirect=${encodeURIComponent(location.pathname)}`)} className="w-full rounded-xl bg-black px-5 py-3 text-white">{children}<span className="ml-2 opacity-70">¥{priceRmb}</span></button>;
}
