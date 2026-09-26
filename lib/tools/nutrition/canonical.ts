const COOKING=new Set(["生","熟","煮","水煮","蒸","烤","煎","炒","炸","炖","焖","卤","凉拌","raw","cooked","boiled","steamed","fried","roasted","grilled"]);
const PORTION=/^(\d+(?:\.\d+)?)\s*(g|kg|克|千克|公斤|ml|毫升|杯|碗|勺|个|只|片)?$/i;
export function normalizeFoodQuery(input:string){return input.normalize("NFKC").trim().replace(/[，、；;]+/g," ").replace(/\s+/g," ").toLowerCase()}
export function lexicalFoodParts(input:string){const n=normalizeFoodQuery(input);const words=n.split(/\s+/).filter(Boolean);return{normalized:n,words,foodWords:words.filter(x=>!COOKING.has(x)&&!PORTION.test(x)),cooking:words.filter(x=>COOKING.has(x)),portion:words.find(x=>PORTION.test(x))||null}}
/**
 * Generates deterministic variants only. OpenCC/jieba enrichment belongs to the self-hosted Search Engine adapter.
 * This function never invents translations or nutrition values.
 */
export function queryVariants(input:string){const p=lexicalFoodParts(input),out=new Set<string>([p.normalized]);if(p.foodWords.length)out.add(p.foodWords.join(" "));for(const w of p.foodWords)if(w.length>=2)out.add(w);return [...out].filter(Boolean).slice(0,16)}
