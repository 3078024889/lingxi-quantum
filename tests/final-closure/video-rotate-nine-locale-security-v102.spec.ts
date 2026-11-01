import {test,expect} from "playwright/test";

const cases=[
 {lang:"zh",angle:"旋转角度",clockwise:"顺时针 90°",resolution:"输出分辨率",fps:"输出帧率"},
 {lang:"en",angle:"Rotation angle",clockwise:"90° clockwise",resolution:"Output resolution",fps:"Output FPS"},
 {lang:"ja",angle:"回転角度",clockwise:"右に90°回転",resolution:"出力解像度",fps:"出力FPS"},
 {lang:"ko",angle:"회전 각도",clockwise:"시계 방향 90°",resolution:"출력 해상도",fps:"출력 FPS"},
 {lang:"fr",angle:"Angle de rotation",clockwise:"90° dans le sens horaire",resolution:"Résolution de sortie",fps:"Images/s"},
 {lang:"de",angle:"Drehwinkel",clockwise:"90° im Uhrzeigersinn",resolution:"Ausgabeauflösung",fps:"Ausgabe-FPS"},
 {lang:"es",angle:"Ángulo de giro",clockwise:"90° en sentido horario",resolution:"Resolución de salida",fps:"FPS de salida"},
 {lang:"pt",angle:"Ângulo de rotação",clockwise:"90° no sentido horário",resolution:"Resolução de saída",fps:"FPS de saída"},
 {lang:"ar",angle:"زاوية التدوير",clockwise:"90° مع عقارب الساعة",resolution:"دقة الإخراج",fps:"معدل الإطارات"},
] as const;

for(const row of cases){
 test(`standalone rotate exposes all controls in ${row.lang}`,async({page})=>{
   await page.goto(`/tools/rotate-video?lang=${row.lang}`,{waitUntil:"domcontentloaded"});
   const tool=page.locator("[data-video-toolkit]");
   await expect(tool).toBeVisible();
   await expect(tool).toHaveAttribute("data-hydrated","true");
   for(const token of [row.angle,row.clockwise,row.resolution,row.fps]){
     await expect(tool).toContainText(token);
   }
   await expect(page.locator("html")).toHaveAttribute("lang",row.lang==="zh"?"zh-CN":row.lang);
   await expect(page.locator("html")).toHaveAttribute("dir",row.lang==="ar"?"rtl":"ltr");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   expect(overflow).toBeLessThanOrEqual(1);
 });
}

test("media security response headers enforce baseline CSP",async({request})=>{
 const r=await request.get("/tools/rotate-video");
 expect(r.status()).toBe(200);
 const headers=r.headers();
 const enforced=headers["content-security-policy"]||"";
 expect(enforced).toContain("base-uri 'self'");
 expect(enforced).toContain("object-src 'none'");
 expect(enforced).toContain("script-src-attr 'none'");
 expect(headers["content-security-policy-report-only"]||"").toContain("script-src ");
});
