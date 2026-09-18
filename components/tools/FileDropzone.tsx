"use client";

import { useCallback, useRef, useState } from "react";
import Bi from "@/components/Bi";

type Props = {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export default function FileDropzone({
  accept = "*/*",
  multiple = false,
  maxFiles = 1,
  maxSizeMB = 40,
  files,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    (list: FileList | File[]) => {
      const arr = Array.from(list);
      if (!arr.length) return;
      const maxBytes = maxSizeMB * 1024 * 1024;
      const tooBig = arr.find((f) => f.size > maxBytes);
      if (tooBig) {
        setError(`文件过大：${tooBig.name}（上限 ${maxSizeMB}MB）`);
        return;
      }
      const next = multiple ? arr.slice(0, maxFiles) : arr.slice(0, 1);
      setError(null);
      onChange(next);
    },
    [maxFiles, maxSizeMB, multiple, onChange],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) apply(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-sm border border-dashed px-6 py-10 text-center transition ${
          drag ? "border-lattice bg-lattice/10" : "border-white/20 bg-void-deep hover:border-lattice/40"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <p className="font-display text-lg text-bone">
          <Bi zh="拖拽文件到这里，或点击选择" en="Drop files here, or click to choose" />
        </p>
        <p className="mt-2 text-xs text-bone-dim">
          <Bi
            zh={`单文件上限 ${maxSizeMB}MB${multiple ? ` · 最多 ${maxFiles} 个` : ""}`}
            en={`Max ${maxSizeMB}MB per file${multiple ? ` · up to ${maxFiles} files` : ""}`}
          />
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) apply(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`} className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-void px-4 py-2 text-sm text-bone-dim">
              <span className="truncate">
                {f.name} · {(f.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                className="shrink-0 text-xs text-lattice hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(files.filter((x) => x !== f));
                }}
              >
                <Bi zh="移除" en="Remove" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
