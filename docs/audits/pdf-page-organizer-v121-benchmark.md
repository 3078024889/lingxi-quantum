# LINGXIFIELD V121｜全球 PDF 页面编排产品对标与独立实现

日期：2026-11-02

## 官方能力对比

| 平台 | 已核对的官方来源 | 操作优势 | 灵犀场本轮实现 |
| --- | --- | --- | --- |
| PDF Arranger | https://github.com/pdfarranger/pdfarranger/wiki/User-Manual | 页面缩略图、拖动排序、旋转、删除、复制、恢复操作 | 缩略图、鼠标拖拽、移动按钮、旋转、复制、删除、撤销/重做 |
| Stirling PDF | https://docs.stirlingpdf.com/Functionality/Multi-Tool/ | 页面编辑器单屏完成页重组与保存；移动、删除及撤销 | 复用现有合并/拆分入口，免用户另走新网站 |
| pdf-lib | https://pdf-lib.js.org/docs/api/classes/pdfpage | 原生 PDF 页对象复制、设置 90° 旋转角度 | 使用 PDFDocument.copyPages、getRotation、setRotation 导出，保存可提取文字而不是截图 PDF |

PDF Arranger 上游为 GPL-3.0，不能直接复制代码后当作无授权限制的私有模块；本轮完全使用灵犀场已安装的 pdf-lib/PDF.js，自行实现 React 页面交互。

## 工程结构和用户流程

现有 `/tools/merge-pdf` 与 `/tools/split-pdf` 保留原有操作按钮和下载闭环。用户上传 PDF 后可选「Organize PDF pages」，按需动态加载页面编排组件。
页面缩略图通过 PDF.js 渲染（小缩放尺寸），重组和导出通过 pdf-lib 按原文档页对象复制；不在生产服务器保存用户原件，文件处理在浏览器进行。

功能：跨 PDF 文档单页级重排；拖拽和手机点击前移/后移；逐页左右旋转 90°；复制页、删除页；撤销、重做、恢复初始顺序；另存新 PDF。
完整输出必须由 File Actions 现有额度/收费确认通道交付，不允许绕过扣费。原文件不被覆盖。

## 资源边界

一次可视化操作最多 120 页，超出则只禁用可视化编辑，不影响原来的合并/拆分按钮。
最多缓存每个源页一份缩略图，复制页面重用相同缩略图；卸载时撤销 blob URL，并销毁 PDF.js 对象。
导出时再次加载文件原始二进制，源文件切换后废弃旧导出结果。
PDF 文档可能有加密、签名及交互表单；组合页面可能导致签名失效或改变表单相关性，不能宣称保留电子签名有效性。

## 必须通过的实测

- 上传跨文件 3 个不同尺寸页面，排序、旋转、复制、删除、撤销/重做；保存并以 pdf-lib 重开，检查页数、尺寸、旋转角度。
- 使用 PDF.js 二次读取结果文本，确保不是全部渲染成图片。
- 拖动第三页到第一页，保存后顺序真实改变。
- 上传 121 页时有明确限制，原分割按钮仍可使用。
- 每个场景用 Playwright 桌面及手机模拟环境运行，且不上传用户私人 PDF、不调用真实付款。
- GitHub 生产构建 + desktop/mobile tests + delivery CI 必须针对 exact SHA 均通过；合并/生产另行验收。
