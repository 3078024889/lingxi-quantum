import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  pollSasiVideo,
  sasiVideoProviderReadiness,
  submitSasiVideo,
  type SasiVideoProviderId,
} from "@/lib/sasi/provider";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PROVIDERS = new Set<SasiVideoProviderId>(["seedance", "xai", "openai", "wan"]);

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (expected.length < 24 || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function configuredModel(provider: SasiVideoProviderId) {
  const readiness = sasiVideoProviderReadiness().providers[provider];
  if (!readiness.configured || !readiness.model) return null;
  return readiness.model;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const readiness = sasiVideoProviderReadiness();
  return NextResponse.json(
    {
      mode: "no-spend-status",
      providers: Object.fromEntries(
        Object.entries(readiness.providers).map(([id, state]) => [
          id,
          {
            configured: state.configured,
            model: state.model || null,
            // Smoke harness intentionally does not require the production verified flag.
            productionVerified: state.verified,
          },
        ]),
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (body.confirmPaidProviderCall !== true) {
    return NextResponse.json(
      {
        error: "EXPLICIT_PAID_PROVIDER_CONFIRMATION_REQUIRED",
        note: "No provider request was sent.",
      },
      { status: 409 },
    );
  }

  const provider = typeof body.provider === "string" ? body.provider : "";
  if (!PROVIDERS.has(provider as SasiVideoProviderId)) {
    return NextResponse.json({ error: "INVALID_PROVIDER" }, { status: 400 });
  }

  const providerId = provider as SasiVideoProviderId;
  const model = configuredModel(providerId);
  if (!model) {
    return NextResponse.json({ error: "PROVIDER_NOT_CONFIGURED" }, { status: 503 });
  }

  const duration = Number(body.duration);
  const allowedDuration =
    providerId === "openai"
      ? [4, 8, 12].includes(duration)
      : Number.isInteger(duration) && duration >= 4 && duration <= 12;

  if (!allowedDuration) {
    return NextResponse.json({ error: "INVALID_TEST_DURATION" }, { status: 400 });
  }

  const aspectRatio =
    body.aspectRatio === "9:16" || body.aspectRatio === "1:1" ? body.aspectRatio : "16:9";
  const quality =
    body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";

  // Deliberately simple, non-sensitive prompt. The smoke harness never accepts
  // arbitrary user assets and never touches the SASI wallet.
  const prompt =
    "A white paper boat slowly moves across a shallow reflective pool, static camera, simple neutral background.";

  let submitted;
  try {
    submitted = await submitSasiVideo({
      prompt,
      duration,
      aspectRatio,
      quality,
      selection: { provider: providerId, model, quality },
    });
  } catch (error) {
    console.error("[provider smoke] submit failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "PROVIDER_SUBMIT_FAILED" },
      { status: 502 },
    );
  }

  const startedAt = Date.now();
  const deadline = startedAt + 240_000;

  while (Date.now() < deadline) {
    await sleep(5000);

    try {
      const polled = await pollSasiVideo(providerId, model, submitted.providerJobId);

      if (polled.state === "queued" || polled.state === "running") continue;

      if (polled.state === "failed") {
        return NextResponse.json(
          {
            ok: false,
            provider: providerId,
            model,
            providerJobId: submitted.providerJobId,
            state: "failed",
            errorCode: polled.errorCode,
          },
          { status: 502 },
        );
      }

      return NextResponse.json({
        ok: true,
        provider: providerId,
        model,
        providerJobId: submitted.providerJobId,
        state: "succeeded",
        videoUrl: polled.videoUrl,
        providerCostMinor: polled.providerCostMinor,
        providerCostCurrency: polled.providerCostCurrency,
        elapsedMs: Date.now() - startedAt,
        note: "Provider generation succeeded. This smoke endpoint does not write SASI wallet, jobs, deliveries, or production verification flags.",
      });
    } catch (error) {
      console.error("[provider smoke] poll failed", error instanceof Error ? error.message : "unknown");
      return NextResponse.json(
        {
          error: "PROVIDER_POLL_FAILED",
          provider: providerId,
          model,
          providerJobId: submitted.providerJobId,
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(
    {
      ok: false,
      provider: providerId,
      model,
      providerJobId: submitted.providerJobId,
      state: "pending",
      error: "SMOKE_TEST_TIMEOUT_CHECK_PROVIDER_CONSOLE",
      note: "Do not resubmit automatically. Check the provider task first to avoid duplicate spend.",
    },
    { status: 409 },
  );
}
