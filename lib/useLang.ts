"use client";

import { useEffect, useState } from "react";

// 全站好几个文件，之前都各自写了一份"每次要显示的时候，才去读一次
// document.documentElement 的class"这种判断语言的写法——这在组件刚
// 挂载、第一次渲染的那一刻能读到对的值，但语言切换按钮本身只是切换了
// html标签上的一个class，不会让用到这个判断的组件重新渲染，所以切换
// 语言之后，这些地方的文字会卡在切换前的语言，纹丝不动。这个bug在
// 好几个文件里，被分别独立发现、独立修过好几次——抽成这一个共享的
// hook，以后新写的组件，直接用这一个，不用每次重新踩一遍这个坑。
export function useLang() {
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return langEn;
}
