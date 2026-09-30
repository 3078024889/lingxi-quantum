import{test,expect}from"playwright/test";
const cases=[
 ["油条","CN","youtiao"],["油炸鬼","HK","youtiao"],["youtiao","SG","youtiao"],
 ["水果沙拉","SG","fruit-salad"],["水果拼盘","CN","fruit-platter"],["肠粉","HK","cheung-fun"],
 ["粽子","CN","zongzi"],["麻辣烫","CN","malatang"],["海南鸡饭","SG","hainanese-chicken-rice"],
 ["叻沙","MY","laksa"],["寿司","JP","sushi"],["拉面","JP","ramen"],["韩式拌饭","KR","bibimbap"],["tacos","MX","tacos"]
] as const;
for(const[q,country,key]of cases)test(`food identity ${q}`,async({request})=>{
 const r=await request.get(`/api/tools/food/search?q=${encodeURIComponent(q)}&country=${country}`);expect(r.status()).toBe(200);
 const j=await r.json();expect(j.query).toBe(q);expect(j.canonical_key).toBe(key);expect(Array.isArray(j.search_terms)).toBeTruthy();
 expect((j.items?.length||0)>0||j.unresolved?.reason==="NO_CLEARED_SOURCE").toBeTruthy();
});
test("food search survives missing admin database capability",async({request})=>{
 const r=await request.get(`/api/tools/food/search?q=${encodeURIComponent("油条")}&country=CN`);expect(r.status()).toBe(200);
 const j=await r.json();expect(j.canonical_key).toBe("youtiao");expect(typeof j.database_available).toBe("boolean");
});
test("fruit salad recognition-to-search continuity",async({request})=>{
 const r=await request.get(`/api/tools/food/search?q=${encodeURIComponent("fruit salad")}&country=SG`);expect(r.status()).toBe(200);
 const j=await r.json();expect(j.canonical_key).toBe("fruit-salad");
});
