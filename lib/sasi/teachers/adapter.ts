import type {
  SasiTeacherProfile,
  SasiTeacherRole,
} from "@/lib/sasi/teachers/registry";

export type SasiTeacherMessage = {
  role: "system" | "user";
  content: string;
};

export type SasiTeacherCallInput = {
  profile: SasiTeacherProfile;
  role: SasiTeacherRole;
  messages: SasiTeacherMessage[];
  responseSchemaName: string;
  maxOutputTokens?: number;
};

export type SasiTeacherCallResult = {
  provider: string;
  model: string;
  providerRequestId?: string | null;
  outputText: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    costMinor?: number;
    currency?: string;
  } | null;
};

export interface SasiTeacherAdapter {
  supports(profile: SasiTeacherProfile): boolean;
  call(input: SasiTeacherCallInput): Promise<SasiTeacherCallResult>;
}

/**
 * Runtime registry deliberately has no default network adapters.
 * Providers are plugged in explicitly from configured BYOK/hosted connectors.
 */
export class SasiTeacherAdapterRegistry {
  private readonly adapters: SasiTeacherAdapter[] = [];

  register(adapter: SasiTeacherAdapter) {
    this.adapters.push(adapter);
  }

  resolve(profile: SasiTeacherProfile) {
    return this.adapters.find((adapter) => adapter.supports(profile)) ?? null;
  }
}
