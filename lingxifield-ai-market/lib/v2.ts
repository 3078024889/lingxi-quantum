import type {Platform} from './data';
export type Language = 'en'|'ja'|'ko'|'fr'|'de'|'es'|'pt'|'ar'|'zh';
export type Currency = 'CNY'|'USD';
export const LANGUAGES: {code: Language; label: string}[] = [
{code:'zh',label:'中文'},{code:'en',label:'English'},{code:'ja',label:'日本語'},{code:'ko',label:'한국어'},
{code:'fr',label:'Français'},{code:'de',label:'Deutsch'},{code:'es',label:'Español'},
{code:'pt',label:'Português'},{code:'ar',label:'العربية'}];
type Dictionary = {search:string;currency:string;localeBanner:string;verifiedNotice:string;questionAnswer:string;answerDisclaimer:string;commercialTitle:string;commercialSubtitle:string;perMonth:string;perPlacement:string;paymentSelection:string;compareTitle:string;dimension:string;demoScores:string};
export const I18N:Record<Language,Dictionary> = {
zh:{search:'搜索',currency:'支付币种',localeBanner:'九语言访问 · 双域名共享数据',verifiedNotice:'指标尚未接入真实数据，不构成实时排行',questionAnswer:'问题快速解答（演示规则）',answerDisclaimer:'示例建议，不代表实测结论；免费额度、可用地区与费用须核验官方规则。',commercialTitle:'厂商合作与 GEO 数据服务',commercialSubtitle:'用户自主选择支付币种，CNY 与 USD 套餐数字相同，不自动换算。',perMonth:'/月',perPlacement:'/次',paymentSelection:'支付需接入已审核渠道',compareTitle:'平台并排比较',dimension:'比较维度',demoScores:'演示分值'},
en:{search:'Search',currency:'Currency',localeBanner:'9 languages · shared catalog across domains',verifiedNotice:'Live data not connected; not a live ranking',questionAnswer:'Quick answer (prototype)',answerDisclaimer:'Suggestions are illustrative; verify limits, regions and costs at official sources.',commercialTitle:'Vendor partnerships & GEO intelligence',commercialSubtitle:'Choose CNY or USD; identical nominal numbers without exchange conversion.',perMonth:'/month',perPlacement:'/placement',paymentSelection:'Payment integration pending',compareTitle:'Side-by-side comparison',dimension:'Metric',demoScores:'Demo scores'},
ja:{search:'検索',currency:'通貨',localeBanner:'9言語・共通データ',verifiedNotice:'実データ未接続',questionAnswer:'簡易回答（試作）',answerDisclaimer:'費用と制限は公式サイトで確認',commercialTitle:'企業向けサービス',commercialSubtitle:'CNY / USD を選択・同じ数値',perMonth:'/月',perPlacement:'/件',paymentSelection:'決済連携準備中',compareTitle:'サービス比較',dimension:'項目',demoScores:'参考スコア'},
ko:{search:'검색',currency:'통화',localeBanner:'9개 언어 · 데이터 공유',verifiedNotice:'실시간 데이터 미연결',questionAnswer:'빠른 답변 (시제품)',answerDisclaimer:'공식 요금 및 제한 확인 필요',commercialTitle:'기업 서비스',commercialSubtitle:'CNY / USD 선택, 동일한 숫자',perMonth:'/월',perPlacement:'/건',paymentSelection:'결제 연동 예정',compareTitle:'서비스 비교',dimension:'항목',demoScores:'예시 점수'},
fr:{search:'Rechercher',currency:'Devise',localeBanner:'9 langues · données partagées',verifiedNotice:'Données réelles non connectées',questionAnswer:'Réponse rapide (prototype)',answerDisclaimer:'Vérifiez les tarifs et limites officiels.',commercialTitle:'Services pour éditeurs',commercialSubtitle:'Choisissez CNY ou USD, mêmes montants nominaux.',perMonth:'/mois',perPlacement:'/offre',paymentSelection:'Paiement à connecter',compareTitle:'Comparaison',dimension:'Critère',demoScores:'Scores fictifs'},
de:{search:'Suchen',currency:'Währung',localeBanner:'9 Sprachen · gemeinsame Daten',verifiedNotice:'Keine Live-Daten verbunden',questionAnswer:'Schnellantwort (Prototyp)',answerDisclaimer:'Preise und Grenzen offiziell prüfen.',commercialTitle:'Anbieterdienste',commercialSubtitle:'CNY oder USD wählen, gleicher Nennbetrag.',perMonth:'/Monat',perPlacement:'/Eintrag',paymentSelection:'Zahlung noch nicht aktiv',compareTitle:'Vergleich',dimension:'Merkmal',demoScores:'Demowerte'},
es:{search:'Buscar',currency:'Moneda',localeBanner:'9 idiomas · datos compartidos',verifiedNotice:'Sin datos reales conectados',questionAnswer:'Respuesta rápida (prototipo)',answerDisclaimer:'Verifique precios y límites oficiales.',commercialTitle:'Servicios para proveedores',commercialSubtitle:'Elija CNY o USD, mismos números nominales.',perMonth:'/mes',perPlacement:'/publicación',paymentSelection:'Pago pendiente',compareTitle:'Comparar',dimension:'Atributo',demoScores:'Puntuación de prueba'},
pt:{search:'Buscar',currency:'Moeda',localeBanner:'9 idiomas · dados compartilhados',verifiedNotice:'Sem dados reais conectados',questionAnswer:'Resposta rápida (protótipo)',answerDisclaimer:'Confira preços e limites oficiais.',commercialTitle:'Serviços para fornecedores',commercialSubtitle:'Escolha CNY ou USD, números nominais iguais.',perMonth:'/mês',perPlacement:'/anúncio',paymentSelection:'Pagamento pendente',compareTitle:'Comparação',dimension:'Atributo',demoScores:'Pontuações demo'},
ar:{search:'بحث',currency:'العملة',localeBanner:'٩ لغات · بيانات مشتركة',verifiedNotice:'البيانات المباشرة غير متصلة',questionAnswer:'إجابة سريعة (تجريبية)',answerDisclaimer:'تحقق من الأسعار والقيود الرسمية.',commercialTitle:'خدمات الشركات',commercialSubtitle:'اختر اليوان أو الدولار بنفس الرقم.',perMonth:'/شهر',perPlacement:'/إعلان',paymentSelection:'الدفع غير متصل بعد',compareTitle:'مقارنة المنصات',dimension:'المعيار',demoScores:'نتائج تجريبية'}
};
type Price={id:string;amount:number;interval:'monthly'|'placement';label:Record<Language,string>};
const names=(zh:string,en:string):Record<Language,string>=>({zh,en,ja:en,ko:en,fr:en,de:en,es:en,pt:en,ar:en});
export const pricing:Price[]=[
{id:'listing',amount:0,interval:'monthly',label:names('基础收录','Basic listing')},
{id:'geo',amount:29,interval:'monthly',label:names('GEO 排名监测','GEO monitoring')},
{id:'sponsored',amount:49,interval:'monthly',label:names('厂商推广','Sponsored placement')},
{id:'brand',amount:149,interval:'placement',label:names('品牌展示','Brand feature')}];
export const compareFields:{key:keyof Platform;label:Record<Language,string>}[]=[
{key:'company',label:names('所属公司','Company')},{key:'category',label:names('产品类别','Category')},
{key:'year',label:names('公司成立','Founded')},{key:'funding',label:names('融资资料','Funding')},
{key:'listing',label:names('上市情况','Listing')},{key:'price',label:names('产品价格','Product price')},
{key:'free',label:names('免费额度','Free allowance')},{key:'restrictions',label:names('使用限制','Limitations')}];
export function answerQuestion(query:string):string {
 const q=query.trim().toLowerCase();if(!q)return '请输入 AI 平台、功能或你希望完成的任务。';
 if(/视频|video|runway|luma|sora|可灵|pika/.test(q))return '视频生成可先比较 Runway、Luma 等工具。重点检查最长视频时长、人物一致性、免费积分、失败是否扣费、导出水印及所在地区可用性。当前尚无统一实测排名。';
 if(/代码|编程|code|coding|deepseek|qwen|千问|cursor/.test(q))return '编程任务建议逐项比较代码库上下文、仓库编辑、自动测试、部署能力、费用与模型版本；当前目录收录 DeepSeek、Qwen 等，尚无可核验的综合优劣结论。';
 if(/免费|价格|多少钱|free|cost|price/.test(q))return '优先查看免费额度、恢复周期、单次任务消耗、失败是否扣积分、输出版权与导出限制；不同地区、套餐及模型版本会影响最终成本。';
 if(/chatgpt|grok|gemini|claude/.test(q))return '可比较研究能力、联网信息、引用可核验性、使用额度及订阅方案；目前没有统一盲测结果，不给出未经验证的赢家。';
 return '已收到你的问题。当前为离线规则匹配演示，后续将接入带证据的自然语言检索，直接显示可用工具、费用、限制与来源。';
}
