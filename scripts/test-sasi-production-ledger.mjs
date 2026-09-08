import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase admin environment is not configured");
const admin = createClient(url, key, { auth: { persistSession: false } });
const email = `sasi-ledger-${Date.now()}@example.invalid`;
const password = crypto.randomBytes(24).toString("base64url");
let userId = "";

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error("temporary user creation failed");
  userId = created.data.user.id;
  const order = await admin.from("orders").insert({
    user_id: userId,
    product_id: "sasi-credit-entry",
    product_type: "permanent",
    amount_usd: 3,
    amount_rmb: 20,
    status: "pending",
    provider: "ledger-test",
    provider_payment_id: `ledger-test-${crypto.randomUUID()}`,
  }).select("id").single();
  if (order.error || !order.data) throw order.error ?? new Error("test order failed");

  const firstTopup = await admin.rpc("credit_sasi_topup", { p_order_id: order.data.id });
  const secondTopup = await admin.rpc("credit_sasi_topup", { p_order_id: order.data.id });
  if (firstTopup.error || secondTopup.error || !firstTopup.data?.ok || !secondTopup.data?.alreadyPaid) throw new Error("top-up idempotency failed");

  const project = await admin.from("sasi_projects").insert({ user_id: userId, kind: "drama", title: "Ledger verification", language: "zh" }).select("id").single();
  if (project.error || !project.data) throw project.error ?? new Error("test project failed");
  const node = await admin.from("sasi_nodes").insert({ project_id: project.data.id, user_id: userId, node_type: "shot-generation", status: "ready" }).select("id").single();
  if (node.error || !node.data) throw node.error ?? new Error("test node failed");
  const requestId = crypto.randomUUID();
  const reserveInput = {
    p_user_id: userId,
    p_request_id: requestId,
    p_project_id: project.data.id,
    p_node_id: node.data.id,
    p_provider: "ledger-test",
    p_model: "ledger-test",
    p_quoted_points: 345,
    p_input: { prompt: "ledger verification only" },
  };
  const firstReserve = await admin.rpc("create_and_reserve_sasi_job", reserveInput);
  const secondReserve = await admin.rpc("create_and_reserve_sasi_job", reserveInput);
  if (firstReserve.error || secondReserve.error || !firstReserve.data?.created || secondReserve.data?.created) throw new Error("reservation idempotency failed");
  const jobId = firstReserve.data.jobId;
  const firstRelease = await admin.rpc("release_sasi_job", { p_job_id: jobId, p_status: "failed", p_error_code: "LEDGER_TEST" });
  const secondRelease = await admin.rpc("release_sasi_job", { p_job_id: jobId, p_status: "failed", p_error_code: "LEDGER_TEST" });
  if (firstRelease.error || secondRelease.error || !firstRelease.data?.ok || !secondRelease.data?.alreadyReleased) throw new Error("release idempotency failed");

  const settledRequest = crypto.randomUUID();
  const settlementReserve = await admin.rpc("create_and_reserve_sasi_job", { ...reserveInput, p_request_id: settledRequest, p_quoted_points: 500 });
  if (settlementReserve.error || !settlementReserve.data?.created) throw new Error("settlement reservation failed");
  const settlementInput = { p_job_id: settlementReserve.data.jobId, p_actual_points: 350, p_provider_cost_minor: 123, p_output: { deliveryReady: true } };
  const firstSettlement = await admin.rpc("settle_sasi_job", settlementInput);
  const secondSettlement = await admin.rpc("settle_sasi_job", settlementInput);
  if (firstSettlement.error || secondSettlement.error || !firstSettlement.data?.ok || !secondSettlement.data?.alreadySettled) throw new Error("settlement idempotency failed");

  const [wallet, entries] = await Promise.all([
    admin.from("sasi_wallets").select("available_points,reserved_points").eq("user_id", userId).single(),
    admin.from("sasi_credit_ledger").select("kind").eq("user_id", userId),
  ]);
  if (wallet.error || wallet.data.available_points !== 1650 || wallet.data.reserved_points !== 0) throw new Error("wallet invariant failed");
  const kinds = (entries.data ?? []).map((entry) => entry.kind).sort().join(",");
  if (kinds !== "release,reserve,reserve,settle,topup") throw new Error(`unexpected ledger: ${kinds}`);
  console.log("PASS SASI production ledger: top-up, reserve, release and settlement are atomic and idempotent");
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
}
