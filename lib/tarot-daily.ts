import { TAROT_MAJOR_ARCANA, type TarotCard } from "./tarot-data";

// 今天所有人看到的是同一张牌——不是每人随机抽一张。这是特意的设计：
// "今天全世界都在看同一张塔罗牌"这件事本身，比"每人各抽各的"更容易
// 被分享和讨论（Co-Star的每日推送能火，靠的就是"同一天，大家能对上
// 暗号"这种社交效应），也更符合"今日一卡"这个传统占卜习惯本身的
// 含义——今天的整体能量是什么，不是"你今天抽到了什么"。
//
// 用日期字符串做一个简单确定性哈希，同一天永远算出同一个索引，第二天
// 日期变了，索引自然也变，不需要存数据库、不需要定时任务。
function hashDateToIndex(dateStr: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export function getTodaysCard(now: Date = new Date()): TarotCard {
  const dateStr = now.toISOString().slice(0, 10);
  const idx = hashDateToIndex(dateStr, TAROT_MAJOR_ARCANA.length);
  return TAROT_MAJOR_ARCANA[idx];
}
