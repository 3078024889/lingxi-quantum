import Link from "next/link";
const cards=[
{key:'breath',title:'量子息法',en:'Quantum Breath',body:'当思绪纷乱、注意力散开时，从身体与呼吸重新开始。循着完整五步引导，体验专注、心的品质与内外连接。',benefit:'让呼吸成为回到当下的入口'},
{key:'intuition',title:'直觉丹道',en:'Intuitive Way',body:'在外界意见与内心感受之间，给自己一段安静。学习内听、容许与放手，以真实选择回应逐渐清晰的理解。',benefit:'听见内在，也用现实核对'},
{key:'heart-reset',title:'归零心诀',en:'Heart Reset',body:'当心里装满压力与纷扰，停下片刻。从回心、温暖到绿色意象与心观世界，让自己重新找到柔和而清晰的位置。',benefit:'把温暖与清晰带回心的中央'},
{key:'ascending-heart',title:'上升心经',en:'Ascending Heart',body:'将呼吸、心的觉察与生命表达连在一起。通过四式练习，在反复体验中寻找适合自己的节律，把内在理解带回日常。',benefit:'让觉察在生活中持续展开'}];
export default function PracticeCards(){return <div className="practice-index-cards">{cards.map(card=><article key={card.key}><img src={'/images/practice/v2/'+card.key+'.webp'} alt="" loading="lazy" width={768} height={512}/><div><h3>{card.title}</h3><small>{card.en}</small><p>{card.body}</p><div className="practice-card-actions"><span>免费开放</span><Link href={'/practice/'+card.key}>进入探索 →</Link></div><p className="practice-card-benefit">{card.benefit}</p></div></article>)}</div>}
