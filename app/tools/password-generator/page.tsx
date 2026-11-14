import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PasswordGeneratorWorkbench from "@/components/tools/PasswordGeneratorWorkbench";
import {buildSearchOptimizedToolMetadata} from "@/lib/seo/search-tool-metadata";
export const metadata=buildSearchOptimizedToolMetadata("password-generator","zh");
export default function Page(){return <AdvancedToolPage title="密码生成器" intro="在浏览器本地生成 8–128 位随机密码，不上传、不保存。"><PasswordGeneratorWorkbench/></AdvancedToolPage>;}
