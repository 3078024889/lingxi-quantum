export type LingxiIconName=
  |"new"|"home"|"products"|"tools"|"explore"|"sasi"
  |"book"|"learning"|"research"|"wallet"|"account"
  |"drama"|"website"|"folder"|"connections"|"settings"
  |"orders"|"refund"|"mail"|"burn"|"image"|"video"
  |"audio"|"subtitle"|"table"|"privacy"|"recognition"
  |"document"|"pdf"|"ocr"|"food"|"qr"|"sparkles";

const ICON:Record<LingxiIconName,string>={
  new:"✨",home:"🏠",products:"🧩",tools:"🧰",explore:"🧭",sasi:"🪄",
  book:"📚",learning:"🎓",research:"🔬",wallet:"💎",account:"👤",
  drama:"🎬",website:"🌐",folder:"📁",connections:"🔌",settings:"⚙️",
  orders:"📋",refund:"💸",mail:"✉️",burn:"🔥",image:"🖼️",video:"🎞️",
  audio:"🎙️",subtitle:"💬",table:"📊",privacy:"🔒",recognition:"🔎",
  document:"📄",pdf:"📕",ocr:"🔤",food:"🥗",qr:"🔳",sparkles:"✨"
};

const TONE:Record<LingxiIconName,string>={
  new:"gold",home:"sky",products:"violet",tools:"amber",explore:"indigo",sasi:"sasi",
  book:"book",learning:"violet",research:"research",wallet:"cyan",account:"slate",
  drama:"rose",website:"sky",folder:"amber",connections:"blue",settings:"slate",
  orders:"blue",refund:"rose",mail:"violet",burn:"fire",image:"image",video:"violet",
  audio:"indigo",subtitle:"blue",table:"green",privacy:"violet",recognition:"cyan",
  document:"paper",pdf:"pdf",ocr:"rose",food:"green",qr:"cyan",sparkles:"gold"
};

export default function LingxiMiniIcon({
  name,size="card",className=""
}:{name:LingxiIconName;size?:"nav"|"title"|"card"|"tiny";className?:string}){
  return <span
    className={`lx-mini-icon lx-mini-icon-${size} lx-mini-tone-${TONE[name]} ${className}`.trim()}
    aria-hidden="true"
  ><span>{ICON[name]}</span></span>;
}
