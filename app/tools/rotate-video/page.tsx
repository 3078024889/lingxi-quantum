import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoToolkitWorkbench from "@/components/tools/VideoToolkitWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

const title={
 zh:"视频旋转 / 方向纠正",en:"Rotate Video / Fix Orientation",
 ja:"動画回転 / 向きの修正",ko:"동영상 회전 / 방향 수정",
 fr:"Rotation vidéo / Corriger l’orientation",de:"Video drehen / Ausrichtung korrigieren",
 es:"Rotar vídeo / Corregir orientación",pt:"Girar vídeo / Corrigir orientação",
 ar:"تدوير الفيديو / تصحيح الاتجاه"
};
const intro={
 zh:"上传视频，选择顺时针 90°、180° 或逆时针 90°。画面会真正旋转并导出带音频的 MP4，支持保存和系统分享，文件在浏览器本地处理。",
 en:"Choose 90° clockwise, 180° or 90° counterclockwise. Rotate the actual video frames, export an MP4 with audio, and save or share it. Processing stays on your device.",
 ja:"動画をアップロードし、90°・180°・270°回転。映像を書き換えて音声付きMP4を保存・共有できます。",
 ko:"동영상을 업로드하고 90°·180°·270° 회전하세요. 오디오가 포함된 MP4를 저장하고 공유할 수 있습니다.",
 fr:"Faites pivoter la vidéo de 90°, 180° ou 270°, exportez un MP4 avec audio, enregistrez ou partagez le résultat.",
 de:"Video um 90°, 180° oder 270° drehen, als MP4 mit Ton exportieren und speichern oder teilen.",
 es:"Gira el vídeo 90°, 180° o 270°, exporta un MP4 con audio y guarda o comparte el resultado.",
 pt:"Gire o vídeo 90°, 180° ou 270°, exporte MP4 com áudio e salve ou compartilhe o resultado.",
 ar:"دوّر الفيديو 90° أو 180° أو 270° وصدّر ملف MP4 مع الصوت واحفظه أو شاركه."
};

export const metadata:Metadata={
 title:"视频旋转 90° / 180° / 270°｜灵犀场 LINGXIFIELD",
 description:"在线视频旋转与方向纠正。浏览器本地旋转真实画面，支持 MP4 导出、保存及系统分享。",
 alternates:{canonical:"/tools/rotate-video",languages:languageAlternates("/tools/rotate-video")}
};

export default function Page(){
 return <AdvancedToolPage title={<LxText {...title}/>} intro={<LxText {...intro}/>}>
  <VideoToolkitWorkbench initialMode="rotate" standalone/>
 </AdvancedToolPage>;
}
