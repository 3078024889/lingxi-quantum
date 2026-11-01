# LINGXIFIELD V2.7 — Type-safe build gate / catalog API

This release retains the V2.6 UI and repaired V2.6.1 analytics module. It adds `GET /api/v1/catalog/stats` and `GET /api/v1/catalog/:id`, 4 new contract tests and a mandatory pre-release gate.

`npm run gate` runs data validation, catalog validation, contract tests, TypeScript strict checks, and Next production build in order. A single failure prevents PASS. No fabricated metrics; zero verified market data remains zero until evidence is ingested.

The installer makes backups before mutation, checks all patch sources, and does not delete existing product records or deploy. The installer will write `V2_7_BUILD_PASS` only when the full gate succeeds on Windows.
