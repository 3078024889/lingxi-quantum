import Nav from "@/components/Nav";
import SasiByokTextWorkbench from "@/components/SasiByokTextWorkbench";
export const metadata={title:"SASI 网站生成"};
export default function Page(){return <><Nav/><main className="mx-auto max-w-5xl p-6"><SasiByokTextWorkbench mode="website"/></main></>;}
