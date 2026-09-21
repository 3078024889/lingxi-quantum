export function transformText(slug: string, value: string, reverse = false): string {
  if (value.length > 500000) throw new Error("请分段处理，每次最多50万字符。");
  switch (slug) {
    case "text-counter": return `字符（含空白）：${Array.from(value).length}\n字符（不含空白）：${Array.from(value.replace(/\s/g, "")).length}\n汉字：${(value.match(/\p{Script=Han}/gu) ?? []).length}\n英文词：${(value.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length}\n行数：${value ? value.split(/\r\n|\r|\n/).length : 0}\nUTF-8 字节：${new TextEncoder().encode(value).length}`;
    case "remove-duplicate-lines": return [...new Set(value.split(/\r\n|\r|\n/))].join("\n");
    case "remove-empty-lines": return value.split(/\r\n|\r|\n/).filter(line => line.trim()).join("\n");
    case "url-encode-decode": return reverse ? decodeURIComponent(value) : encodeURIComponent(value);
    case "base64-encode-decode": {
      if (reverse) {
        const bytes = Uint8Array.from(atob(value.replace(/\s/g, "")), character => character.charCodeAt(0));
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      }
      const bytes = new TextEncoder().encode(value);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    }
    default: throw new Error("未找到此文本工具。");
  }
}
