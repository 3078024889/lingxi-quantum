"use client";

import { useState } from "react";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTime(time: number) {
  let value = Math.floor(time);
  let output = "";
  for (let index = 0; index < 10; index++) {
    output = CROCKFORD[value % 32] + output;
    value = Math.floor(value / 32);
  }
  return output;
}

function randomUlidTail() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let output = "";
  for (const byte of bytes) output += CROCKFORD[byte & 31];
  return output;
}

function ulid() {
  return encodeTime(Date.now()) + randomUlidTail();
}

export default function IdGeneratorWorkbench() {
  const [count, setCount] = useState(10);
  const [kind, setKind] = useState<"uuid" | "ulid">("uuid");
  const [values, setValues] = useState<string[]>([]);

  function run() {
    const amount = Math.max(1, Math.min(10_000, count));
    setValues(
      Array.from({ length: amount }, () =>
        kind === "uuid" ? crypto.randomUUID() : ulid(),
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          类型
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as "uuid" | "ulid")
            }
            className="mt-1 w-full rounded-xl border p-2"
          >
            <option value="uuid">UUID v4</option>
            <option value="ulid">ULID</option>
          </select>
        </label>
        <label className="text-sm">
          数量
          <input
            type="number"
            min={1}
            max={10_000}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || 1)}
            className="mt-1 w-full rounded-xl border p-2"
          />
        </label>
      </div>

      <button
        onClick={run}
        className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]"
      >
        生成
      </button>

      {!!values.length && (
        <>
          <textarea
            readOnly
            rows={14}
            value={values.join("\n")}
            className="w-full rounded-xl border bg-[var(--lx-soft)] p-3 font-mono text-xs"
          />
          <button
            onClick={() => navigator.clipboard.writeText(values.join("\n"))}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            复制全部
          </button>
        </>
      )}

      <p className="text-xs text-[var(--lx-muted)]">
        使用浏览器 Web Crypto。UUID v4 是随机标识；ULID 前 10 位编码毫秒时间，后 16 位使用加密随机字节生成，可按时间大体排序。最多一次生成 10,000 个。
      </p>
    </div>
  );
}
