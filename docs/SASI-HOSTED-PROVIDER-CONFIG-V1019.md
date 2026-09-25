# V10.19 Hosted Provider Configuration

V10.18.2 confirmed that no hosted production video provider is currently configured.

V10.19 does **not** invent credentials, model access, or pricing.

It provides two separate operations:

## A. Configure one hosted provider locally — no spend

Run:

```powershell
.\CONFIGURE_V1019_HOSTED_PROVIDER.ps1 -RepoRoot "D:\lingxi-quantum"
```

The script prompts locally for one provider and reads the API key as a secure console value.

It never prints the API key.

Configuration alone does not mark the provider as production verified.

## B. Run one real provider smoke test — potentially paid

A separate script is included:

```powershell
.\RUN_V1019_PAID_PROVIDER_SMOKE.ps1 ...
```

It refuses to proceed unless:

```text
-ConfirmPaidProviderCall "YES"
```

is explicitly provided.

The smoke test calls the protected `/api/internal/sasi/provider-smoke` endpoint on localhost.

Before running it, start the app locally:

```powershell
cd D:\lingxi-quantum
pnpm dev
```

## Important

The paid smoke test validates provider submit/poll only.

It still does not:

- debit SASI wallet
- enable billing
- enable jobs
- mark refund flow tested
- mark usage settlement tested
- mark the provider production verified automatically

Those gates require explicit acceptance after reviewing the smoke result.
