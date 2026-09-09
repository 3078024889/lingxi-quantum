"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Props={lang:"zh"|"en";dark:boolean;accountEmail:string|null};
type Source={id:string;title:string;source_type:string;rights_scope:string;trainability:string;character_count:number;extracted_count:number;created_at:string};
type Item={id:string;category:string;title:string;statement:string;tier:"bronze"|"silver"|"gold";trainability:string;quality_score:number;review_status:string};
type Character={id:string;character_key:string;display_name:string;permanent_identity:Record<string,unknown>;identity_version:number};
type TimelineEvent={id:string;episode:number;scene:number;sequence:number;script_event:string;state_patch:Record<string,unknown>;resolvedState:Record<string,unknown>};
type Payload={sources:Source[];items:Item[];characters:Character[];timelines:Record<string,TimelineEvent[]>;boundary:{rawConversationStored:boolean;teacherGenerationEnabled:boolean;visualDatasetEnabled:boolean;trainingEnabled:boolean}};

const EMPTY:Payload={sources:[],items:[],characters:[],timelines:{},boundary:{rawConversationStored:false,teacherGenerationEnabled:false,visualDatasetEnabled:false,trainingEnabled:false}};

export default function CangXuanDataFoundry({lang,dark,accountEmail}:Props){
  const t=(zh:string,en:string)=>lang==="zh"?zh:en;
  const panel=dark?"border-white/10 bg-white/[.035]":"border-[#e3e9f1] bg-white shadow-[0_14px_36px_rgba(38,57,83,.065)]";
  const [data,setData]=useState<Payload>(EMPTY);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState("");
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");
  const [rights,setRights]=useState("private_reference");
  const [consent,setConsent]=useState(false);
  const [characterName,setCharacterName]=useState("");
  const [identity,setIdentity]=useState({face:"",body:"",voice:"",personality:""});
  const [selectedCharacter,setSelectedCharacter]=useState("");
  const [event,setEvent]=useState({episode:1,scene:1,scriptEvent:"",costume:"",emotion:"",injury:"",voiceState:""});

  const refresh=useCallback(async()=>{
    if(!accountEmail)return;
    const response=await fetch("/api/sasi/foundry",{cache:"no-store"});
    if(response.ok)setData(await response.json());
    else if(response.status===503)setNotice(lang==="zh"?"数据工厂迁移尚未应用。先部署最新数据库迁移。":"The Data Foundry migration has not been applied.");
  },[accountEmail,lang]);
  useEffect(()=>{void refresh();},[refresh]);
  useEffect(()=>{if(!selectedCharacter&&data.characters[0])setSelectedCharacter(data.characters[0].id);},[data.characters,selectedCharacter]);

  const counts=useMemo(()=>({
    bronze:data.items.filter((item)=>item.tier==="bronze").length,
    silver:data.items.filter((item)=>item.tier==="silver").length,
    gold:data.items.filter((item)=>item.tier==="gold").length,
    trainable:data.items.filter((item)=>item.trainability==="trainable").length,
  }),[data.items]);

  async function post(body:Record<string,unknown>){
    setLoading(true);setNotice("");
    try{
      const response=await fetch("/api/sasi/foundry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||"REQUEST_FAILED");
      await refresh();return result;
    }catch(error){setNotice(t(`操作未完成：${error instanceof Error?error.message:"UNKNOWN"}`,`Not completed: ${error instanceof Error?error.message:"UNKNOWN"}`));return null}
    finally{setLoading(false)}
  }

  async function importConversation(){
    const result=await post({action:"import",title,content,sourceType:"conversation_paste",rightsScope:rights,trainingOptIn:rights==="opted_in_training"&&consent});
    if(result){setContent("");setTitle("");setNotice(result.deduplicated?t("内容已存在，未重复写入。","Duplicate detected; nothing was written."):t(`已提炼 ${result.extractedCount} 条 Bronze 导演知识。原始对话未保存。`,`Extracted ${result.extractedCount} Bronze items. Raw conversation was not stored.`));}
  }

  async function saveCharacter(){
    const permanentIdentity=Object.fromEntries(Object.entries(identity).filter(([,value])=>value.trim()));
    const result=await post({action:"character",displayName:characterName,characterKey:`CHAR_${characterName}`,permanentIdentity});
    if(result){setCharacterName("");setIdentity({face:"",body:"",voice:"",personality:""});setNotice(t("角色永久身份已建立。","Permanent identity created."));}
  }

  async function saveEvent(){
    const statePatch=Object.fromEntries([["costume",event.costume],["emotion",event.emotion],["injury",event.injury],["voice_state",event.voiceState]].filter(([,value])=>String(value).trim()));
    const result=await post({action:"event",characterId:selectedCharacter,episode:event.episode,scene:event.scene,sequence:1,scriptEvent:event.scriptEvent,statePatch});
    if(result){setEvent({...event,scriptEvent:"",costume:"",emotion:"",injury:"",voiceState:""});setNotice(t("状态事件已写入连续性时间线。","State event added to the continuity timeline."));}
  }

  return <div className="mt-8 space-y-6" data-testid="cangxuan-data-foundry">
    <section className="rounded-[28px] border border-[#7657ff]/25 bg-gradient-to-br from-[#7657ff]/12 to-transparent p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">CANGXUAN DATA FOUNDRY · V0</p>
      <h2 className="mt-3 text-3xl font-semibold">{t("苍玄数据工厂与世界记忆","Data Foundry & World Memory")}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 opacity-65">{t("把对话提炼成导演规则，把角色经历写成可追溯状态。V0 使用本地确定性提炼，不调用 Teacher Model，不训练模型，也不保存原始对话。","Extract directing rules from conversations and record character changes as traceable state. V0 uses deterministic local extraction: no teacher calls, training or raw conversation storage.")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[counts.bronze,"Bronze"],[counts.silver,"Silver"],[counts.gold,"Gold"],[counts.trainable,t("已授权训练","Trainable")]].map(([value,label])=><div key={String(label)} className="rounded-2xl border border-current/10 p-4"><strong className="text-2xl">{value}</strong><span className="mt-1 block text-xs opacity-50">{label}</span></div>)}</div>
    </section>

    {!accountEmail&&<section className={`rounded-3xl border p-6 ${panel}`}><h3 className="font-semibold">{t("登录后建立你的私有导演数据资产","Sign in to build your private directing assets")}</h3><p className="mt-2 text-sm opacity-55">{t("未登录时不会收集或上传对话。","No conversation is collected or uploaded while signed out.")}</p></section>}

    {accountEmail&&<>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className={`rounded-3xl border p-6 ${panel}`}>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7657ff]">CONVERSATION IMPORTER</p><h3 className="mt-2 text-xl font-semibold">{t("导入一段导演对话","Import a directing conversation")}</h3>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={t("来源标题，例如：短剧节奏讨论","Source title, e.g. short-drama pacing review")} className="mt-5 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none"/>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder={t("粘贴用户要求、方案、纠正与最终决定……","Paste requirements, proposals, corrections and final decisions…")} className="mt-3 min-h-44 w-full resize-y rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm leading-7 outline-none"/>
          <select value={rights} onChange={e=>{setRights(e.target.value);setConsent(false)}} className={`mt-3 w-full rounded-xl border border-current/15 px-4 py-3 text-sm ${dark?"bg-[#11151b]":"bg-white"}`}><option value="private_reference">{t("仅用于我的项目，不进入训练池","Private project use; not trainable")}</option><option value="opted_in_training">{t("匿名化后允许改进苍玄","Opt in to anonymized training")}</option><option value="research_only">{t("仅研究/评测，不用于商业训练","Research/evaluation only")}</option><option value="blocked">{t("禁止使用","Blocked")}</option></select>
          {rights==="opted_in_training"&&<label className="mt-3 flex gap-3 text-xs leading-6"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>{t("我明确同意将提炼后的导演知识用于改进苍玄；系统会移除常见联系方式与密钥格式，原始对话不保存。","I explicitly consent to using extracted directing knowledge to improve CangXuan. Common contact and credential patterns are redacted, and raw conversation is not stored.")}</span></label>}
          <button disabled={loading||!title.trim()||content.trim().length<20||(rights==="opted_in_training"&&!consent)} onClick={importConversation} className="mt-4 w-full rounded-xl bg-[#7657ff] py-3 text-sm font-semibold text-white disabled:opacity-40">{loading?t("正在提炼…","Extracting…"):t("提炼并写入 Bronze","Extract to Bronze")}</button>
        </section>
        <section className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7657ff]">PROVENANCE LEDGER</p><h3 className="mt-2 text-xl font-semibold">{t("来源与许可账本","Source & rights ledger")}</h3><div className="mt-5 space-y-3">{data.sources.length?data.sources.map(source=><article key={source.id} className="rounded-2xl border border-current/10 p-4"><div className="flex justify-between gap-3"><strong className="text-sm">{source.title}</strong><span className="text-[10px] uppercase text-[#7657ff]">{source.trainability}</span></div><p className="mt-2 text-xs opacity-50">{source.character_count.toLocaleString()} chars · {source.extracted_count} items · {source.rights_scope}</p></article>):<p className="text-sm leading-7 opacity-45">{t("尚无来源。默认导入只服务当前账户，不进入训练池。","No sources yet. Imports default to private account use and never enter training.")}</p>}</div></section>
      </div>

      <section className={`rounded-3xl border p-6 ${panel}`}><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7657ff]">KNOWLEDGE ITEMS</p><h3 className="mt-2 text-xl font-semibold">{t("结构化导演知识","Structured directing knowledge")}</h3></div><span className="text-xs opacity-45">{t("Bronze 需经多模型或人工复核后才能升级","Bronze requires model consensus or human review to advance")}</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{data.items.slice(0,12).map(item=><article key={item.id} className="rounded-2xl border border-current/10 p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] text-[#7657ff]">{item.category}</span><span className="text-[10px] uppercase opacity-40">{item.tier} · {Math.round(Number(item.quality_score)*100)}</span></div><p className="mt-3 text-sm leading-6 opacity-75">{item.statement}</p></article>)}</div></section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#42b7a4]">PERMANENT IDENTITY</p><h3 className="mt-2 text-xl font-semibold">{t("建立角色永久身份","Create permanent identity")}</h3><input value={characterName} onChange={e=>setCharacterName(e.target.value)} placeholder={t("角色名","Character name")} className="mt-5 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm"/><div className="mt-3 grid gap-3 sm:grid-cols-2">{([["face","脸型、五官与骨相","Face and bone structure"],["body","身高与体型","Height and body"],["voice","固定音色与咬字","Voice identity"],["personality","核心性格","Core personality"]] as const).map(([key,zh,en])=><input key={key} value={identity[key]} onChange={e=>setIdentity({...identity,[key]:e.target.value})} placeholder={t(zh,en)} className="rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm"/>)}</div><button disabled={loading||!characterName.trim()||!Object.values(identity).some(Boolean)} onClick={saveCharacter} className="mt-4 w-full rounded-xl bg-[#151515] py-3 text-sm font-semibold text-white disabled:opacity-40">{t("锁定身份 V1","Lock identity V1")}</button></section>
        <section className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#42b7a4]">DYNAMIC STATE</p><h3 className="mt-2 text-xl font-semibold">{t("写入剧情状态变化","Record narrative state change")}</h3><select value={selectedCharacter} onChange={e=>setSelectedCharacter(e.target.value)} className={`mt-5 w-full rounded-xl border border-current/15 px-4 py-3 text-sm ${dark?"bg-[#11151b]":"bg-white"}`}><option value="">{t("先建立角色","Create a character first")}</option>{data.characters.map(c=><option key={c.id} value={c.id}>{c.display_name} · {c.character_key}</option>)}</select><div className="mt-3 grid grid-cols-2 gap-3"><input type="number" min="1" value={event.episode} onChange={e=>setEvent({...event,episode:Number(e.target.value)})} className="rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm" placeholder={t("集","Episode")}/><input type="number" min="1" value={event.scene} onChange={e=>setEvent({...event,scene:Number(e.target.value)})} className="rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm" placeholder={t("场","Scene")}/></div><input value={event.scriptEvent} onChange={e=>setEvent({...event,scriptEvent:e.target.value})} placeholder={t("剧情事件，例如：右肩中箭","Script event, e.g. arrow wound to right shoulder")} className="mt-3 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm"/><div className="mt-3 grid gap-3 sm:grid-cols-2">{([["costume","服装状态","Costume"],["emotion","情绪状态","Emotion"],["injury","伤势状态","Injury"],["voiceState","声音状态","Voice state"]] as const).map(([key,zh,en])=><input key={key} value={event[key]} onChange={e=>setEvent({...event,[key]:e.target.value})} placeholder={t(zh,en)} className="rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm"/>)}</div><button disabled={loading||!selectedCharacter||!event.scriptEvent.trim()||![event.costume,event.emotion,event.injury,event.voiceState].some(Boolean)} onClick={saveEvent} className="mt-4 w-full rounded-xl bg-[#42b7a4] py-3 text-sm font-semibold text-white disabled:opacity-40">{t("写入连续性时间线","Add to continuity timeline")}</button></section>
      </div>

      <section className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#42b7a4]">CONTINUITY TIMELINE</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{data.characters.map(character=><article key={character.id} className="rounded-2xl border border-current/10 p-5"><h3 className="font-semibold">{character.display_name}</h3><p className="mt-1 text-[10px] uppercase tracking-[.12em] opacity-40">{character.character_key} · identity v{character.identity_version}</p><div className="mt-4 space-y-3">{(data.timelines[character.id]??[]).map(item=><div key={item.id} className="border-l-2 border-[#42b7a4]/40 pl-4"><p className="text-xs text-[#42b7a4]">E{item.episode} · S{item.scene}</p><p className="mt-1 text-sm">{item.script_event}</p><p className="mt-1 text-[11px] leading-5 opacity-45">{Object.entries(item.resolvedState).map(([k,v])=>`${k}: ${String(v)}`).join(" · ")}</p></div>)}</div></article>)}</div></section>
    </>}
    {notice&&<div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm">{notice}</div>}
  </div>;
}
