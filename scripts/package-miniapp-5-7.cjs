const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const version = '5.7.3';
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
    !app.pages.includes('pages/web/index') || !app.pages.includes('pages/balance/index')) {
  throw new Error('MINI_MAIN_APP_ID_OR_ROUTES_INVALID');
}
if (fs.existsSync(path.join(stage, 'project.private.config.json')) ||
    fs.existsSync(path.join(stage, 'pages', 'portal', 'index.js')) ||
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
    for (const match of sourceText.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
      const candidate = path.resolve(path.dirname(file), match[1]);
      if (![candidate, candidate + '.js', candidate + '.json', path.join(candidate, 'index.js')].some(p => fs.existsSync(p))) {
        throw new Error('MINI_PACKAGE_DEPENDENCY_MISSING:' + path.relative(stage, candidate));
      }
    }
  }
}
const balanceRoute = fs.readFileSync(path.join(stage, 'pages', 'balance', 'index.js'), 'utf8');
if (!balanceRoute.includes('/pages/web/index?path=') || !balanceRoute.includes('encodeURIComponent(path)') || !balanceRoute.includes('"/ai-wallet"') ||
    balanceRoute.includes('requestVirtualPayment') || balanceRoute.includes('/api/wechat/mini/balance-pay/')) {
  throw new Error('MINI_BALANCE_ROUTE_MUST_REDIRECT_TO_WEBSITE_WALLET');
}
verifyDependencies(stage);
fs.writeFileSync(path.join(stage, 'VERSION.txt'),
  'LINGXIFIELD MINI PROGRAM\nVERSION=' + version + '\nSOURCE_SHA=' + sourceSha + '\nAPPID=' + projectConfig.appid + '\n');
fs.rmSync(zipFile, { force: true });
execFileSync('zip', ['-qr', '-X', zipFile, '.'], { cwd: stage, stdio: 'inherit' });
execFileSync('unzip', ['-t', zipFile], { stdio: 'inherit' });
const entries = execFileSync('unzip', ['-Z1', zipFile], { encoding: 'utf8' }).trim().split(/\r?\n/);
for (const required of ['project.config.json', 'app.json', 'pages/balance/index.js', 'pages/balance/index.wxml', 'pages/web/index.js', 'utils/api.js', 'VERSION.txt']) {
  if (!entries.includes(required)) throw new Error('MINI_ZIP_REQUIRED_FILE_MISSING:' + required);
}
if (entries.some(name => name.includes('project.private.config.json') || name.startsWith('pages/recharge/') || name.startsWith('pages/mail-home/'))) {
  throw new Error('MINI_ZIP_CONTAINS_PRIVATE_OR_SECONDARY_APP_FILES');
}
const hash = execFileSync('sha256sum', [zipFile], { encoding: 'utf8' }).trim().split(/\s+/)[0];
fs.writeFileSync(zipFile + '.sha256', hash + '  ' + path.basename(zipFile) + '\n');
fs.writeFileSync(path.join(output, 'release-notes.txt'),
  '灵犀场小程序 5.7.3\n\n' +
  '1. 删除旧版原生充值页面、充值商品选择、充值下单与虚拟充值调用。\n' +
  '2. 人民币与美元充值统一进入灵犀场官网钱包，由官网收银台处理。\n' +
  '3. 旧余额页面路径仅保留兼容跳转，不再包含原生充值逻辑。\n' +
  '4. 主小程序与独立临时邮箱小程序均不再打包旧充值页。\n' +
  '5. 保留账户登录、余额查询、资金账本、订单、退款与提现记录。\n' +
  '6. 保留已审核工具商品的独立微信虚拟支付，不与钱包充值混用。\n' +
  '7. 历史虚拟充值订单仍可由服务端回调核验并完成结算。\n' +
  '8. 新小程序版本不会调用原生钱包充值接口；服务端旧充值创建接口已移除。\n' +
  '9. 主小程序 AppID: ' + projectConfig.appid + '\n' +
  'SOURCE_SHA=' + sourceSha + '\n' +
  'SHA256=' + hash + '\n');
console.log(JSON.stringify({ version, sourceSha, appId: projectConfig.appid, zipFile, sha256: hash, entries: entries.length }, null, 2));