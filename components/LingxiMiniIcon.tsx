export type LingxiIconName=
  |"new"|"home"|"products"|"tools"|"explore"|"sasi"
  |"book"|"learning"|"research"|"wallet"|"account"
  |"drama"|"website"|"folder"|"connections"|"settings"
  |"orders"|"refund"|"mail"|"burn"|"image"|"video"
  |"audio"|"subtitle"|"table"|"privacy"|"recognition"
  |"document"|"pdf"|"ocr"|"food"|"qr"|"sparkles"
  |"idcard"|"compare"|"translate"|"text"|"web"|"excel"|"compress"|"hash";

type Spec={glyph:string; tone:string; badge?:string; text?:boolean};

const ICON:Record<LingxiIconName,Spec>={
  new:{glyph:"✨",tone:"gold",badge:"＋"},
  home:{glyph:"🏠",tone:"sky"},
  products:{glyph:"🧩",tone:"violet"},
  tools:{glyph:"🧰",tone:"amber"},
  explore:{glyph:"🧭",tone:"indigo"},
  sasi:{glyph:"🪄",tone:"sasi",badge:"✦"},
  book:{glyph:"📘",tone:"book"},
  learning:{glyph:"🎓",tone:"violet"},
  research:{glyph:"🔬",tone:"research"},
  wallet:{glyph:"💎",tone:"cyan"},
  account:{glyph:"👤",tone:"slate"},
  drama:{glyph:"🎬",tone:"rose"},
  website:{glyph:"🌐",tone:"sky"},
  folder:{glyph:"📁",tone:"amber"},
  connections:{glyph:"🔌",tone:"blue"},
  settings:{glyph:"⚙️",tone:"slate"},
  orders:{glyph:"📋",tone:"blue"},
  refund:{glyph:"💸",tone:"fire"},
  mail:{glyph:"✉️",tone:"violet"},
  burn:{glyph:"🔥",tone:"fire"},
  image:{glyph:"🖼️",tone:"image"},
  video:{glyph:"▶️",tone:"violet",badge:"🎞️"},
  audio:{glyph:"🎙️",tone:"indigo"},
  subtitle:{glyph:"CC",tone:"blue",text:true},
  table:{glyph:"XLS",tone:"green",text:true},
  privacy:{glyph:"🔒",tone:"rose"},
  recognition:{glyph:"🔎",tone:"cyan"},
  document:{glyph:"TXT",tone:"paper",text:true},
  pdf:{glyph:"PDF",tone:"pdf",text:true},
  ocr:{glyph:"OCR",tone:"ocr",text:true},
  food:{glyph:"🥗",tone:"green"},
  qr:{glyph:"QR",tone:"cyan",text:true},
  sparkles:{glyph:"✨",tone:"gold"},
  idcard:{glyph:"🪪",tone:"sky"},
  compare:{glyph:"🆚",tone:"indigo"},
  translate:{glyph:"🌍",tone:"blue"},
  text:{glyph:"🔤",tone:"paper"},
  web:{glyph:"🌐",tone:"sky"},
  excel:{glyph:"📊",tone:"green"},
  compress:{glyph:"🗜️",tone:"amber"},
  hash:{glyph:"#",tone:"slate",text:true}
};

export default function LingxiMiniIcon({
  name,
  size="card",
  className="",
}:{name:LingxiIconName;size?:"nav"|"title"|"card"|"tiny";className?:string}){
  const spec=ICON[name]||ICON.tools;
  return <span
    className={[
      "lx-mini-icon",
      `lx-mini-icon-${size}`,
      `lx-mini-tone-${spec.tone}`,
      spec.text?"is-text":"is-emoji",
      className,
    ].filter(Boolean).join(" ")}
    aria-hidden="true"
  >
    <span className="lx-mini-glyph">{spec.glyph}</span>
    {spec.badge?<span className="lx-mini-badge">{spec.badge}</span>:null}
  </span>;
}
