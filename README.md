# 灵犀 LINGXI · 第一阶段：首页 + 六道之门

这是新网站的第一阶段成果：星门首页、核心信条、六道之门（出身/关系/金钱/健康/心灵/命运）、
量子暂停练习入口、以及"活在此版本中的你"付费模块入口。技术栈：**Next.js 14 + TypeScript + Tailwind CSS**，
专为部署在 Vercel 设计。

---

## 一、本地预览（可选，需要先安装 Node.js 18+）

1. 解压本项目文件夹，进入目录：
   ```bash
   cd lingxi
   npm install
   npm run dev
   ```
2. 打开浏览器访问 `http://localhost:3000` 即可看到效果。

> 如果你不想在自己电脑上装 Node.js，可以跳过这一步，直接进入下面的"上传到 GitHub + Vercel"。

---

## 二、上传到 GitHub（你来操作）

1. 打开 [github.com](https://github.com)，登录你的账号（你之前部署 vercel.com/celestial9 用的应该是同一套 GitHub 账号）。
2. 点击右上角 `+` → `New repository`。
   - Repository name 建议填：`lingxi-quantum`（或你喜欢的名字）
   - 选择 Private（私有仓库，建议先私有）
   - 不要勾选"Add a README"（我们项目里已经有文件了）
   - 点击 `Create repository`
3. 新仓库建好后，GitHub 会给你一串命令，类似：
   ```bash
   git remote add origin https://github.com/你的用户名/lingxi-quantum.git
   git branch -M main
   git push -u origin main
   ```
   在你电脑上打开终端，进入项目文件夹后执行：
   ```bash
   cd lingxi
   git init
   git add .
   git commit -m "灵犀第一阶段：首页与六道之门"
   git remote add origin https://github.com/你的用户名/lingxi-quantum.git
   git branch -M main
   git push -u origin main
   ```
   （如果终端要你登录 GitHub，按提示用浏览器授权登录即可。）

---

## 三、连接 Vercel 并部署

由于你已经有 `vercel.com/celestial9` 这个团队空间：

1. 登录 [vercel.com](https://vercel.com)，进入你的 `celestial9` 团队。
2. 点击 `Add New...` → `Project`。
3. 在 "Import Git Repository" 里找到刚才推送的 `lingxi-quantum` 仓库，点击 `Import`。
   - 如果列表里没有，点 `Adjust GitHub App Permissions`，把这个新仓库的访问权限加给 Vercel。
4. Framework Preset 会自动识别为 **Next.js**，不需要改任何设置。
5. 点击 `Deploy`，等待 1-2 分钟。
6. 部署成功后，Vercel 会给一个 `xxx.vercel.app` 的临时网址，点开就能看到上线后的网站。

### 绑定你现有的域名（比如 wingmakers.com.cn 同主体的新域名，或者你想换成"灵犀"相关域名）

1. 进入这个项目 → `Settings` → `Domains`。
2. 输入你的域名，按提示在你域名服务商（比如阿里云/腾讯云）那边添加一条 CNAME 或 A 记录。
3. 等待 DNS 生效（通常几分钟到几小时），Vercel 会自动签发 HTTPS 证书。

---

## 四、以后怎么更新网站

以后每次我给你新的代码文件，你只需要：

```bash
cd lingxi
# 把我给的新文件覆盖到对应位置
git add .
git commit -m "更新说明，比如：新增量子呼吸练习页"
git push
```

**push 之后 Vercel 会自动重新部署，不需要任何手动操作**，1-2 分钟后线上网站就会更新。

---

## 五、项目结构说明

```
lingxi/
├── app/
│   ├── layout.tsx       全局布局、字体、网站标题
│   ├── page.tsx         首页（星门 + 六道之门 + 量子暂停入口）
│   └── globals.css      全局样式（呼吸动画、噪点纹理等）
├── components/
│   └── BreathRing.tsx   首页"量子暂停"呼吸环动效
├── lib/
│   └── gates.ts         六道之门的文案与图片数据，改文案直接改这个文件
├── public/images/       六道之门背景图（来自你提供的文档配图）
└── package.json
```

**你以后想自己改文案**，最简单的方式：打开 `lib/gates.ts`，改 `title` / `line` 字段里的文字，
保存后 push，网站文案就更新了——不需要懂代码。

---

## 六、下一阶段计划

1. 量子呼吸完整教程页（`/practice/breath`，含分步引导动画）
2. "活在此版本中的你"——每日签到 + 现实回路书写页（核心付费体验）
3. 登录系统（邮箱验证码）+ 用户宇宙星图可视化
4. 支付接入（USDT / 微信 / 支付宝）—— 这一步需要你提供真实商户/收款配置

我会按这个顺序继续给你完整代码和对应教程。
