# Contributing to LINGXIFIELD

Thanks for helping improve LINGXIFIELD.

The project values contributions that make real workflows more reliable, secure, reusable, and maintainable.

## Good contribution areas

- bug fixes
- security hardening
- test coverage
- regression detection
- upload / file-processing reliability
- PDF / image / video tooling
- source-grounded knowledge workflows
- SASI production reliability
- billing / settlement correctness
- documentation
- internationalization
- contributor tooling

## Before opening a large PR

Please open an issue first and describe:

1. the problem
2. the proposed approach
3. affected routes / APIs / tables
4. security implications
5. migration impact, if any
6. how the result can be tested

## Pull request expectations

A good PR should:

- stay focused
- avoid committing secrets
- preserve authorization boundaries
- handle failure paths
- avoid fake / decorative functionality
- reuse shared infrastructure when possible
- keep live / planned product claims accurate
- include tests or clear verification steps
- document migrations and environment changes

## Development

Typical setup:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Before submitting, run the checks that apply to your change.

Examples:

```bash
pnpm build
pnpm lint
pnpm audit:security
pnpm audit:sasi
```

Check `package.json` because scripts may evolve over time.

## Database changes

For Supabase / PostgreSQL changes:

- add an explicit migration
- avoid destructive migration patterns unless necessary
- document backfill requirements
- consider rollback / compatibility
- review RLS and RPC permissions
- verify cross-user isolation

## Security-sensitive changes

Pay special attention to:

- uploads
- URL fetching
- auth
- payment callbacks
- BYOK secrets
- storage policies
- RPCs
- download URLs
- idempotency
- billing and refund state

See [SECURITY.md](SECURITY.md).
