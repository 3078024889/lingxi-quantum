# SASI Production Readiness — 2026-09-23

## Verified in V10.16

### Database ledger kernel

A rollback-only integration test was executed against the production database.

The test exercised:

1. RMB top-up credit
2. wallet balance creation / update
3. job reservation
4. partial settlement
5. unused reserved balance release
6. failed-job release
7. final wallet invariant

Result:

```text
PASS
topup + reserve + settle + release all passed inside rolled-back transaction
```

No test records or test balances were persisted because the whole integration test was rolled back.

### RPC permissions

The following money-moving functions are restricted to `service_role` / postgres execution and are not executable by public, anon, or authenticated roles:

- `credit_sasi_topup`
- `create_and_reserve_sasi_job`
- `reserve_sasi_points`
- `settle_sasi_job`
- `release_sasi_job`

### Production drift found and repaired

The repository already contained support for the full SASI RMB balance catalog, but the deployed `credit_sasi_topup` RPC had drifted to an older three-product implementation.

The production RPC was repaired to support:

- ¥10
- ¥20
- ¥50
- ¥100
- ¥200
- ¥500
- ¥1000
- ¥2000
- ¥10000
- custom whole-RMB amounts from ¥10 to ¥10000

The function remains idempotent by checking the top-up ledger reference before crediting.

---

## Still blocked

Do not enable the production gates yet.

Current local readiness flags:

```text
SASI_RMB_BALANCE_V1_ENABLED     missing
SASI_BILLING_ENABLED            false
SASI_JOBS_ENABLED               false
SASI_REFUND_FLOW_TESTED         false
SASI_USAGE_SETTLEMENT_TESTED    missing
```

Content labeling is configured.

The remaining major blocker is **trusted usage reconciliation after provider success**.

`lib/sasi/production.ts` deliberately requires:

```text
verifiedUsage.source === "provider-billing"
```

before final settlement.

That is correct for billing integrity, but a trusted adapter must actually write this evidence. Until that adapter is verified, `SASI_USAGE_SETTLEMENT_TESTED` must remain false.

---

## Next acceptance target

V10.17 should verify and complete:

```text
provider submit
→ provider success
→ trusted usage evidence
→ settle_sasi_job
→ delivery
→ release unused balance
```

Only after that path passes should:

```text
SASI_USAGE_SETTLEMENT_TESTED=true
SASI_JOBS_ENABLED=true
```

be considered.

Refund flow must be separately tested before:

```text
SASI_REFUND_FLOW_TESTED=true
```

Production top-ups should remain protected by `productionReady` until all required gates are green.
