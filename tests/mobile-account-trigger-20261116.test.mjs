import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const nav = read("components/Nav.tsx");
const payment = read("lib/mini/payment-client.ts");
const profile = read("components/AccountProfileCard.tsx");
const css = read("app/unified-shell.css");

test("all mobile and desktop recharge entries invoke the correct Mini Program wallet route", () => {
  assert.equal((nav.match(/onClick=\{rechargeClick\}/g) || []).length, 3, "homepage, desktop and mobile recharge links must share the handler");
  assert.match(nav, /const inMiniProgram = miniRecharge \|\| isMiniProgramContext\(\)/);
  assert.match(nav, /openMiniWallet\(currency\)/);
  assert.match(nav, /usePreferredCurrency\(\)/);
  const start = nav.indexOf('<div className="lx11-mobile-actions">');
  const end = nav.indexOf("</div>", start);
  assert.ok(start >= 0 && end > start, "standard mobile header actions must exist");
  const mobile = nav.slice(start, end);
  assert.match(mobile, /<Link href="\/ai-wallet" onClick=\{rechargeClick\}>/);
  assert.match(mobile, /className="lx11-mobile-account"/);
  assert.match(mobile, /<LingxiMiniIcon name="account" size="nav"\/>/);
  assert.doesNotMatch(mobile, /avatarUrl/);
  assert.match(payment, /\/pages\/cny-wallet\/index/);
  assert.match(payment, /\/pages\/web\/index\?path=/);
  assert.match(payment, /\/ai-wallet\?currency=USD/);
  assert.doesNotMatch(payment, /\/pages\/balance\/index/);
  assert.doesNotMatch(nav, /openMiniRecharge/);
});

test("mobile account-name editor is stacked and cannot clip the Save button", () => {
  assert.match(profile, /className="lx-account-name-input"/);
  assert.match(profile, /className="lx-account-save-button"/);
  assert.match(profile, /disabled=\{busy \|\| name\.trim\(\) === saved\}/);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*?flex-direction:column!important/);
  assert.match(css, /\.lx-account-name-edit \.lx-account-save-button[\s\S]*?width:100%!important/);
  assert.match(css, /-webkit-appearance:none/);
});
