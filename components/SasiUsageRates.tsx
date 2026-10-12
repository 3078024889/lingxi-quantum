import {SASI_PRICING_V49,formatMinor,type SasiBillingCurrency} from '@/lib/sasi/pricing-v49';
import type {LingxiLang} from '@/lib/lingxi-i18n';

const copy:Record<LingxiLang,readonly string[]>={
 zh:['SASI 使用价格','文字 / 100万 Token','图片 / 张：标准 · 高清','视频 / 成功生成秒：720p · 1080p · 2K · 4K','网站：首页 · 每个新增页面','供应商费用由你连接的服务另行收取；执行前会确认本次价格。'],
 en:['SASI usage prices','Text / million tokens','Image / image: standard · high','Video / generated second: 720p · 1080p · 2K · 4K','Website: first page · additional page','Your connected provider bills separately; the task price is confirmed before execution.'],
 ja:['SASI 利用料金','テキスト / 100万トークン','画像 / 枚：標準 · 高品質','動画 / 生成秒：720p · 1080p · 2K · 4K','サイト：最初のページ · 追加ページ','接続したプロバイダー料金は別途請求されます。実行前に今回の料金を確認します。'],
 ko:['SASI 사용 요금','텍스트 / 백만 토큰','이미지 / 장: 표준 · 고품질','동영상 / 생성된 초: 720p · 1080p · 2K · 4K','웹사이트: 첫 페이지 · 추가 페이지','연결된 제공업체 요금은 별도입니다. 실행 전에 작업 요금을 확인합니다.'],
 fr:['Tarifs SASI','Texte / million de tokens','Image / image : standard · haute qualité','Vidéo / seconde générée : 720p · 1080p · 2K · 4K','Site : première page · page supplémentaire','Votre fournisseur facture séparément. Le prix est confirmé avant exécution.'],
 de:['SASI Nutzungspreise','Text / Million Token','Bild / Bild: Standard · hohe Qualität','Video / erzeugte Sekunde: 720p · 1080p · 2K · 4K','Website: erste Seite · weitere Seite','Ihr Anbieter berechnet separat. Der Auftragspreis wird vor der Ausführung bestätigt.'],
 es:['Precios de uso SASI','Texto / millón de tokens','Imagen / imagen: estándar · alta calidad','Vídeo / segundo generado: 720p · 1080p · 2K · 4K','Sitio: primera página · página adicional','Tu proveedor cobra por separado. El precio se confirma antes de ejecutar.'],
 pt:['Preços de uso SASI','Texto / milhão de tokens','Imagem / imagem: padrão · alta qualidade','Vídeo / segundo gerado: 720p · 1080p · 2K · 4K','Site: primeira página · página adicional','Seu fornecedor cobra separadamente. O preço é confirmado antes da execução.'],
 ar:['أسعار استخدام SASI','النص / مليون رمز','الصورة / صورة: عادية · عالية الجودة','الفيديو / ثانية مولدة: 720p · 1080p · 2K · 4K','الموقع: الصفحة الأولى · كل صفحة إضافية','يحاسبك مزود الخدمة المتصل بشكل منفصل. يتم تأكيد سعر المهمة قبل التنفيذ.'],
};
export default function SasiUsageRates({currency,lang}:{currency:SasiBillingCurrency;lang:LingxiLang}){
 const c=copy[lang],p=SASI_PRICING_V49;
 const price=(rates:readonly Record<SasiBillingCurrency,number>[])=>rates.map(rate=>formatMinor(Math.round(rate[currency]*100),currency)).join(' · ');
 const rows=[[c[1],price([p.textPerMillion])],[c[2],price([p.imageStandard,p.imageHigh])],[c[3],price([p.video720PerSecond,p.video1080PerSecond,p.video2KPerSecond,p.video4KPerSecond])],[c[4],price([p.websiteFirstPage,p.websiteAdditionalPage])]];
 return <details className="mt-6 rounded-2xl border border-[var(--lx-line)] p-5" data-testid="sasi-usage-rates"><summary className="cursor-pointer font-semibold">{c[0]} · {currency}</summary><dl className="mt-4 space-y-3">{rows.map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl><p className="mt-4 text-sm text-[var(--lx-muted)]">{c[5]}</p></details>;
}
