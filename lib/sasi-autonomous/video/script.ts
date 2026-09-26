export type ScriptScene = {
  id: string;
  text: string;
  durationSec: number;
  character: string;
  place: string;
  framing: "全景" | "中景" | "近景" | "特写" | "过肩";
  camera: string;
};

function estimateDuration(text: string) {
  const chars = text.replace(/\s+/g, "").length;
  return Math.max(2.5, Math.min(8, chars / 8));
}

function characterNames(script: string) {
  const names:string[]=[];
  for(const pattern of [/([\u3400-\u9fff]{2,4})(?=[：:])/g,/([\u3400-\u9fff]{2,4})(?=(?:说|问|喊|答|笑|哭|走|看|拿|转身))/g]){
    for(const match of script.matchAll(pattern)){
      const name=match[1];
      if(!/^(然后|但是|所以|因为|如果|突然|一个|这个|那个|他们|她们|我们|自己)$/.test(name)) names.push(name);
    }
  }
  return [...new Set(names)].slice(0,8);
}

function placeFrom(text:string,index:number){
  const direct=text.match(/(?:在|来到|走进|回到|进入)([^，。！？!?；;]{2,18})/);
  if(direct?.[1]) return direct[1].trim();
  const places=["房间","办公室","学校","教室","医院","街道","餐厅","车站","机场","公园","商场","家里","公司","走廊","电梯","车里","图书馆"];
  return places.find((place)=>text.includes(place)) ?? `场景 ${index+1}`;
}

export function scriptToScenes(script: string, maxScenes = 24): ScriptScene[] {
  const clean = String(script ?? "").replace(/\r/g, "").trim();
  if (!clean) return [];
  const blocks = clean.split(/\n{2,}|(?<=[。！？!?])\s*(?=[^\s])/u).map((x) => x.trim()).filter(Boolean);
  const source = blocks.length ? blocks : [clean];
  const names=characterNames(clean);
  const framings:ScriptScene["framing"][]=["中景","近景","过肩","全景","特写"];
  const cameras=["缓慢推近","固定机位","轻微横移","跟随人物","静止后切近景"];
  return source.slice(0,maxScenes).map((text,i)=>({
    id:`scene-${String(i+1).padStart(2,"0")}`,
    text:text.slice(0,900),
    durationSec:Number(estimateDuration(text).toFixed(1)),
    character:names.find((name)=>text.includes(name)) ?? names[0] ?? "主要人物",
    place:placeFrom(text,i),
    framing:framings[i%framings.length],
    camera:cameras[i%cameras.length],
  }));
}
