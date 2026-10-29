import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const REQUIRED_LANGUAGES = ['zh','en','ja','ko','fr','de','es','pt','ar'];
const VALID_KINDS = new Set(['website_visits','app_downloads','seo_visibility','geo_citation_rate','funding','subscription_price']);
const APPROVED = new Set(['verified','official_verified','third_party_verified']);
const SAFE_STATUSES = new Set(['candidate','unverified','verified','rejected','discontinued']);

export function validateMarketReview(input) {
  const errors = [];
  const warnings = [];
  const records = Array.isArray(input?.records) ? input.records : [];
  const products = Array.isArray(input?.products) ? input.products : [];
  const languages = Array.isArray(input?.languages) ? input.languages : [];
  const seen = new Set();
  for (const lang of REQUIRED_LANGUAGES) if (!languages.includes(lang)) errors.push('missing_language:' + lang);
  if (new Set(languages).size !== languages.length) errors.push('duplicate_language');
  if (typeof input?.previewUrl === 'string' && input.previewUrl.trim()) {
    try {
      const u = new URL(input.previewUrl);
      if (u.protocol !== 'https:' || u.username || u.password ||
          !(u.hostname.endsWith('.vercel.app') || u.hostname === 'lingxifield.com' || u.hostname === 'lingxifield.cn')) {
        errors.push('unsafe_preview_url');
      }
    } catch { errors.push('invalid_preview_url'); }
  } else warnings.push('preview_url_not_set');
  for (const [i,p] of products.entries()) {
    if (!p || typeof p.id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,95}$/.test(p.id)) errors.push('invalid_product_id:' + i);
    if (!SAFE_STATUSES.has(p?.status)) errors.push('invalid_product_status:' + i);
    if (typeof p?.website !== 'string') errors.push('missing_website:' + i);
    else {
      try {
        const url = new URL(p.website);
        if (url.protocol !== 'https:' || url.username || url.password) errors.push('unsafe_website:' + i);
      } catch { errors.push('invalid_website:' + i); }
    }
    if (seen.has(p?.id)) errors.push('duplicate_product:' + p.id);
    seen.add(p?.id);
  }
  let publishable = 0;
  for (const [i,r] of records.entries()) {
    if (!r || !seen.has(r.productId)) errors.push('unknown_product:' + i);
    if (!VALID_KINDS.has(r?.metric)) errors.push('invalid_metric:' + i);
    if (typeof r?.value !== 'number' || !Number.isFinite(r.value) || r.value < 0) errors.push('invalid_value:' + i);
    if (typeof r?.sourceUrl !== 'string') errors.push('missing_source:' + i);
    else {
      try { const url = new URL(r.sourceUrl); if(url.protocol !== 'https:') errors.push('unsafe_source:' + i); }
      catch { errors.push('invalid_source:' + i); }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r?.observedAt || '') || Number.isNaN(Date.parse(r.observedAt + 'T00:00:00Z'))) errors.push('invalid_observed_at:' + i);
    if (!r?.region || !r?.period || !r?.unit || !r?.method) errors.push('incomplete_comparison_scope:' + i);
    if (!APPROVED.has(r?.status)) warnings.push('not_publishable:' + i);
    else publishable++;
  }
  if (records.length === 0) warnings.push('no_verified_market_evidence');
  return { ok:errors.length===0, publishable:errors.length===0 ? publishable : 0, products:products.length,
    records:records.length, errors, warnings, reviewedAt:input?.reviewedAt || null,
    indexable:errors.length===0 && publishable>0 && input?.reviewApproved===true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) { console.error('Usage: node scripts/ai-market/audit-review-gate.mjs review-snapshot.json'); process.exit(2); }
  let input;
  try { input=JSON.parse(readFileSync(path,'utf8')); }
  catch (err) { console.error('Unable to read snapshot:', err.message); process.exit(2); }
  const report=validateMarketReview(input);
  console.log(JSON.stringify(report,null,2));
  if (!report.ok) process.exitCode=1;
}
