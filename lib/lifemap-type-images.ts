// 生命图谱20种核心人格类型 → 卡牌图片文件名（拼音slug）的映射。
// 20种类型来自 lib/lifemap-calc.ts 里的 TYPE_MATRIX（西方四元素 ×
// 中式五行日主，4×5=20种组合），图片放在 public/images/lifemap-types/
// 下面，文件名用拼音，跟这份映射表一一对应。
export const LIFEMAP_TYPE_IMAGE: Record<string, string> = {
  "破土者": "potuzhe", "The Breaker of Ground": "potuzhe",
  "引燃者": "yinranzhe", "The Kindler": "yinranzhe",
  "锻造者": "duanzaozhe", "The Forger": "duanzaozhe",
  "淬炼者": "cuilianzhe", "The Tempered": "cuilianzhe",
  "蒸腾者": "zhengtengzhe", "The Rising Vapor": "zhengtengzhe",
  "培育者": "peiyuzhe", "The Cultivator": "peiyuzhe",
  "窑变者": "yaobianzhe", "The Kiln-Fired": "yaobianzhe",
  "奠基者": "dianjizhe", "The Foundation-Layer": "dianjizhe",
  "琢磨者": "zhuomozhe", "The Polisher": "zhuomozhe",
  "润土者": "runtuzhe", "The Moistened Earth": "runtuzhe",
  "抽枝者": "chouzhizhe", "The Branching": "chouzhizhe",
  "煽风者": "shanfengzhe", "The Bellows": "shanfengzhe",
  "拓印者": "tuoyinzhe", "The Rubbing-Maker": "tuoyinzhe",
  "析辨者": "xibianzhe", "The Discerner": "xibianzhe",
  "映照者": "yingzhaozhe", "The Reflector": "yingzhaozhe",
  "涌流者": "yongliuzhe", "The Welling Stream": "yongliuzhe",
  "潜火者": "qianhuozhe", "The Banked Ember": "qianhuozhe",
  "凝露者": "ninglouzhe", "The Condensed Dew": "ninglouzhe",
  "映刃者": "yingrenzhe", "The Mirrored Blade": "yingrenzhe",
  "深潜者": "shenqianzhe", "The Deep Diver": "shenqianzhe",
};

// 用中文名（不管当前界面是中文还是英文，数据库/计算引擎里存的核心类型
// 名字固定是中文）查图片路径，查不到就返回 null，调用方自己决定"没有
// 图就不显示"，不强行拼一个可能404的路径。
export function lifemapTypeImage(nameZh: string): string | null {
  const slug = LIFEMAP_TYPE_IMAGE[nameZh];
  return slug ? `/images/lifemap-types/${slug}.jpg` : null;
}
