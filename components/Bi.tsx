// 双语文本：同时渲染中文与英文，由 html.lang-en 类切换显示。
// 服务端组件兼容（纯渲染，无状态）。
export default function Bi({
  zh,
  en,
  block = false,
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
  block?: boolean;
}) {
  return (
    <>
      <span data-lang="zh">{zh}</span>
      <span data-lang="en" className={block ? "bi-block" : undefined}>
        {en}
      </span>
    </>
  );
}
