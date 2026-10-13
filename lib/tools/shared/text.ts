export function transformText(slug: string, value: string, reverse = false,labels:readonly string[]=['字符（含空白）','字符（不含空白）','汉字','英文词','行数','UTF-8 字节'],separator='：'): string {
  if (value.length > 500000) throw new Error("请分段处理，每次最多50万字符。");
  switch (slug) {
    case "text-counter": {const counts=[Array.from(value).length,Array.from(value.replace(/\s/g, "")).length,(value.match(/\p{Script=Han}/gu)??[]).length,(value.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)??[]).length,value?value.split(/\r\n|\r|\n/).length:0,new TextEncoder().encode(value).length];return counts.map((count,i)=>`${labels[i]}${separator}${count}`).join('\n');}
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
