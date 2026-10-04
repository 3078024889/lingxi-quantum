"use client";

import { useMemo, useState } from "react";
import ResultPanel from "@/components/tools/ResultPanel";
import ErrorExplain from "@/components/tools/ErrorExplain";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { toolRuntimeText } from "@/lib/tool-runtime-i18n";

type Unit = "auto" | "s" | "ms" | "us" | "ns";
type ParsedUnit = Exclude<Unit, "auto"> | "date";

const COMMON_ZONES = [
  "UTC",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
];

function normalizeInteger(raw: string) {
  const value = raw.trim().replace(/[,_\s]/g, "");
  return /^-?\d+$/.test(value) ? value : null;
}

function absoluteDigits(value: string) {
  return value.replace(/^-/, "").replace(/^0+(?=\d)/, "");
}

function detectUnit(value: string): Exclude<Unit, "auto"> {
  const digits = absoluteDigits(value).length;
  if (digits >= 19) return "ns";
  if (digits >= 16) return "us";
  if (digits >= 13) return "ms";
  return "s";
}

function integerToMilliseconds(value: string, unit: Exclude<Unit, "auto">) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const divisor = unit === "ns" ? 1_000_000 : unit === "us" ? 1_000 : unit === "ms" ? 1 : 1 / 1_000;
  const milliseconds = unit === "s" ? numeric * 1_000 : numeric / divisor;
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function multiplyIntegerString(value: string, zeroCount: number) {
  const sign = value.startsWith("-") ? "-" : "";
  const digits = absoluteDigits(value);
  return sign + digits + "0".repeat(zeroCount);
}

function millisecondsToScaledInteger(milliseconds: number, unit: "s" | "ms" | "us" | "ns") {
  const wholeMs = Math.trunc(milliseconds);
  if (unit === "s") return String(Math.trunc(wholeMs / 1_000));
  if (unit === "ms") return String(wholeMs);
  if (unit === "us") return multiplyIntegerString(String(wholeMs), 3);
  return multiplyIntegerString(String(wholeMs), 6);
}

function parseInstant(raw: string, unit: Unit): { date: Date; detected: ParsedUnit } | null {
  const integer = normalizeInteger(raw);
  if (integer !== null) {
    const detected = unit === "auto" ? detectUnit(integer) : unit;
    const milliseconds = integerToMilliseconds(integer, detected);
    if (milliseconds === null) return null;
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) return null;
    return { date, detected };
  }

  const date = new Date(raw.trim());
  if (Number.isNaN(date.getTime())) return null;
  return { date, detected: "date" };
}

function formatZone(date: Date, zone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return "—";
  }
}

function relative(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1_000);
  const absolute = Math.abs(seconds);
  const choice: [number, Intl.RelativeTimeFormatUnit] =
    absolute < 60
      ? [seconds, "second"]
      : absolute < 3_600
        ? [Math.round(seconds / 60), "minute"]
        : absolute < 86_400
          ? [Math.round(seconds / 3_600), "hour"]
          : [Math.round(seconds / 86_400), "day"];

  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    choice[0],
    choice[1],
  );
}

