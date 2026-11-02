import type {Language} from '../lib/v2';
import {CODEX_OFFICIAL,codexFor} from '../lib/market-codex-product';

/** This is a capability within the OpenAI product family, not a fabricated 33rd listing. */
export default function MarketCodexSection({language}:{language:Language}){
 const t=codexFor(language);
 return <section className="panel marketCodexSection" aria-label={t.title}>
  <div className="marketCodexHeading"><h2>{t.title}</h2><a href={CODEX_OFFICIAL.direct} target="_blank" rel="noopener noreferrer">{t.linkLabel} ↗</a></div>
  <p className="marketCodexIntro">{t.intro}</p>
  <div className="marketCodexTasks">{t.tasks.map((task,i)=><div key={task}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><strong>{task}</strong></div>)}</div>
  <div className="marketCodexMeta">
   <div><strong>{t.waysTitle}</strong><p>{t.ways}</p></div>
   <div><strong>{t.planTitle}</strong><p>{t.plan}</p></div>
   <div><strong>{t.limitTitle}</strong><p>{t.limit}</p></div>
  </div>
  <a className="marketCodexOfficial" href={CODEX_OFFICIAL.product} target="_blank" rel="noopener noreferrer">{t.guideLabel} ↗</a>
 </section>;
}
