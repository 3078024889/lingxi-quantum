const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const version = '5.7.6';
const receiptFile = path.join(root, '_local/handoff/mini-build-v80/main-latest.json');
if (!fs.existsSync(receiptFile)) throw new Error('MAIN_MINI_BUILD_RECEIPT_MISSING');
const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (receipt.target !== 'main' || receipt.sourceSha !== sourceSha || receipt.sourceDirty) {
  throw new Error('MINI_BUILD_RECEIPT_SOURCE_MISMATCH');
}
const allowedRoot = path.resolve(root, '_local/handoff/mini-build-v80') + path.sep;
const source = path.resolve(root, receipt.projectPath);
if (!source.startsWith(allowedRoot) || !fs.existsSync(path.join(source, 'app.json'))) {
  throw new Error('MINI_BUILD_PATH_OUTSIDE_HANDOFF');
}
const output = path.join(root, 'dist', 'miniapp-' + version);
const stage = path.join(output, 'project');
const zipFile = path.join(root, 'dist', 'lingxifield-miniapp-' + version + '.zip');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.mkdirSync(path.dirname(zipFile), { recursive: true });

function includeFile(file) {
  const name = path.basename(file);
  const rel = path.relative(source, file).replaceAll(path.sep, '/');
  if (name.startsWith('project.private.config.json') || name === '.DS_Store' || name === 'Thumbs.db') return false;
  if (rel.split('/').some(part => ['node_modules', '.git', '.next', 'dist', '_local'].includes(part))) return false;
  if (/^\.env(?:\.|$)/i.test(name) || /\.(?:pem|key|p12|pfx|keystore)$/i.test(name)) return false;
  return true;
}
fs.cpSync(source, stage, { recursive: true, filter: includeFile });

const projectConfigPath = path.join(stage, 'project.config.json');
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
projectConfig.appid = 'wxbf4ae90406e7e26b';
projectConfig.projectname = 'lingxi-field-' + version;
projectConfig.description = 'Lingxi Field native WeChat Mini Program ' + version;
fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2) + '\n');

const app = JSON.parse(fs.readFileSync(path.join(stage, 'app.json'), 'utf8'));
if (projectConfig.appid !== 'wxbf4ae90406e7e26b' || app.pages?.[0] !== 'pages/web/index' ||
    app.entryPagePath !== undefined || app.pages.includes('pages/portal/index') ||
    !app.pages.includes('pages/web/index') || !app.pages.includes('pages/cny-wallet/index') || app.pages.includes('pages/balance/index') || app.pages.includes('pages/recharge/index')) {
  throw new Error('MINI_MAIN_APP_ID_OR_ROUTES_INVALID');
}
if (fs.existsSync(path.join(stage, 'project.private.config.json')) ||
    fs.existsSync(path.join(stage, 'pages', 'portal', 'index.js')) ||
    fs.existsSync(path.join(stage, 'pages', 'balance')) ||
    fs.existsSync(path.join(stage, 'pages', 'recharge')) ||
    fs.existsSync(path.join(stage, 'utils', 'topup-expiry.js')) ||
    fs.existsSync(path.join(stage, 'utils', 'virtual-payment-errors.js')) ||
    fs.existsSync(path.join(stage, 'pages', 'mail-home', 'index.js'))) {
  throw new Error('SECONDARY_OR_PRIVATE_PROJECT_FILE_LEAKED');
}

function verifyDependencies(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) { verifyDependencies(file); continue; }
    if (!item.name.endsWith('.js')) continue;
    const sourceText = fs.readFileSync(file, 'utf8');
    for (const retired of ['pages/balance/', 'pages/recharge/', 'openMiniRecharge']) {
      if (sourceText.includes(retired)) throw new Error('MINI_PACKAGE_LEGACY_WALLET_REFERENCE:' + retired + ':' + path.relative(stage, file));
    }
    for (const match of sourceText.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
      const candidate = path.resolve(path.dirname(file), match[1]);
      if (![candidate, candidate + '.js', candidate + '.json', path.join(candidate, 'index.js')].some(p => fs.existsSync(p))) {
        throw new Error('MINI_PACKAGE_DEPENDENCY_MISSING:' + path.relative(stage, candidate));
      }
    }
  }
}
const forbiddenWalletFiles = ['pages/balance/index.js','pages/recharge/index.js','utils/topup-expiry.js','utils/virtual-payment-errors.js'];
verifyDependencies(stage);
fs.writeFileSync(path.join(stage, 'VERSION.txt'),
  'LINGXIFIELD MINI PROGRAM\nVERSION=' + version + '\nSOURCE_SHA=' + sourceSha + '\nAPPID=' + projectConfig.appid + '\n');
fs.rmSync(zipFile, { force: true });
execFileSync('zip', ['-qr', '-X', zipFile, '.'], { cwd: stage, stdio: 'inherit' });
execFileSync('unzip', ['-t', zipFile], { stdio: 'inherit' });
const entries = execFileSync('unzip', ['-Z1', zipFile], { encoding: 'utf8' }).trim().split(/\r?\n/);
for (const required of ['project.config.json', 'app.json', 'pages/web/index.js', 'pages/pay/index.js', 'pages/cny-wallet/index.js', 'utils/api.js', 'VERSION.txt']) {
  if (!entries.includes(required)) throw new Error('MINI_ZIP_REQUIRED_FILE_MISSING:' + required);
}
if (entries.some(name => name.includes('project.private.config.json') || name.startsWith('pages/recharge/') || name.startsWith('pages/balance/') || name.startsWith('pages/mail-home/') || forbiddenWalletFiles.includes(name))) {
  throw new Error('MINI_ZIP_CONTAINS_PRIVATE_OR_SECONDARY_APP_FILES');
}
const hash = execFileSync('sha256sum', [zipFile], { encoding: 'utf8' }).trim().split(/\s+/)[0];
fs.writeFileSync(zipFile + '.sha256', hash + '  ' + path.basename(zipFile) + '\n');
fs.writeFileSync(path.join(output, 'release-notes.txt'),
  '灵犀场小程序 5.7.6\n\n' +
  '1. 人民币 CNY 在小程序内使用微信原生虚拟支付，独立进入全新人民币余额页面。\n' +
  '2. 美元 USD 继续跳转官网新版钱包，使用 PayPal 充值，不进入旧版小程序页面。\n' +
  '3. 旧 balance/recharge 页面、旧缓存工具及旧跳转入口不进入发布包。\n' +
  '4. 充值订单由服务端核验；未确认或未关闭的订单阻止创建第二笔订单。\n' +
  '5. 保留工具商品独立虚拟支付、历史订单验签、查单、退款及幂等入账。\n' +
  '6. 用户名编辑在手机端采用上下布局，全宽保存按钮。\n' +
  '7. 小程序 AppID: ' + projectConfig.appid + '\n' +
  'SOURCE_SHA=' + sourceSha + '\n' +
  'SHA256=' + hash + '\n');
console.log(JSON.stringify({ version, sourceSha, appId: projectConfig.appid, zipFile, sha256: hash, entries: entries.length }, null, 2));