"use client";

import { useMemo, useState } from "react";

type Field = { any: boolean; values: Set<number> };

function expandPart(part: string, min: number, max: number) {
  const values = new Set<number>();
  const [base, stepRaw] = part.split("/");
  const step = stepRaw ? Number(stepRaw) : 1;
  if (!Number.isInteger(step) || step < 1) throw new Error("INVALID_STEP");

  const addRange = (start: number, end: number) => {
    if (start < min || end > max || start > end) throw new Error("RANGE_OUT_OF_BOUNDS");
    for (let value = start; value <= end; value += step) values.add(value);
  };

  if (base === "*") addRange(min, max);
  else if (base.includes("-")) {
    const [start, end] = base.split("-").map(Number);
    addRange(start, end);
  } else {
    const value = Number(base);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error("VALUE_OUT_OF_BOUNDS");
    values.add(value);
  }

  return values;
}

function parseField(raw: string, min: number, max: number): Field {
  const value = raw.trim();
  if (!value) throw new Error("EMPTY_FIELD");
  const values = new Set<number>();

  for (const part of value.split(",")) {
    for (const item of expandPart(part, min, max)) values.add(item);
  }

  return { any: value === "*", values };
}

function parseCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("STANDARD_CRON_REQUIRES_5_FIELDS");

  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    day: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    weekday: parseField(parts[4], 0, 7),
  };
}

function matches(field: Field, value: number, alternate?: number) {
  return field.values.has(value) || (alternate !== undefined && field.values.has(alternate));
}

function cronMatches(date: Date, cron: ReturnType<typeof parseCron>) {
  const dayMatches = matches(cron.day, date.getDate());
  const weekdayMatches = matches(cron.weekday, date.getDay(), date.getDay() === 0 ? 7 : undefined);

  const dayRule =
    cron.day.any && cron.weekday.any
      ? true
      : cron.day.any
        ? weekdayMatches
        : cron.weekday.any
          ? dayMatches
          : dayMatches || weekdayMatches;

  return (
    matches(cron.minute, date.getMinutes()) &&
    matches(cron.hour, date.getHours()) &&
    dayRule &&
    matches(cron.month, date.getMonth() + 1)
  );
}

function nextRuns(expression: string, count = 20) {
  const cron = parseCron(expression);
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const output: Date[] = [];
  const limit = 366 * 24 * 60;

  for (let checked = 0; checked < limit && output.length < count; checked++) {
    if (cronMatches(cursor, cron)) output.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return output;
}

function describe(expression: string) {
  const [minute, hour, day, month, weekday] = expression.trim().split(/\s+/);
  if ([minute, hour, day, month, weekday].some((value) => value === undefined)) return "";

  if (expression === "* * * * *") return "每分钟运行";
  if (minute === "0" && hour === "*" && day === "*" && month === "*" && weekday === "*") return "每小时整点运行";
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && day === "*" && month === "*" && weekday === "*") return `每天 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} 运行`;
  if (minute === "0" && hour === "0" && day === "*" && month === "*" && weekday === "0") return "每周日 00:00 运行";
  return "标准 5 段 Cron：分钟 小时 日 月 星期";
}

export default function CronParserWorkbench() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [count, setCount] = useState(10);

  const parsed = useMemo(() => {
    try {
      return {
        ok: true as const,
        runs: nextRuns(expression, Math.max(1, Math.min(50, count))),
        description: describe(expression),
      };
    } catch (cause) {
      return {
        ok: false as const,
        error: cause instanceof Error ? cause.message : String(cause),
      };
    }
  }, [expression, count]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <label className="text-sm">
          Cron 表达式
          <input
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-3 font-mono"
          />
        </label>
        <label className="text-sm">
          显示次数
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || 10)}
            className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-3"
          />
        </label>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center text-xs text-[var(--lx-muted)]">
        {["分钟", "小时", "日", "月", "星期"].map((item) => (
          <span key={item} className="rounded-lg bg-[var(--lx-soft)] p-2">{item}</span>
        ))}
      </div>

      <p className="text-xs leading-5 text-[var(--lx-muted)]">
        支持标准 5 段 Cron 的 <code>*</code>、列表、范围和步长，例如 <code>*/15 9-18 * * 1-5</code>。结果按浏览器本地时区计算；不把 Quartz 6/7 段语法冒充成已支持。
      </p>

      {parsed.ok ? (
        <>
          <div className="rounded-xl bg-[var(--lx-soft)] p-4 text-sm">
            {parsed.description}
          </div>
          <ol className="space-y-2">
            {parsed.runs.map((date, index) => (
              <li
                key={date.toISOString()}
                className="grid grid-cols-[36px_1fr] gap-3 rounded-xl border border-[var(--lx-line)] p-3 text-sm"
              >
                <span className="text-[var(--lx-faint)]">{index + 1}</span>
                <div>
                  <div className="font-mono">{date.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-[var(--lx-faint)]">{date.toISOString()}</div>
                </div>
              </li>
            ))}
          </ol>
          {!parsed.runs.length && (
            <p className="text-sm text-[var(--lx-muted)]">
              未来 366 天没有找到匹配时间。
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">
          无法解析：{parsed.error}
        </p>
      )}
    </div>
  );
}
