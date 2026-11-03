import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import type {Metadata} from "next";

export const metadata:Metadata={
 title:"第三方开源组件与许可 | Open-source licenses | LINGXIFIELD",
 description:"LINGXIFIELD third-party open-source notices, browser media engines and upstream corresponding source references.",
 alternates:{canonical:"/open-source"}
};
const rows=[
 {name:"FFmpeg WebAssembly core",version:"0.12.10",license:"GPL-2.0-or-later",
   source:"https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v0.12.10",
   detail:"Browser video/audio conversion core with GPL-enabled codecs. Build recipe and upstream source must remain available."},
 {name:"ffmpeg.wasm JavaScript wrapper",version:"0.12.15",license:"MIT",
   source:"https://github.com/ffmpegwasm/ffmpeg.wasm",
   detail:"JavaScript worker/control wrapper; its license is distinct from the FFmpeg core."},
 {name:"Mozilla PDF.js",version:"4.10.38",license:"Apache-2.0",
   source:"https://github.com/mozilla/pdf.js",detail:"PDF viewer and text extraction."},
 {name:"pdf-lib",version:"1.17.1",license:"MIT",
   source:"https://github.com/Hopding/pdf-lib",detail:"PDF document modification and export."},
 {name:"Tesseract.js",version:"7.0.0",license:"Apache-2.0",
   source:"https://github.com/naptha/tesseract.js",detail:"Local OCR worker and engines; trained language data also carry separate notices."},
 {name:"qpdf",version:"11.10.0",license:"Apache-2.0",
   source:"https://github.com/qpdf/qpdf",detail:"PDF structure processing through a browser worker."}
];
export default function OpenSourcePage(){
 return <><Nav/><main className="lx11-page lx-legal-page"><div className="lx-legal-wrap"><div className="lx-legal-card">
  <h1 className="font-display text-4xl text-[var(--lx-ink)]"><LxText zh="第三方开源组件与许可" en="Open-source components and licenses" ja="オープンソースのライセンス" ko="오픈소스 라이선스" fr="Licences open source" de="Open-Source-Lizenzen" es="Licencias de código abierto" pt="Licenças de código aberto" ar="تراخيص المصادر المفتوحة"/></h1>
  <p className="mt-4 text-sm text-[var(--lx-muted)]"><LxText zh="我们在浏览器本地处理工具中使用第三方开源组件；不同组件适用不同许可。以下版本以当前候选源码依赖为准，发布时仍需核对实际交付的二进制与相应源码。" en="Browser-based tools use several third-party open-source components under different licenses. Versions describe the current source candidate; shipped binaries and their corresponding source must be verified at release." ja="ブラウザ内処理の第三者ライセンスとソース情報です。" ko="브라우저 처리 구성요소의 라이선스 및 소스 정보입니다." fr="Informations de licence et de source pour les outils de navigateur." de="Lizenz- und Quellcodeinformationen für Browser-Tools." es="Licencias y código fuente de las herramientas del navegador." pt="Licenças e código-fonte das ferramentas do navegador." ar="تراخيص البرامج ومصادر الأدوات التي تعمل في المتصفح."/></p>
  <div className="mt-8 space-y-5">{rows.map(item=><section key={item.name} className="rounded-xl border border-[var(--lx-line)] p-5">
   <h2 className="text-lg font-semibold text-[var(--lx-ink)]">{item.name}</h2><p className="mt-1 text-sm">{item.version} · {item.license}</p>
   <p className="mt-2 text-sm text-[var(--lx-muted)]">{item.detail}</p>
   <a href={item.source} rel="noopener noreferrer" target="_blank" className="mt-2 inline-block underline">Source / 源码</a>
  </section>)}</div>
  <section className="mt-8 rounded-xl border border-[var(--lx-line)] p-5">
   <h2 className="text-lg font-semibold"><LxText zh="视频引擎的对应源码" en="Corresponding source for video engine" ja="動画エンジンのソース" ko="영상 엔진 소스" fr="Source du moteur vidéo" de="Quellcode des Video-Engines" es="Código fuente del motor de vídeo" pt="Código-fonte do motor de vídeo" ar="مصدر محرك الفيديو"/></h2>
   <p className="mt-2 text-sm text-[var(--lx-muted)]"><LxText zh="使用 GPL 组件时，必须按适用许可提供对应源码、构建方法与许可说明。视频引擎按需加载；网页运营收费不等于购买了第三方软件版权。" en="The GPL core requires access to corresponding source, build instructions and notices as applicable. The media engine loads on demand; paid web services do not replace open-source license obligations." ja="GPL条件に従い対応するソースとビルド情報を提供します。" ko="GPL 조건에 따라 소스 및 빌드 정보를 공개해야 합니다." fr="Les obligations GPL s'appliquent au moteur vidéo." de="Für die Video-Engine gelten GPL-Pflichten." es="El motor de vídeo está sujeto a las obligaciones GPL." pt="O mecanismo de vídeo segue as obrigações GPL." ar="يخضع محرك الفيديو لمتطلبات GPL."/></p>
   <a className="mt-3 block underline" href="/media/ffmpeg-0.12.10/SOURCE.txt">Media engine source notice / 视频引擎源码说明</a>
   <a className="mt-1 block underline" href="https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt" target="_blank" rel="noopener noreferrer">GPL-2.0 license text</a>
  </section>
  <p className="mt-5 text-sm text-[var(--lx-muted)]"><LxText zh="其他依赖及二进制校验以构建中的正式第三方许可清单和软件包为准。" en="Additional dependency notices and binary checks are governed by the release package and its build manifests." ja="その他の依存関係はリリース情報をご確認ください。" ko="다른 종속성은 릴리스 정보를 참조하세요." fr="Voir les informations de version pour les autres dépendances." de="Weitere Abhängigkeiten siehe Release-Informationen." es="Consulte la versión para otras dependencias." pt="Consulte a versão para outras dependências." ar="يرجى مراجعة معلومات الإصدار للاعتماديات الأخرى."/></p>
 </div></div></main><Footer/></>;
}
