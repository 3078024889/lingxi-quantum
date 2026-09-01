export type AncientSourceRule = {
  id: string;
  system: "qimen" | "liuren" | "taiyi" | "liuyao";
  target: "person" | "object" | "animal" | "setup" | "capture";
  sourceTitle: string;
  sourceChapter: string;
  sourceUrl: string;
  ruleZh: string;
  implementation: string;
  confidence: "text-attested" | "cross-text-attested" | "needs-edition-check";
};

export const ANCIENT_SOURCE_RULES: AncientSourceRule[] = [
  { id:"QM-SETUP-001", system:"qimen", target:"setup", sourceTitle:"奇门遁甲元灵经", sourceChapter:"卷一·奇门起例", sourceUrl:"https://ctext.org/wiki.pl?chapter=118579&if=gb", ruleZh:"先分阴阳、详节气、察符头，按阴阳顺逆布六仪三奇得地盘，再定值符、值使得天盘。", implementation:"dun -> solarTerm -> yuan -> ju -> earthPlate -> xunHead -> chiefStar/chiefDoor -> heavenPlate", confidence:"cross-text-attested" },
  { id:"QM-PERSON-001", system:"qimen", target:"person", sourceTitle:"奇门遁甲元灵经", sourceChapter:"卷十五·占行人", sourceUrl:"https://ctext.org/wiki.pl?chapter=404789&if=gb", ruleZh:"以行人年命合局中干支为行人，以支宫为宅舍，并取宫位、旺相、蓬芮、伏吟返吟等断方向、迟速、来否与远近。", implementation:"locate target year-life stem/branch on canonical chart; palace -> direction", confidence:"text-attested" },
  { id:"QM-RUNAWAY-001", system:"qimen", target:"person", sourceTitle:"奇门遁甲元灵经", sourceChapter:"卷十八·占走失", sourceUrl:"https://ctext.org/wiki.pl?chapter=807664&if=gb", ruleZh:"以时干为失主、六合为走失之物；六合落宫为方向，六合与时干内外宫分远近；九地太阴潜藏、九天远走、玄武盗去等。", implementation:"shiGan palace + LiuHe palace + deity/star/door", confidence:"cross-text-attested" },
  { id:"QM-OBJECT-001", system:"qimen", target:"object", sourceTitle:"奇门遁甲元灵经", sourceChapter:"卷十八·占失物", sourceUrl:"https://ctext.org/wiki.pl?chapter=807664&if=gb", ruleZh:"失物以甲子戊为财物；甲子戊落宫定方位与内外远近，玄武辨盗失，空亡影响可得性。", implementation:"JiaZi-Wu palace + Xuanwu + kongwang", confidence:"cross-text-attested" },
  { id:"QM-OBJECT-002", system:"qimen", target:"object", sourceTitle:"奇门旨归", sourceChapter:"卷十·占失物", sourceUrl:"https://ctext.org/wiki.pl?chapter=8134698&if=gb", ruleZh:"日干为失主、时干为失物；八卦宫类象区分物类。", implementation:"secondary object model; keep model id visible", confidence:"text-attested" },
  { id:"QM-ANIMAL-001", system:"qimen", target:"animal", sourceTitle:"奇门旨归 / 奇门遁甲秘笈大全", sourceChapter:"占走失六畜", sourceUrl:"https://www.shidianguji.com/zh/book/SDZJ0630/chapter/1lx9g23oqtyya", ruleZh:"骡驴以伤门天冲，牛羊以死门，马以乾兑宫所得之星；落天盘何宫即往其方，天蓬近水，玄武可主盗去。", implementation:"species-specific significator -> palace direction", confidence:"cross-text-attested" },

  { id:"LR-SETUP-001", system:"liuren", target:"setup", sourceTitle:"六壬指南", sourceChapter:"卷一·心印赋", sourceUrl:"https://ctext.org/wiki.pl?chapter=362973&if=gb", ruleZh:"以日辰为根本，月将加占时顺布十二宫成天盘；十干寄宫起四课。", implementation:"dayGZ + monthGeneral + hourBranch -> heavenPlate -> fourLessons", confidence:"cross-text-attested" },
  { id:"LR-SETUP-002", system:"liuren", target:"setup", sourceTitle:"六壬大全", sourceChapter:"卷一·九宗门", sourceUrl:"https://ctext.org/wiki.pl?chapter=64230&if=gb", ruleZh:"三传依贼克、比用、涉害、遥克、昴星、别责、八专、伏吟、返吟九法。", implementation:"selectThreeTransmissions() in canonical priority order", confidence:"cross-text-attested" },
  { id:"LR-SETUP-003", system:"liuren", target:"setup", sourceTitle:"六壬粹言 / 六壬指南", sourceChapter:"十二天将旦暮治", sourceUrl:"https://ctext.org/wiki.pl?chapter=925166&if=gb", ruleZh:"贵人依日干、昼夜取用，并依贵人所临宫定十二天将顺逆。", implementation:"placeTwelveGenerals(dayStem,hourBranch,nobleBranch)", confidence:"cross-text-attested" },
  { id:"LR-PERSON-001", system:"liuren", target:"person", sourceTitle:"六壬大全", sourceChapter:"卷八·逃亡/盗贼", sourceUrl:"https://ctext.org/wiki.pl?chapter=510298&if=en&remap=gb", ruleZh:"玄武所乘及阴神可推逃亡方位，三传用于可获与去处旁证。", implementation:"Xuanwu branch + yin-spirit + transmissions", confidence:"text-attested" },
  { id:"LR-OBJECT-001", system:"liuren", target:"object", sourceTitle:"六壬指南", sourceChapter:"卷一·亡财", sourceUrl:"https://ctext.org/wiki.pl?chapter=362973&if=en&remap=gb", ruleZh:"亡财察玄武；以玄武之阴神上见知方所。", implementation:"lost object direction = xuanwu yin-spirit location", confidence:"cross-text-attested" },
  { id:"LR-OBJECT-002", system:"liuren", target:"object", sourceTitle:"六壬大全", sourceChapter:"卷二·玄武", sourceUrl:"https://ctext.org/wiki.pl?chapter=732070&if=en&remap=gb", ruleZh:"盗贼责玄武三传；玄武之阴为盗神，盗神所生为藏物潜居之处。", implementation:"derive environment image; never literalize to exact address", confidence:"cross-text-attested" },

  { id:"TY-SETUP-001", system:"taiyi", target:"setup", sourceTitle:"太乙金镜式经", sourceChapter:"卷一", sourceUrl:"https://zh.wikisource.org/zh-hans/%E5%A4%AA%E4%B9%99%E9%87%91%E9%8F%A1%E5%BC%8F%E7%B6%93_%28%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC%29/%E5%8D%B701", ruleZh:"列出上元积年、太乙所在、天目、计神、岁月日时四计、冬夏二至、阴阳二遁时计等。", implementation:"manual transcription + fixture verification required before production", confidence:"needs-edition-check" },
  { id:"TY-PERSON-001", system:"taiyi", target:"person", sourceTitle:"太乙统宗宝鉴", sourceChapter:"卷十九·占望行人/讨捕叛亡", sourceUrl:"https://www.shidianguji.com/book/CADAL02055529/chapter/1l5erlc3bvh9y", ruleZh:"叛亡隐而不动责地目，追捕之动责天目；据太乙、天目内外、掩迫等判断。", implementation:"only after canonical time-chart verified", confidence:"cross-text-attested" },
  { id:"TY-OBJECT-001", system:"taiyi", target:"object", sourceTitle:"太乙统宗宝鉴", sourceChapter:"卷十九·求索有无所得", sourceUrl:"https://www.shidianguji.com/book/CADAL02055529/chapter/1l5erlc3bvh9y", ruleZh:"天目在内/外、主客关系用于判断求索有无所得。", implementation:"obtainability/inner-outer only unless explicit direction rule is verified", confidence:"text-attested" },

  { id:"LY-PERSON-001", system:"liuyao", target:"person", sourceTitle:"易隐", sourceChapter:"卷七·行人占", sourceUrl:"https://ctext.org/wiki.pl?chapter=657033&if=gb", ruleZh:"动爻所在取转去之地；支神五行数水一火二木三金四土五，旺相加倍、休如数、囚死减半。", implementation:"real cast only; emit ancient distance score, no km", confidence:"text-attested" },
  { id:"LY-OBJECT-001", system:"liuyao", target:"object", sourceTitle:"易隐", sourceChapter:"卷八·遗失/盗贼占", sourceUrl:"https://ctext.org/wiki.pl?chapter=281819&if=en", ruleZh:"从鬼临卦、财鬼墓处、内外动等取去向、藏物与远近。", implementation:"requires full NaJia hexagram + six relatives + moving lines + six spirits", confidence:"text-attested" },
  { id:"LY-ANIMAL-001", system:"liuyao", target:"animal", sourceTitle:"易隐", sourceChapter:"卷四·六畜占", sourceUrl:"https://ctext.org/wiki.pl?chapter=588014&if=en", ruleZh:"牛丑、马午、猪亥、羊未、狗戌、猫寅、鸡酉；走失看生肖爻与子孙爻，空绝难寻、胎墓关拦、生气尚活，并从用爻生旺方隅寻。", implementation:"species branch + actual cast + seasonal state", confidence:"cross-text-attested" },
];
