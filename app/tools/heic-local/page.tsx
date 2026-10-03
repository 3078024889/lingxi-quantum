import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import HeicWorkbench from "@/components/tools/HeicWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "HEIC 转 JPG", "en": "HEIC to JPG", "ja": "HEICをJPGへ", "ko": "HEIC를 JPG로", "fr": "HEIC vers JPG", "de": "HEIC zu JPG", "es": "HEIC a JPG", "pt": "HEIC para JPG", "ar": "HEIC إلى JPG"}}/>} intro={<LxText {...TOOL_INTROS["heic-to-jpg"]}/>}> <HeicWorkbench/></AdvancedToolPage>}
