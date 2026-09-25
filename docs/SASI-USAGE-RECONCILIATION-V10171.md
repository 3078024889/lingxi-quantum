# SASI Usage Reconciliation — V10.17.1

V10.17 correctly identified the missing settlement bridge, but its first implementation failed TypeScript for two reasons:

1. the repository target is below ES2020, so BigInt literals such as `32n` / `0n` are invalid;
2. delivery-duration variables were created inside the `if (!existing)` block and were therefore out of scope during settlement.

V10.17.1 fixes both issues.

## Final flow

```text
provider succeeds
→ trusted provider URL is downloaded
→ MP4 is validated
→ moov/mvhd duration is parsed
→ AIGC metadata is embedded
→ delivery SHA-256 is recorded
→ verifiedUsage is persisted
→ signed retail quote is settled using delivered seconds
→ unused reserved balance is released
→ job succeeds
```

If duration cannot be verified, settlement remains fail-closed as `BILLING_USAGE_PENDING`.

The code still requires a real low-cost provider smoke test before any production readiness flags are enabled.
