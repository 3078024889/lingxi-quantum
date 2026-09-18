export type ToolCategory =
  | "image"
  | "pdf"
  | "file"
  | "utility"
  | "qr"
  | "field";

export type ToolStatus = "live" | "beta" | "planned";

export type ToolMeta = {
  /** URL slug under /tools/ */
  slug: string;
  category: ToolCategory;
  status: ToolStatus;
  /** Prefer browser-local processing */
  localOnly: boolean;
  titleZh: string;
  titleEn: string;
  oneLinerZh: string;
  oneLinerEn: string;
  keywords?: string[];
  /** Related tool slugs */
  related?: string[];
  /** If true, page lives at a dedicated folder (e.g. number-energy) */
  dedicatedRoute?: boolean;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
};

export type ToolResultFile = {
  name: string;
  blob: Blob;
  mime: string;
  size: number;
};

export type ToolRunResult = {
  ok: true;
  files?: ToolResultFile[];
  messageZh?: string;
  messageEn?: string;
  /** Free-form diagnostics for UI */
  details?: Record<string, string | number | boolean>;
} | {
  ok: false;
  reasonZh: string;
  reasonEn: string;
  hintZh?: string;
  hintEn?: string;
};
