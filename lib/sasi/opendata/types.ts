export type BronzeRecord = {
  id: string;
  sourceId: string;
  url?: string;
  title: string;
  license: string;
  rightsScope: string;
  content: string;
  contentHash: string;
  fetchedAt: string;
  encodingOk: boolean;
};

export type AllowlistSource = {
  id: string;
  name: string;
  enabledEnv?: string;
  fetchMode: "fixture" | "http";
  notes?: string;
};

export type IngestRunReport = {
  enabled: boolean;
  mode: "dry-run" | "write" | "disabled";
  fetched: number;
  accepted: number;
  rejected: number;
  reasons: string[];
  at: string;
};
