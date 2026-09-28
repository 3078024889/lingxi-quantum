#!/usr/bin/env node
import fs from "node:fs";
const must=(cond,msg)=>{if(!cond)throw new Error(msg)};
const read=p=>fs.readFileSync(p,"utf8");

const food=read("components/tools/FoodCalorieWorkbench.tsx");
must(food.includes('data-food-version="v1600"'),"FOOD_VERSION_MARKER");
must(food.includes("foodUi(lang"),"FOOD_9LANG_NOT_WIRED");
must(food.includes("recognizeFoodImage"),"FOOD_VISION_NOT_WIRED");
must(!food.includes("confidence"),"FOOD_CONFIDENCE_COPY_SHOULD_NOT_BE_EXPOSED");

const vision=read("lib/tools/food/image-recognition-local.ts");
must(vision.includes('allowRemoteModels=false'),"FOOD_REMOTE_MODELS_MUST_STAY_OFF");
must(vision.includes("COMMON_FOOD_CANDIDATES"),"FOOD_BROAD_VOCAB_NOT_WIRED");
must(vision.includes("food101"),"FOOD101_BASELINE_MISSING");

const composer=read("components/SasiChatCreationStudio.tsx");
must(composer.includes('data-sasi-composer-version="v1600"'),"COMPOSER_VERSION_MARKER");
must(composer.includes("composerText"),"COMPOSER_9LANG_NOT_WIRED");
must(composer.includes("useLingxiLang"),"COMPOSER_LANG_HOOK_MISSING");

const proposal=read("lib/sasi/project-proposal.ts");
must(proposal.includes("SASI_PROJECT_9LANG_DB_ENABLED"),"PROJECT_9LANG_COMPAT_GATE_MISSING");
must(proposal.includes("uiLanguage"),"PROJECT_UI_LANGUAGE_NOT_PRESERVED");

const migration=read("supabase/migrations/20260928195500_sasi_project_9lang.sql");
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])must(migration.includes(`'${lang}'`),`PROJECT_DB_LANG_MISSING:${lang}`);
must(migration.includes("revoke all on function public.create_sasi_project_service"),"PROJECT_RPC_PRIVILEGE_HARDENING_MISSING");

const usda=read("scripts/nutrition/BOOTSTRAP_USDA_FDC_PRODUCTION.ps1");
must(usda.includes("fdc.nal.usda.gov"),"USDA_OFFICIAL_SOURCE_REQUIRED");



const localCatalog=read("lib/tools/food/local-catalog.ts");
must(localCatalog.includes('"dragon-fruit-tbca"'),"DRAGON_FRUIT_LOCAL_FALLBACK_MISSING");
must(localCatalog.includes("sugar_g_per_100g:number|null"),"LOCAL_FOOD_NULL_NUTRIENT_SUPPORT_MISSING");
const calcRoute=read("app/api/tools/food/calculate/route.ts");
must(calcRoute.includes('value===null||value===undefined'),"MISSING_NUTRIENT_MUST_NOT_BECOME_ZERO");

const continuity=read("components/SasiChatCreationStudio.tsx");
for(const token of ["projectRestored","transcribeLocal","/sasi/series?projectId=","fileDataUrl"])must(continuity.includes(token),`COMPOSER_CONTINUITY_MISSING:${token}`);
const contextRoute=read("app/api/sasi/projects/[id]/context/route.ts");
must(contextRoute.includes("TOTAL_CONTEXT_CHARS=24_000"),"PROJECT_CONTEXT_BUDGET_MISSING");
must(contextRoute.includes('.eq("user_id",user.id)'),"PROJECT_CONTEXT_OWNER_FILTER_MISSING");
const transcriptRoute=read("app/api/sasi/assets/[id]/transcript/route.ts");
must(transcriptRoute.includes("isSameOriginMutation"),"TRANSCRIPT_ORIGIN_GUARD_MISSING");
must(transcriptRoute.includes('.eq("user_id",user.id)'),"TRANSCRIPT_OWNER_FILTER_MISSING");
must(!/status:\s*"ready"/.test(transcriptRoute),"TRANSCRIPT_MUST_NOT_BYPASS_ASSET_SCAN_STATUS");
const seriesUi=read("components/SasiMultiEpisodeWorkspace.tsx");
must(seriesUi.includes('action:"quote-series"'),"SERIES_QUOTE_NOT_WIRED");
must(seriesUi.includes('action:"confirm"'),"SERIES_CONFIRM_NOT_WIRED");
must(seriesUi.includes('action:"refresh"'),"SERIES_REFRESH_NOT_WIRED");
const assemblerUi=read("app/sasi/VideoAssembler.tsx");
must(assemblerUi.includes("ffmpeg.load"),"VIDEO_ASSEMBLER_RUNTIME_MISSING");
must(assemblerUi.includes('data-video-assembler-version="v1600"'),"VIDEO_ASSEMBLER_VERSION_MARKER");

const functionMenuUi=read("components/SasiFunctionMenu.tsx");
must(functionMenuUi.includes("localizedFunctionOptions"),"FUNCTION_MENU_I18N_NOT_WIRED");
const functionMenuI18n=read("lib/sasi/function-menu-i18n.ts");
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])must(functionMenuI18n.includes(`${lang}:`)||functionMenuI18n.includes(`const ${lang}:`),`FUNCTION_MENU_LANG_MISSING:${lang}`);
console.log("V1600_SOURCE_AUDIT=PASS");
