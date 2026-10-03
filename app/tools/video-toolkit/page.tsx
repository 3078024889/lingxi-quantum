import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoToolkitWorkbench from "@/components/tools/VideoToolkitWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "视频压缩 / 裁剪 / 提取音频", "en": "Compress / Trim / Extract Audio", "ja": "動画圧縮 / 切り出し / 音声抽出", "ko": "비디오 압축 / 자르기 / 오디오 추출", "fr": "Compresser / couper / extraire l’audio", "de": "Video komprimieren / schneiden / Audio extrahieren", "es": "Comprimir / recortar / extraer audio", "pt": "Comprimir / cortar / extrair áudio", "ar": "ضغط / قص / استخراج الصوت"}}/>} intro={<LxText {...TOOL_INTROS["video-toolkit"]}/>}> <VideoToolkitWorkbench/></AdvancedToolPage>}
