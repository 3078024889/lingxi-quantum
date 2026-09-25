"use client";
import {type ReactNode} from "react";
export function SasiComposer({lang,kind:_kind,setKind:_setKind,value,onChange,onPaste,attachments,busy,signedIn,onSubmit,onConnections,onSkills,projects,onOpen}:{
 lang:"zh"|"en";kind:"drama"|"code";setKind:(kind:"drama"|"code")=>void;value:string;onChange:(value:string)=>void;
 onPaste:React.ClipboardEventHandler<HTMLTextAreaElement>;attachments:ReactNode;busy:boolean;signedIn:boolean;
 onSubmit:(kind:"drama"|"code")=>void;onConnections:()=>void;onSkills:()=>void;projects:{id:string;title:string}[];onOpen:(id:string)=>void;
}){
 const zh=lang==="zh";
 return <section className="sasi-conversation">
  <div className="sasi-conversation-heading"><span className="sasi-orbit" aria-hidden="true">✦</span><p>SASI · {zh?"你的创作伙伴":"Your creative companion"}</p><h1>{zh?"把故事带进来。":"Bring the story in."}</h1><p>{zh?"可以从一句故事、完整剧本、人物参考或已有素材开始。":"Start from one idea, a full script, character references or assets you already have."}</p></div>
  <form className="sasi-composer" onSubmit={event=>{event.preventDefault();onSubmit("drama")}}><fieldset disabled={busy}>
   <textarea aria-label={zh?"描述你的短剧":"Describe your drama"} value={value} maxLength={100000} onChange={event=>onChange(event.target.value)} onPaste={onPaste} placeholder={zh?"例如：把这份小说做成竖屏短剧。人物参考、场景和已有镜头都在附件里……":"Example: turn this story into a vertical drama. Character references, scenes and existing shots are attached…"}/>
   {attachments}
   <div className="sasi-composer-actions"><div><button type="button" onClick={onSkills}>◇ Skills</button><button type="button" onClick={onConnections}>⌁ {zh?"模型与 API":"Models & APIs"}</button></div><button className="sasi-send" type="submit">{busy?(zh?"正在保存…":"Saving…"):(zh?"开始这个项目":"Start this project")} <span aria-hidden="true">↑</span></button></div>
  </fieldset></form>
  <p className="sasi-composer-note">{zh?"先把故事和素材保存下来；真正开始生成前，你会先看到本次规格、Skill 和预算。":"Save the story and assets first. Before generation starts, you will see the specification, Skill and budget."}</p>
  {!signedIn&&<a className="sasi-composer-signin" href="/account?next=%2Fsasi%2Fdrama">{zh?"登录后保存项目，下次回来继续":"Sign in to save the project and continue later"} →</a>}
  <a className="sasi-composer-signin" href="/sasi/assemble">{zh?"已经有镜头？直接合成成片":"Already have shots? Assemble the final video"} →</a>
  {projects.length>0&&<div className="sasi-conversation-recents"><h2>{zh?"接着上次的故事":"Continue a previous story"}</h2>{projects.slice(0,4).map(project=><button type="button" key={project.id} onClick={()=>onOpen(project.id)}><span>↗</span><span>{project.title}</span></button>)}</div>}
 </section>
}
