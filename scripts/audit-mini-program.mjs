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
const dendriteEngine = read("lib/mini/dendrite-engine.ts");
const fieldProductCopy = read("lib/mini/field-product-copy.ts");
const catalogRoute = read("app/api/wechat/mini/catalog/route.ts");
const contentLink = read("app/api/wechat/mini/content-link/route.ts");
const contentOpen = read("app/api/wechat/mini/content-open/route.ts");
const dendriteSubmit = read("app/api/wechat/mini/dendrite/submit/route.ts");
const auditUnlockSql = read("sql-history/SQL-v316-audit-account-unlocks.sql");
const productClient = read("miniapp/pages/product/index.js");
const reportRoutes = read("miniapp/utils/report-routes.js");
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
const membershipContent = read("lib/membership-content.ts");
const profileClient = read("miniapp/pages/profile/index.js");
const profileView = read("miniapp/pages/profile/index.wxml");
const productView = read("miniapp/pages/product/index.wxml");
const contentDestinations = read("lib/mini/content-destinations.ts");
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
const reportWebPaths = ["/life-map", "/relationship", "/qian", "/tarot", "/resilience", "/romance", "/daily", "/wealth", "/archetype"];
check("all nine report entries retain public web reference routes", reportWebPaths.every((route) => catalog.includes(`: \"${route}\"`) && reportRoutes.includes(`'${route}'`)));
check("report discovery opens the native dendrite assessment", /pages\/assessment\/index/.test(exploreClient) && !/pages\/web\/index/.test(exploreClient));
check("report discovery does not restore the removed preliminary archive funnel", !/初读档案|生成我的初读档案/.test(exploreView));
check("native assessment is registered without the removed preliminary archive copy", app.pages.includes("pages/assessment/index") && !/YOUR FIRST REFLECTION|初读档案|免费预览/.test(`${assessmentView}\n${assessmentClient}`));
check("dendrite engine v2 is deterministic and contains all nine products", /lingxifield-dendritic-v2/.test(dendriteEngine) && /life-archetype/.test(dendriteEngine) && /calculateDendrite/.test(dendriteEngine));
check("product-specific question banks replace the five-question template", ["lifePrompts","relationshipPrompts","resiliencePrompts","romancePrompts","wealthPrompts","tidePrompts","mirrorPrompts","qianPrompts","archetypePrompts"].every((name) => dendriteEngine.includes(name)) && !/makeQuestions\(seed/.test(dendriteEngine));
check("dendritic result contains evidence and publication chapters", /chapters/.test(dendriteEngine) && /evidence:/.test(dendriteEngine) && /chapterBody/.test(dendriteEngine));
check("all nine products own distinct definitions and result outlines", (fieldProductCopy.match(/cardDefinitionZh: "/g) || []).length === 9 && (fieldProductCopy.match(/resultOutline: \[/g) || []).length === 9);
check("technical methodology appears on the Field Insight home instead of every assessment", /一次答案不会直接对应一句结论/.test(exploreView) && !/engine\.zh|product\.sourceZh/.test(assessmentView) && /product\.readingZh/.test(assessmentView));
check("legacy Copernican naming is absent from current Mini Program sources", !/哥白尼|Copernican/i.test(`${fieldProductCopy}\n${dendriteEngine}\n${exploreView}\n${assessmentView}`));
check("public Mini Program copy no longer uses the legacy linking term", !/联锁/.test(miniSources));
check("Cultivation Techniques completes the six-entry living field grid", /title: '修炼技术'/.test(fieldClient) && /web: '\/practice'/.test(fieldClient));
check("9D field structure is shared through the native field navigation", /field-structure-9d/.test(fieldNavView) && /lingxifield-9d-field-structure-v317-h264\.mp4/.test(fieldStructureView));
check("9D Mini Program film is streamed on demand with mute, loop and fullscreen", /muted autoplay loop/.test(fieldStructureView) && /requestFullScreen/.test(fieldStructureClient) && /closePanel/.test(fieldStructureClient));
check("Life Archetype is an automatic eight-field convergence, not an oracle-card product", /layer: "convergence"/.test(fieldProductCopy) && /calculateLifeArchetypeFromReports/.test(dendriteEngine) && /BASE_DENDRITE_PRODUCT_IDS/.test(dendriteEngine) && !/主原型|隐藏原型|行动原型/.test(`${fieldProductCopy}\n${dendriteEngine}`));
check("catalog and assessment configuration cannot serve stale product copy", /no-store/.test(catalogRoute) && /no-store/.test(read("app/api/wechat/mini/dendrite/config/route.ts")));
check("unlocked assessments open only after ownership and entitlement revalidation", /unlocked/.test(dendriteSubmit) && /mini_dendrite_assessments/.test(contentLink) && /submissionId/.test(contentOpen) && /hasUnlock/.test(contentOpen));
check("audit account grant is limited to one email and all nine report products", /945462373@qq\.com/.test(auditUnlockSql) && (auditUnlockSql.match(/'life-map-report'|'relationship-resonance'|'resilience-report'|'romance-report'|'wealth-report'|'daily-tide-report'|'tarot-reading'|'qian-reading'|'life-archetype'/g) || []).length >= 9);
check("assessment exposes a native page back control", /show-back="\{\{true\}\}"/.test(assessmentView));
check("native assessment supports forwarding and copying the web reference link", /onShareAppMessage/.test(assessmentClient) && /onShareTimeline/.test(assessmentClient) && /setClipboardData/.test(assessmentClient));
check("dendrite archives are owner-readable, server-writable, and included in account migration", /enable row level security/.test(dendriteSql) && /revoke insert, update, delete/.test(dendriteSql) && /auth\.uid\(\) = user_id/.test(dendriteSql) && /update public\.mini_dendrite_assessments set user_id/.test(dendriteSql));
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
