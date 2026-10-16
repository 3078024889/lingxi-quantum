import {isPublicPaidToolId} from './paid-catalog';
import type {PublicToolSurfaceItem} from './public-surface';
import type {LingxiLang} from '@/lib/lingxi-i18n';

// Local execution alone does not imply free export: paid PDF/OCR/audio tools stay excluded.
export function isAnonymousLocalTool(tool:Pick<PublicToolSurfaceItem,'slug'|'localOnly'>){return tool.localOnly&&!isPublicPaidToolId(tool.slug)&&tool.slug!=='document-translate'&&tool.slug!=='url-to-video'}
const copy:Record<LingxiLang,string[]>={
 zh:['全部服务','免费本地工具','每日免费体验','使用方式'],
 en:['All services','Free local tools','Daily free trial','Access'],
 ja:['すべてのサービス','無料ローカルツール','毎日無料体験','利用方法'],
 ko:['모든 서비스','무료 로컬 도구','매일 무료 체험','사용 방식'],
 fr:['Tous les services','Outils locaux gratuits','Essai gratuit quotidien','Accès'],
 de:['Alle Dienste','Kostenlose lokale Tools','Tägliche kostenlose Testnutzung','Zugang'],
 es:['Todos los servicios','Herramientas locales gratis','Prueba diaria gratuita','Acceso'],
 pt:['Todos os serviços','Ferramentas locais grátis','Teste diário gratuito','Acesso'],
 ar:['كل الخدمات','أدوات محلية مجانية','تجربة مجانية يومية','الوصول']
};
export function localFreeCopy(lang:LingxiLang){return copy[lang]||copy.en}
