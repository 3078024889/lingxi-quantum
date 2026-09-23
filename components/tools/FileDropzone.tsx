"use client";

import { useCallback, useRef, useState } from "react";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { uploadText } from "@/lib/upload-ui-i18n";

type Props = {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  kind?: "file" | "image" | "media" | "pdf" | "subtitle";
  append?: boolean;
};

export default function FileDropzone({
  accept = "*/*",
  multiple = false,
  maxFiles = 1,
  maxSizeMB = 40,
  files,
  onChange,
  disabled,
  kind = "file",
  append = false,
}: Props) {
  const { lang } = useLingxiLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list);
      if (!incoming.length) return;

      const maxBytes = maxSizeMB * 1024 * 1024;
      const tooBig = incoming.find((file) => file.size > maxBytes);
      if (tooBig) {
        setError(
          uploadText(lang, "tooLarge", {
            name: tooBig.name,
            size: maxSizeMB,
          })
        );
        return;
      }

      const merged =
        multiple && append
          ? [...files, ...incoming]
          : incoming;

      const next = multiple
        ? merged.slice(0, maxFiles)
        : merged.slice(0, 1);

      setError(null);
      onChange(next);
    },
    [append, files, lang, maxFiles, maxSizeMB, multiple, onChange]
  );

  const promptKey =
    kind === "image"
      ? "dropImagesOrChoose"
      : kind === "media"
      ? "dropMediaOrChoose"
      : kind === "pdf"
      ? "dropPdfOrChoose"
      : kind === "subtitle"
      ? "dropSubtitleOrChoose"
      : "dropOrChoose";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDrag(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          if (!disabled) apply(event.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-2xl border border-dashed px-6 py-9 text-center transition ${
          drag
            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
            : "border-slate-300 bg-slate-50 hover:border-blue-300"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <p className="text-base font-medium text-slate-800">
          {drag
            ? uploadText(lang, "dragActive")
            : uploadText(lang, promptKey)}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {uploadText(lang, "maxFile", { size: maxSizeMB })}
          {multiple
            ? ` · ${uploadText(lang, "maxFiles", { count: maxFiles })}`
            : ""}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files) apply(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            >
              <span className="truncate">
                {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                className="shrink-0 text-xs text-blue-700 hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(files.filter((item) => item !== file));
                }}
              >
                {uploadText(lang, "remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
