"use client";

import {type ChangeEvent,useEffect,useState} from "react";

type Lang="zh"|"en";
type SkillItem={
  id:string;
  titleZh?:string;
  titleEn?:string;
  summaryZh?:string;
  summaryEn?:string;
  name?:string;
  description?:string;
};

const copy=(lang:Lang,zh:string,en:string)=>lang==="zh"?zh:en;

export default function SasiSkillsPanel({
  lang,
  dark,
  setNotice,
}:{
  lang:Lang;
  dark:boolean;
  setNotice:(message:string)=>void;
}){
  const[platform,setPlatform]=useState<SkillItem[]>([]);
  const[mine,setMine]=useState<SkillItem[]>([]);
  const[selected,setSelected]=useState<{source:"platform"|"user";id:string;title:string}|null>(null);
  const[uploading,setUploading]=useState(false);

  async function load(){
    try{
      const response=await fetch("/api/sasi/skills",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error();
      setPlatform(Array.isArray(data.platform)?data.platform:[]);
      setMine(Array.isArray(data.mine)?data.mine:[]);
    }catch{
      setNotice(copy(lang,"Skills 暂时无法读取，请稍后再试。","Skills are temporarily unavailable."));
    }
  }

  useEffect(()=>{
    void load();
    try{
      const raw=sessionStorage.getItem("sasi-selected-skill-v1");
      if(raw)setSelected(JSON.parse(raw));
    }catch{}
  },[]);

  function choose(source:"platform"|"user",id:string,title:string){
    const value={source,id,title};
    setSelected(value);
    sessionStorage.setItem("sasi-selected-skill-v1",JSON.stringify(value));
    setNotice(copy(
      lang,
      `已选择「${title}」。下一次镜头预算会一起计算这个 Skill。`,
      `${title} selected. Your next shot price will include this Skill.`,
    ));
  }

  async function upload(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    event.target.value="";
    if(!file)return;
    setUploading(true);
    try{
      const form=new FormData();
      form.set("file",file);
      const response=await fetch("/api/sasi/skills",{method:"POST",body:form});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"UPLOAD_FAILED");
      await load();
      choose("user",String(data.skill.id),String(data.skill.name));
    }catch{
      setNotice(copy(
        lang,
        "这个 Skill 没有保存下来。请使用 .md、.txt、.json、.yaml 或 .yml 文件，大小不超过 256KB。",
        "Could not save this Skill. Use .md, .txt, .json, .yaml or .yml up to 256KB.",
      ));
    }finally{
      setUploading(false);
    }
  }

  async function remove(id:string){
    const response=await fetch("/api/sasi/skills",{
      method:"DELETE",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id}),
    });
    if(!response.ok)return;
    if(selected?.source==="user"&&selected.id===id){
      setSelected(null);
      sessionStorage.removeItem("sasi-selected-skill-v1");
    }
    await load();
  }

  const panel=dark?"border-white/10 bg-white/[.035]":"border-black/10 bg-white";

  return <section className="mx-auto max-w-5xl">
    <header className="max-w-3xl">
      <p className="text-sm opacity-50">SASI · Skills</p>
      <h1 className="mt-3 text-3xl font-semibold">
        {copy(lang,"给这次创作，选一种更懂你的做法。","Choose the way you want this creation handled.")}
      </h1>
      <p className="mt-4 text-sm leading-7 opacity-65">
        {copy(
          lang,
          "你可以直接使用灵犀场准备好的 Skill，也可以上传自己的方法。复杂能力留在内部，页面只保留你真正需要做的选择。",
          "Use a LINGXIFIELD Skill or upload your own method. Complex internal capabilities stay behind the scenes; the page keeps only the choices you need.",
        )}
      </p>
    </header>

    {selected&&<div className={`mt-7 rounded-2xl border p-4 ${panel}`}>
      <span className="text-xs opacity-50">{copy(lang,"当前选择","Selected")}</span>
      <b className="ml-3">{selected.title}</b>
      <span className="ml-3 text-xs opacity-50">
        {selected.source==="user"?copy(lang,"我的 Skill","My Skill"):copy(lang,"灵犀场 Skill","LINGXIFIELD Skill")}
      </span>
    </div>}

    <section className="mt-9">
      <h2 className="text-xl font-semibold">{copy(lang,"灵犀场 Skills","LINGXIFIELD Skills")}</h2>
      <p className="mt-2 text-sm opacity-60">{copy(lang,"直接选一个，继续回到你的故事。","Pick one and continue with your story.")}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {platform.map(skill=><button
          type="button"
          key={skill.id}
          onClick={()=>choose("platform",skill.id,copy(lang,skill.titleZh||"",skill.titleEn||""))}
          className={`rounded-2xl border p-5 text-left ${panel} ${selected?.source==="platform"&&selected.id===skill.id?"ring-2 ring-[#7657ff]/35":""}`}
        >
          <b>{copy(lang,skill.titleZh||"",skill.titleEn||"")}</b>
          <p className="mt-2 text-sm leading-6 opacity-60">{copy(lang,skill.summaryZh||"",skill.summaryEn||"")}</p>
        </button>)}
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-xl font-semibold">{copy(lang,"我的 Skills","My Skills")}</h2>
      <p className="mt-2 text-sm opacity-60">{copy(lang,"把你自己的创作方法带进来。上传后只属于你的账户。","Bring in your own creative method. Uploaded Skills stay with your account.")}</p>
      <label className="mt-5 inline-flex cursor-pointer items-center rounded-xl border border-current/15 px-5 py-3 text-sm">
        {uploading?copy(lang,"正在保存…","Saving…"):copy(lang,"＋ 上传自己的 Skill","＋ Upload my Skill")}
        <input type="file" className="hidden" accept=".md,.txt,.json,.yaml,.yml" disabled={uploading} onChange={event=>void upload(event)}/>
      </label>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {mine.map(skill=><article
          key={skill.id}
          className={`rounded-2xl border p-5 ${panel} ${selected?.source==="user"&&selected.id===skill.id?"ring-2 ring-[#7657ff]/35":""}`}
        >
          <button type="button" onClick={()=>choose("user",skill.id,String(skill.name||"Skill"))} className="w-full text-left">
            <b>{skill.name}</b>
            <p className="mt-2 text-sm leading-6 opacity-60">{skill.description||copy(lang,"你上传的创作方法","Your uploaded creative method")}</p>
          </button>
          <button type="button" onClick={()=>void remove(skill.id)} className="mt-4 text-xs opacity-45 hover:opacity-100">
            {copy(lang,"移除","Remove")}
          </button>
        </article>)}
        {!mine.length&&<p className="text-sm opacity-45">{copy(lang,"还没有上传自己的 Skill。","You have not uploaded a Skill yet.")}</p>}
      </div>
    </section>

    <section className={`mt-10 rounded-2xl border p-5 ${panel}`}>
      <h2 className="text-base font-semibold">{copy(lang,"预算怎么显示","How pricing appears")}</h2>
      <p className="mt-2 text-sm leading-7 opacity-65">
        {copy(
          lang,
          "选好 Skill，再选择时长、画质和画幅，SASI 会在真正开始前同时给出人民币和美元预算。美元数字固定为人民币数字的一半，例如 ¥9.90 / $4.95、¥30 / $15、¥50 / $25。使用你自己上传的 Skill，当前按同规格价格下调 10%，但不会低于实际制作成本。",
          "After choosing a Skill, duration, quality and format, SASI shows CNY and USD prices before anything starts. The USD number is always half the CNY number, such as ¥9.90 / $4.95, ¥30 / $15 and ¥50 / $25. Your own Skill currently receives a 10% same-spec discount without pricing below actual production cost.",
        )}
      </p>
    </section>
  </section>;
}
