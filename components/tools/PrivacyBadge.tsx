"use client";

import Bi from "@/components/Bi";

export default function PrivacyBadge({ localOnly = true }: { localOnly?: boolean }) {
  if (localOnly) {
    return (
      <p className="inline-flex items-center gap-2 rounded-sm border border-lattice/30 bg-lattice/10 px-3 py-1.5 text-xs text-lattice">
        <span aria-hidden>🔒</span>
        <Bi
          zh="浏览器本地处理 · 文件不上传服务器"
          en="Processed in your browser · files never leave your device"
        />
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-2 rounded-sm border border-amber/30 bg-amber/10 px-3 py-1.5 text-xs text-amber">
      <span aria-hidden>☁️</span>
      <Bi zh="此功能需上传服务器处理，结束后自动删除" en="This feature uploads to the server; files are deleted after processing" />
    </p>
  );
}
