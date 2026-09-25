# SASI Provider Bootstrap & Smoke Harness — V10.18.1

V10.18 confirmed that the hosted SASI production route currently has **no configured video provider** in `.env.local`.

This is different from the existing BYOK Seedance path. BYOK uses a user's own encrypted provider connection and is intentionally billed by that provider account; the hosted SASI production wallet requires a server-side provider credential.

## V10.18.1 adds

### 1. A protected provider smoke endpoint

```text
/api/internal/sasi/provider-smoke
```

It is protected by `CRON_SECRET`.

`GET` is no-spend and reports only:

- configured provider state
- configured model ID
- whether the provider is already production-verified

It never returns credentials.

`POST` can submit **exactly one explicit provider smoke request** only when:

```json
{
  "confirmPaidProviderCall": true
}
```

is present.

The endpoint:

- never touches SASI wallets
- never creates SASI orders
- never creates SASI production jobs
- never flips production readiness flags
- uses a fixed harmless prompt
- does not upload user assets
- refuses automatic paid retry after timeout

### 2. Local provider bootstrap helper

The PowerShell helper can:

- create `CRON_SECRET` locally if missing
- append missing SASI provider config keys to `.env.local`
- optionally configure one provider without echoing its API key
- preserve billing / jobs / refund / settlement gates as false

Secrets remain local and are never added to the repository.

## Important separation

```text
BYOK Seedance
≠
Hosted SASI production provider
```

BYOK charges the user's external provider account.

Hosted SASI production uses the platform's server-side provider credentials and the SASI RMB balance. These two billing systems must not be silently mixed.
