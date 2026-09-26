export type ScriptScene = {
  id:string;
  text:string;
  durationSec:number;
  character:string;
  place:string;
  framing:"全景"|"中景"|"近景"|"特写"|"过肩";
  camera:string;
  mood:"平静"|"悬疑"|"紧张"|"温暖"|"压迫"|"轻快"|"悲伤";
  action:string;
  props:string[];
  visualIntent:string;
};

function estimateDuration(text:string){
  const chars=text.replace(/\s+/g,"").length;
  const dialogue=(text.match(/[“”"：:]/g)??[]).length>0;
  return Math.max(2.8,Math.min(9.5,chars/(dialogue?7.2:8.6)));
}

function characterNames(script:string){
  const names:string[]=[];
  const patterns=[
    /([\u3400-\u9fff]{2,4})(?=[：:])/g,
    /([\u3400-\u9fff]{2,4})(?=(?:说|问|喊|答|笑|哭|走|看|拿|举|转身|抬头|低头|跑|站|坐))/g,
  ];
  for(const pattern of patterns){
    for(const match of script.matchAll(pattern)){
      const name=match[1];
      if(!/^(然后|但是|所以|因为|如果|突然|一个|这个|那个|他们|她们|我们|自己|城市|深夜|车门|照片)$/.test(name))names.push(name);
    }
  }
  return [...new Set(names)].slice(0,8);
}

function placeFrom(text:string,index:number){
  const direct=text.match(/(?:在|来到|走进|回到|进入|穿过)([^，。！？!?；;]{2,18})/);
  if(direct?.[1])return direct[1].trim();
  const places=[
    "地铁站","站台","地铁","车厢","房间","办公室","学校","教室","医院","街道","餐厅",
    "车站","机场","公园","商场","家里","公司","走廊","电梯","车里","图书馆","天台","酒店",
  ];
  return places.find(place=>text.includes(place))??`场景 ${index+1}`;
}

function moodFrom(text:string):ScriptScene["mood"]{
  if(/恐惧|诡异|一模一样|陌生|黑暗|深夜|旧照片|失踪|秘密|影子|悬疑/.test(text))return"悬疑";
  if(/追|跑|逃|撞|打|爆|尖叫|突然|危险|冲/.test(text))return"紧张";
  if(/哭|离开|告别|遗憾|死|失去|雨/.test(text))return"悲伤";
  if(/拥抱|笑|阳光|家|重逢|温柔|喜欢/.test(text))return"温暖";
  if(/压迫|逼近|审讯|困住|窒息/.test(text))return"压迫";
  if(/开心|轻松|玩|跳|庆祝/.test(text))return"轻快";
  return"平静";
}

function actionFrom(text:string){
  const actions=[
    "抬头","低头","回头","转身","走近","走进","跑","追","站着","坐下","看见","看向","拿起",
    "举起","放下","打开","关闭","进站","离开","拥抱","哭","笑","说","问","递给",
  ];
  return actions.find(x=>text.includes(x))??"观察";
}

function propsFrom(text:string){
  const props=["照片","手机","信","刀","枪","书","钥匙","箱子","伞","杯子","门","车门","镜子","灯","电脑","包","花"];
  return props.filter(x=>text.includes(x)).slice(0,4);
}

function directionFor(text:string,index:number){
  const mood=moodFrom(text);
  const action=actionFrom(text);
  const props=propsFrom(text);

  let framing:ScriptScene["framing"]="中景";
  if(/照片|手机|钥匙|眼睛|手里|举起|特写|细节/.test(text))framing="特写";
  else if(/对面|两个人|一模一样|背影|关系/.test(text))framing="过肩";
  else if(/城市|街道|站台|机场|房间|全貌|进站/.test(text))framing="全景";
  else if(/看见|抬头|回头|表情/.test(text))framing="近景";

  let camera="缓慢推近";
  if(/跑|追|冲|逃|跟随/.test(text))camera="跟随人物";
  else if(/进站|驶来|经过|横向/.test(text))camera="横向跟移";
  else if(/突然|发现|看见|一模一样/.test(text))camera="停顿后推近";
  else if(framing==="特写")camera="静止特写";
  else if(index%4===3)camera="轻微横移";

  const intent = mood==="悬疑"
    ? "保留暗部与距离感，把异常细节留到画面后半段出现。"
    : mood==="紧张"
      ? "缩短视觉停顿，让主体运动方向保持连续。"
      : mood==="悲伤"
        ? "减少快速切换，让人物与环境留出呼吸。"
        : mood==="温暖"
          ? "让人物关系成为画面中心，背景保持柔和。"
          : "先交代空间，再把注意力收回到人物和动作。";

  return {mood,action,props,framing,camera,visualIntent:intent};
}

export function scriptToScenes(script:string,maxScenes=24):ScriptScene[]{
  const clean=String(script??"").replace(/\r/g,"").trim();
  if(!clean)return[];
  const blocks=clean
    .split(/\n{2,}|(?<=[。！？!?])\s*(?=[^\s])/u)
    .map(x=>x.trim())
    .filter(Boolean);
  const source=blocks.length?blocks:[clean];
  const names=characterNames(clean);

  return source.slice(0,maxScenes).map((text,i)=>{
    const direction=directionFor(text,i);
    return {
      id:`scene-${String(i+1).padStart(2,"0")}`,
      text:text.slice(0,900),
      durationSec:Number(estimateDuration(text).toFixed(1)),
      character:names.find(name=>text.includes(name))??names[0]??(/女孩|女人|女子/.test(text)?"女孩":/男孩|男人|男子/.test(text)?"男子":"主要人物"),
      place:placeFrom(text,i),
      ...direction,
    };
  });
}
