import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let failed = false;
function check(label, condition) {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}`);
  if (!condition) failed = true;
}
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
function promptBank(name, nextName) {
  const start = dendriteEngine.indexOf(`const ${name}`);
  const end = dendriteEngine.indexOf(`const ${nextName}`, start + 1);
  return dendriteEngine.slice(start, end);
}
function promptCount(source) {
  return (source.match(/\[\["[^"]+","[^"]+"\]|,\["[^"]+","[^"]+"\]/g) || []).length;
}

const project = JSON.parse(read("miniapp/project.config.json"));
const app = JSON.parse(read("miniapp/app.json"));
const env = read(".env.example");
const payCreate = read("app/api/wechat/mini/pay/create/route.ts");
const notify = read("app/api/wechat/mini/pay/notify/route.ts");
const paymentClient = read("miniapp/utils/payment.js");
const catalog = read("lib/mini/catalog.ts");
const exploreClient = read("miniapp/pages/explore/index.js");
const exploreView = read("miniapp/pages/explore/index.wxml");
const assessmentClient = read("miniapp/pages/assessment/index.js");
const assessmentView = read("miniapp/pages/assessment/index.wxml");
const dendriteSql = read("sql-history/SQL-v314-mini-dendrite-assessments.sql");
const dendriteReliabilitySql = read("sql-history/SQL-v318-mini-dendrite-reliability.sql");
const dendriteEngine = read("lib/mini/dendrite-engine.ts");
const lifeArchetype = read("lib/mini/life-archetype.ts");
const miniLifeArchetypeReport = read("app/mini-report/MiniLifeArchetypeReport.tsx");
const reportEntryLibrary = read("lib/mini/report-entry-library.ts");
const archetypeProgressView = read("miniapp/pages/archetype-progress/index.wxml");
const fieldProductCopy = read("lib/mini/field-product-copy.ts");
const catalogRoute = read("app/api/wechat/mini/catalog/route.ts");
const contentLink = read("app/api/wechat/mini/content-link/route.ts");
const contentOpen = read("app/api/wechat/mini/content-open/route.ts");
const dendriteSubmit = read("app/api/wechat/mini/dendrite/submit/route.ts");
const auditUnlockSql = read("sql-history/SQL-v316-audit-account-unlocks.sql");
const productClient = read("miniapp/pages/product/index.js");
const reportRoutes = read("miniapp/utils/report-routes.js");
const plans = read("lib/plans.ts");
const fieldInsights = read("components/FieldInsightsSection.tsx");
const virtualPay = read("miniapp/utils/payment.js");
const accountLinkStart = read("app/api/wechat/mini/account-link/start/route.ts");
const accountLinkConfirm = read("app/api/wechat/mini/account-link/confirm/route.ts");
const accountLinkPanel = read("app/account/MiniAccountLinkPanel.tsx");
const accountLinkSql = read("sql-history/SQL-v301-mini-account-link.sql");
const fieldView = read("miniapp/pages/field/index.wxml");
const fieldClient = read("miniapp/pages/field/index.js");
const fieldNavView = read("miniapp/components/field-nav/index.wxml");
const fieldStructureView = read("miniapp/components/field-structure-9d/index.wxml");
const fieldStructureClient = read("miniapp/components/field-structure-9d/index.js");
const desktopFieldStructure = read("components/FieldStructure9D.tsx");
const desktopNav = read("components/Nav.tsx");
const membershipContent = read("lib/membership-content.ts");
const profileClient = read("miniapp/pages/profile/index.js");
const profileView = read("miniapp/pages/profile/index.wxml");
const productView = read("miniapp/pages/product/index.wxml");
const contentDestinations = read("lib/mini/content-destinations.ts");
const checkout = read("app/checkout/page.tsx");
const stellarExperience = read("app/stellar-trace/StellarTraceExperience.tsx");
const miniSources = fs.readdirSync(path.join(root, "miniapp"), { recursive: true })
  .filter((file) => typeof file === "string" && /\.(js|json|wxml|wxss)$/.test(file))
  .map((file) => read(path.join("miniapp", file))).join("\n");

check("Mini Program AppID is the configured public identifier", project.appid === "wxbf4ae90406e7e26b");
check("four primary native tabs exist", app.tabBar?.list?.length === 4);
check("client contains no AppSecret or virtual-pay AppKey", !/APP_SECRET|APP_KEY|session_key|service_role/i.test(miniSources));
check("payment refreshes wx.login before signing", /wxLogin\(\)/.test(paymentClient) && /code/.test(payCreate));
check("server verifies mini identity before creating an order", /freshWxSession\.openid !== session\.openid/.test(payCreate));
check("client success never fulfills entitlement", !/fulfill|unlock|status:\s*['\"]paid/.test(paymentClient));
check("server notification is signature protected", /verifiedByWechat\(req\)/.test(notify));
check("server notification verifies amount", /actualFen !== expectedFen/.test(notify));
check(
  "server notification verifies product",
  /expectedSku !== payload\.GoodsInfo\.ProductId/.test(notify) && /miniSkuForProduct\(order\.product_id\)/.test(notify)
);
check("server notification verifies user identity", /identity\.openid !== callbackOpenid/.test(notify));
check("server notification uses atomic fulfillment", /fulfillPaidOrder\(order\.id\)/.test(notify));
check("secrets are environment-only", /WECHAT_MINI_VPAY_APP_KEY=/.test(env) && /WECHAT_MINI_SESSION_ENCRYPTION_KEY=/.test(env));
const reportWebPaths = ["/stellar-trace", "/life-map", "/relationship", "/qian", "/tarot", "/resilience", "/romance", "/daily", "/wealth", "/archetype"];
check("all ten report entries retain public web reference routes", reportWebPaths.every((route) => catalog.includes(`: \"${route}\"`) && reportRoutes.includes(`'${route}'`)));
check("Stellar Trace is the first cross-platform Field Insight at RMB 688", /id: "stellar-trace"[\s\S]*priceRmb: 688/.test(plans) && /"stellar-trace": "rpt_stellar_trace"/.test(catalog) && /field: "00"/.test(fieldProductCopy) && fieldInsights.indexOf('href:"/stellar-trace"') < fieldInsights.indexOf('href:"/life-map"'));
check("Mini Program purchases and opens Stellar Trace without a fake questionnaire submission", /productId === 'stellar-trace'/.test(exploreClient) && /item\.productId !== 'stellar-trace'/.test(productClient) && /productId === "stellar-trace"\) return "\/stellar-trace"/.test(contentDestinations));
check("Stellar Trace is a seven-day entitlement, never permanent access", /id: "stellar-trace"[\s\S]{0,260}type: "subscription", days: 7/.test(plans) && /支付成功起 7 天有效/.test(exploreView) && /item\.productId !== 'stellar-trace'/.test(productView));
check("Stellar Trace requires its eight-part intake before payment", ["寻踪对象姓名", "真实出生日期", "出生地点", "最后有效联系时间", "最后已知位置", "最后一次已知移动方向", "最后一次有效信息", "stellarCompleteness"].every((term) => `${productView}\n${productClient}`.includes(term)) && /STELLAR_TRACE_DRAFT_KEY/.test(checkout) && /确认边界并开启/.test(stellarExperience));
check("Stellar Trace discloses non-convergence before payment", /riskAcknowledged/.test(productClient) && /支付前结果边界/.test(productView) && /不保证形成唯一候选坐标/.test(productView) && /模型止于证界不等同于技术故障/.test(productView));
check("Mini-to-web Stellar Trace intake is encrypted and never placed in a URL", /stellarDraft/.test(contentLink) && /encryptMiniSecret\(JSON\.stringify\(ticket\.stellarDraft\)\)/.test(contentOpen) && !/searchParams\.set\(["']stellarDraft/.test(contentOpen));
check("report discovery opens the native dendrite assessment", /pages\/assessment\/index/.test(exploreClient) && !/pages\/web\/index/.test(exploreClient));
check("report discovery does not restore the removed preliminary archive funnel", !/初读档案|生成我的初读档案/.test(exploreView));
check("native assessment is registered without the removed preliminary archive copy", app.pages.includes("pages/assessment/index") && !/YOUR FIRST REFLECTION|初读档案|免费预览/.test(`${assessmentView}\n${assessmentClient}`));
check("dendrite engine v2 is deterministic and contains all nine products", /lingxifield-dendritic-v2/.test(dendriteEngine) && /life-archetype/.test(dendriteEngine) && /calculateDendrite/.test(dendriteEngine));
check("product-specific question banks replace the five-question template", ["lifePrompts","deepRelationshipPrompts","businessRelationshipPrompts","otherRelationshipPrompts","resiliencePrompts","romancePrompts","wealthPrompts","tidePrompts","mirrorPrompts","qianPrompts","archetypePrompts"].every((name) => dendriteEngine.includes(name)) && !/makeQuestions\(seed/.test(dendriteEngine));
const relationshipBanks = [promptBank("deepRelationshipPrompts", "businessRelationshipPrompts"), promptBank("businessRelationshipPrompts", "otherRelationshipPrompts"), promptBank("otherRelationshipPrompts", "resiliencePrompts")];
check("three relationship paths use independent 24-interaction banks", /RELATIONSHIP_DENDRITE_PRODUCTS/.test(dendriteEngine) && relationshipBanks.every((bank) => promptCount(bank) === 24) && new Set(relationshipBanks).size === 3 && /relationshipVariants/.test(assessmentClient));
check("every assessment records a named archive subject", /请填写档案称呼/.test(assessmentClient) && /你的姓名或称呼（必填）/.test(assessmentView) && /partnerName/.test(assessmentView));
check("dendritic result contains evidence and publication chapters", /chapters/.test(dendriteEngine) && /evidence:/.test(dendriteEngine) && /chapterBody/.test(dendriteEngine));
check("all ten products own distinct definitions and result outlines", (fieldProductCopy.match(/cardDefinitionZh: "/g) || []).length === 10 && (fieldProductCopy.match(/resultOutline: \[/g) || []).length === 10);
check("technical methodology appears on the Field Insight home instead of every assessment", /一次答案不会直接对应一句结论/.test(exploreView) && !/engine\.zh|product\.sourceZh/.test(assessmentView) && /product\.readingZh/.test(assessmentView));
check("legacy Copernican naming is absent from current Mini Program sources", !/哥白尼|Copernican/i.test(`${fieldProductCopy}\n${dendriteEngine}\n${exploreView}\n${assessmentView}`));
check("public Mini Program copy no longer uses the legacy linking term", !/联锁/.test(miniSources));
check("Cultivation Techniques completes the six-entry living field grid", /title: '修炼技术'/.test(fieldClient) && /web: '\/practice'/.test(fieldClient));
check("9D field structure is shared through the native field navigation", /field-structure-9d/.test(fieldNavView) && /lingxifield-9d-field-structure-v317-h264\.mp4/.test(fieldStructureView));
check("9D Mini Program film is streamed on demand with controllable sound and fullscreen", /muted="\{\{muted\}\}"/.test(fieldStructureView) && /toggleAudio/.test(fieldStructureClient) && /requestFullScreen/.test(fieldStructureClient) && /closePanel/.test(fieldStructureClient));
check("desktop 9D navigation and film are separate draggable surfaces", /FloatingFieldNavigator/.test(desktopFieldStructure) && /FloatingFieldVideo/.test(desktopFieldStructure) && /useFloatingDrag/.test(desktopFieldStructure) && !/FIELD_STRUCTURE_LINKS/.test(desktopNav));
check("Life Archetype is a versioned automatic same-subject eight-field convergence", /layer: "convergence"/.test(fieldProductCopy) && /calculateLifeArchetypeFromReports/.test(dendriteEngine) && /BASE_DENDRITE_PRODUCT_IDS/.test(dendriteEngine) && /lingxifield-life-archetype-v5/.test(`${dendriteEngine}\n${lifeArchetype}`) && /subjectId/.test(lifeArchetype));
check("Life Archetype requires eight completed streams and one relationship path", /BASE_DENDRITE_PRODUCT_IDS\.filter/.test(lifeArchetype) && /relationshipByType/.test(lifeArchetype) && /任一完成即计入一条支流/.test(lifeArchetype));
check("Life Archetype owns a dedicated 24-page dendritic publication", /total=24/.test(miniLifeArchetypeReport) && /DENDRITIC GRAPH/.test(miniLifeArchetypeReport) && /八流汇聚/.test(miniLifeArchetypeReport));
check("all ten assessments generate eleven product-specific readings from 24 evidence leaves", /PRODUCT_READING_SLOTS/.test(reportEntryLibrary) && /slots\.length!==11/.test(reportEntryLibrary) && /reportEntries/.test(dendriteEngine) && /evidenceLeaves/.test(dendriteEngine));
check("Life Archetype progress has an explicit native return control", /showBack="\{\{true\}\}"/.test(archetypeProgressView));
check("catalog and assessment configuration cannot serve stale product copy", /no-store/.test(catalogRoute) && /no-store/.test(read("app/api/wechat/mini/dendrite/config/route.ts")));
check("unlocked assessments open only after ownership and entitlement revalidation", /unlocked/.test(dendriteSubmit) && /mini_dendrite_assessments/.test(contentLink) && /submissionId/.test(contentOpen) && /hasUnlock/.test(contentOpen));
check("audit account grant is limited to one email and all nine report products", /945462373@qq\.com/.test(auditUnlockSql) && (auditUnlockSql.match(/'life-map-report'|'relationship-resonance'|'resilience-report'|'romance-report'|'wealth-report'|'daily-tide-report'|'tarot-reading'|'qian-reading'|'life-archetype'/g) || []).length >= 9);
check("assessment exposes a native page back control", /show-back="\{\{true\}\}"/.test(assessmentView));
check("native assessment supports forwarding and copying the web reference link", /onShareAppMessage/.test(assessmentClient) && /onShareTimeline/.test(assessmentClient) && /setClipboardData/.test(assessmentClient));
check("dendrite archives are owner-readable, server-writable, and included in account migration", /enable row level security/.test(dendriteSql) && /revoke insert, update, delete/.test(dendriteSql) && /auth\.uid\(\) = user_id/.test(dendriteSql) && /update public\.mini_dendrite_assessments set user_id/.test(dendriteSql));
check("V318 can repair a missing native archive table", /create table if not exists public\.mini_dendrite_assessments/.test(dendriteReliabilitySql) && /grant all on table public\.mini_dendrite_assessments to service_role/.test(dendriteReliabilitySql));
check("iPhone sandbox payment is stopped before WeChat returns a platform error", /result\.sandbox && platform === 'ios'/.test(virtualPay));
check("account linking begins only from a valid Mini Program session", /requireMiniSession\(req\)/.test(accountLinkStart));
check("account-link hand-off is encrypted, random, and short-lived", /encryptMiniSecret/.test(accountLinkStart) && /randomBytes/.test(accountLinkStart) && /10 \* 60 \* 1000/.test(accountLinkStart));
check("account linking requires the target web account to be signed in", /supabase\.auth\.getUser\(\)/.test(accountLinkConfirm));
check("account linking rechecks the live Mini identity before migration", /wechat_mini_identities/.test(accountLinkConfirm) && /identity\.user_id !== ticket\.sourceUserId/.test(accountLinkConfirm));
check("account-link UI asks for an explicit confirmation", /确认连接此账户/.test(accountLinkPanel) && /不会猜测或自动合并账户/.test(accountLinkPanel));
check("account migration does not guess identity from email or phone", !/email|phone|手机号|邮箱/i.test(`${accountLinkStart}\n${accountLinkConfirm}\n${accountLinkSql}`));
check("account migration preserves report, order, and entitlement records", /public\.unlocks/.test(accountLinkSql) && /public\.orders/.test(accountLinkSql) && /public\.wealth_submissions/.test(accountLinkSql));
check("account migration RPC is service-role-only", /revoke execute[\s\S]*from public, anon, authenticated/.test(accountLinkSql) && /grant execute[\s\S]*to service_role/.test(accountLinkSql));
check("membership cards use product-specific shared publication copy", /MEMBERSHIP_CONTENT/.test(catalog) && /item\.benefits/.test(fieldView) && /item\.cta/.test(fieldView));
check("membership landing copy uses field, archive, exploration, and connection language", ["场域", "档案", "探索", "连接", "觉察"].every((term) => `${fieldView}\n${membershipContent}`.includes(term)));
check("Mini Program membership page no longer repeats generic permanent-sales copy", !/一次能量交换，永久开启/.test(fieldView));
check(
  "historical web reports use a confirmed secure archive hand-off",
  /confirmOpenWebArchive/.test(profileClient) &&
    /无需再次购买/.test(profileClient) &&
    /isMiniWebArchiveProduct\(productId\).*return "\/account\/orders"/s.test(contentDestinations)
);
check(
  "purchase screen discloses delivery, validity, renewal, and requires policy consent",
  ["交付方式", "权益期限", "不会自动续费", "/terms", "/refunds", "/privacy", "agreed"].every((term) => `${productView}\n${productClient}`.includes(term))
);
check("purchase screen offers a WeChat customer-service route", /open-type="contact"/.test(productView));
check(
  "My Field exposes terms, refunds, privacy, declaration, about, and support",
  ["/terms", "/refunds", "/privacy", "/declaration", "/about", "open-type=\"contact\""].every((term) => profileView.includes(term)) && /openPolicy/.test(profileClient)
);

if (failed) process.exit(1);