function decodeJwt(raw: string) {
  try {
    const parts = raw.trim().split(".");
    if (parts.length < 2) return null;
    const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((character) =>
          "%" + character.charCodeAt(0).toString(16).padStart(2, "0"),
        )
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function excelSerialToDate(serial: number, system1904: boolean) {
  if (!Number.isFinite(serial)) return null;
  const base = Date.UTC(system1904 ? 1904 : 1899, system1904 ? 0 : 11, system1904 ? 1 : 30);
  let days = serial;
  if (!system1904 && serial >= 60) days -= 1;
  return new Date(base + days * 86_400_000);
}

export default function TimestampProWorkbench() {
  const { lang } = useLingxiLang();
  const t = (zh: string, en: string) => toolRuntimeText(lang, zh, en);

  const [tab, setTab] = useState<"convert" | "batch" | "jwt" | "excel">("convert");
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1_000)));
  const [unit, setUnit] = useState<Unit>("auto");
  const [zones, setZones] = useState<string[]>([
    "UTC",
    "Asia/Shanghai",
    "Asia/Singapore",
    "America/New_York",
  ]);
  const [batch, setBatch] = useState("");
  const [jwt, setJwt] = useState("");
  const [excel, setExcel] = useState("45567.5");
  const [system1904, setSystem1904] = useState(false);

  const parsed = useMemo(() => parseInstant(input, unit), [input, unit]);
  const date = parsed?.date;

  const epochs = useMemo(
    () =>
      date
        ? {
            seconds: millisecondsToScaledInteger(date.getTime(), "s"),
            milliseconds: millisecondsToScaledInteger(date.getTime(), "ms"),
            microseconds: millisecondsToScaledInteger(date.getTime(), "us"),
            nanoseconds: millisecondsToScaledInteger(date.getTime(), "ns"),
          }
        : null,
    [date],
  );

  const jwtData = useMemo(() => decodeJwt(jwt), [jwt]);
  const batchRows = useMemo(
    () =>
      batch
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 10_000)
        .map((value) => ({ input: value, parsed: parseInstant(value, "auto") })),
    [batch],
  );
  const excelDate = useMemo(
    () => excelSerialToDate(Number(excel), system1904),
    [excel, system1904],
  );

  function toggleZone(zone: string) {
    setZones((current) =>
      current.includes(zone)
        ? current.filter((value) => value !== zone)
        : current.length >= 8
          ? current
          : [...current, zone],
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["convert", t("时间戳/日期", "Timestamp / date")],
            ["batch", t("批量转换", "Batch")],
            ["jwt", "JWT 时间"],
            ["excel", "Excel / Sheets"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full border px-4 py-2 text-sm ${
              tab === value
                ? "bg-[var(--lx-ink)] text-[var(--lx-bg)]"
                : "border-[var(--lx-line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "convert" && (
        <>
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="1791093560 / 2026-10-04T05:59:20Z"
              className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-3 font-mono"
            />
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value as Unit)}
              className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3"
            >
              <option value="auto">{t("自动识别", "Auto detect")}</option>
              <option value="s">seconds</option>
              <option value="ms">milliseconds</option>
              <option value="us">microseconds</option>
              <option value="ns">nanoseconds</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInput(String(Math.floor(Date.now() / 1_000)))}
              className="rounded-xl border border-[var(--lx-line)] px-4 py-2"
            >
              {t("现在", "Now")}
            </button>
            {COMMON_ZONES.map((zone) => (
              <button
                key={zone}
                onClick={() => toggleZone(zone)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  zones.includes(zone)
                    ? "border-[var(--lx-line-strong)] bg-[var(--lx-soft)]"
                    : "border-[var(--lx-line)]"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>

          {date && epochs ? (
            <>
              <ResultPanel
                messageZh="转换完成。所有结果表示同一个时间点。微秒/纳秒按 JavaScript Date 的毫秒精度展示。"
                messageEn="Converted. All values represent the same instant. Micro/nanoseconds reflect JavaScript Date millisecond precision."
                details={{
                  detected: parsed?.detected,
                  ISO: date.toISOString(),
                  "RFC 2822": date.toUTCString(),
                  local: date.toLocaleString(),
                  relative: relative(date),
                  unixSec: epochs.seconds,
                  unixMs: epochs.milliseconds,
                  unixUs: epochs.microseconds,
                  unixNs: epochs.nanoseconds,
                }}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {zones.map((zone) => (
                  <div
                    key={zone}
                    className="rounded-xl border border-[var(--lx-line)] p-3"
                  >
                    <div className="text-xs text-[var(--lx-faint)]">{zone}</div>
                    <div className="mt-1 font-mono text-sm">
                      {formatZone(date, zone)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ErrorExplain
              reasonZh="无法解析这个时间值。"
              reasonEn="Could not parse this time value."
              hintZh="可输入 Unix 秒/毫秒/微秒/纳秒，ISO 8601 或常见日期字符串。"
              hintEn="Enter Unix s/ms/us/ns, ISO 8601 or a common date string."
            />
          )}
        </>
      )}

      {tab === "batch" && (
        <>
          <textarea
            rows={12}
            value={batch}
            onChange={(event) => setBatch(event.target.value)}
            placeholder={"1791093560\n1791093560000\n2026-10-04T05:59:20Z"}
            className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 font-mono text-sm"
          />
          <div className="max-h-[460px] overflow-auto rounded-xl border border-[var(--lx-line)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="p-2">Input</th>
                  <th className="p-2">ISO 8601</th>
                  <th className="p-2">Unix s</th>
                </tr>
              </thead>
              <tbody>
                {batchRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t border-[var(--lx-line)]"
                  >
                    <td className="p-2 font-mono">{row.input}</td>
                    <td className="p-2 font-mono">
                      {row.parsed?.date.toISOString() || "INVALID"}
                    </td>
                    <td className="p-2 font-mono">
                      {row.parsed
                        ? Math.floor(row.parsed.date.getTime() / 1_000)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--lx-faint)]">
            {t(
              "最多 10,000 行，全部在浏览器本地转换。",
              "Up to 10,000 rows, processed locally in your browser.",
            )}
          </p>
        </>
      )}

      {tab === "jwt" && (
        <>
          <textarea
            rows={6}
            value={jwt}
            onChange={(event) => setJwt(event.target.value)}
            placeholder="eyJhbGciOi..."
            className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 font-mono text-xs"
          />
          <p className="text-xs text-[var(--lx-faint)]">
            {t(
              "这里只解码 JWT payload 来检查 iat / nbf / exp，不验证签名，也不会上传 token。",
              "This only decodes JWT payload claims iat / nbf / exp. It does not verify the signature or upload the token.",
            )}
          </p>
          {jwtData ? (
            <div className="space-y-2">
              {["iat", "nbf", "exp"].map((key) =>
                jwtData[key] != null ? (
                  <div
                    key={key}
                    className="rounded-xl border border-[var(--lx-line)] p-3"
                  >
                    <b>{key}</b>
                    <span className="ml-3 font-mono">
                      {String(jwtData[key])}
                    </span>
                    <span className="ml-3 text-[var(--lx-muted)]">
                      {parseInstant(String(jwtData[key]), "s")?.date.toISOString()}
                    </span>
                  </div>
                ) : null,
              )}
              <pre className="overflow-auto rounded-xl bg-[var(--lx-soft)] p-4 text-xs">
                {JSON.stringify(jwtData, null, 2)}
              </pre>
            </div>
          ) : jwt.trim() ? (
            <ErrorExplain
              reasonZh="无法解析 JWT payload。"
              reasonEn="Could not decode JWT payload."
            />
          ) : null}
        </>
      )}

      {tab === "excel" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              {t("Excel / Sheets 日期序号", "Excel / Sheets serial date")}
              <input
                value={excel}
                onChange={(event) => setExcel(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 font-mono"
              />
            </label>
            <label className="mt-7 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={system1904}
                onChange={(event) => setSystem1904(event.target.checked)}
              />
              {t("使用 1904 日期系统", "Use 1904 date system")}
            </label>
          </div>
          {excelDate && !Number.isNaN(excelDate.getTime()) ? (
            <ResultPanel
              messageZh="日期序号已转换。"
              messageEn="Serial date converted."
              details={{
                ISO: excelDate.toISOString(),
                local: excelDate.toLocaleString(),
                unixSec: Math.floor(excelDate.getTime() / 1_000),
              }}
            />
          ) : (
            <ErrorExplain
              reasonZh="无效的 Excel 日期序号。"
              reasonEn="Invalid Excel date serial."
            />
          )}
        </>
      )}
    </div>
  );
}
