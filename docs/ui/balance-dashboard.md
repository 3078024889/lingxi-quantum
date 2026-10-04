# Balance dashboard design references

Reviewed 2026-10-04:
- shadcn/ui Table: https://ui.shadcn.com/docs/components/table (MIT, https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). Semantic table composition, row actions and responsive layout.
- Tremor: https://github.com/tremorlabs/tremor (Apache-2.0). Clear metric hierarchy and consistent compact dashboard spacing.

These patterns inform independently written local components and CSS; no upstream source is vendored and no new dependency is installed. The user-provided Volcengine screenshots inform layout only.

All amounts and records come from the existing money APIs. Both currencies remain separate; the selected currency filters eligible top-ups and withdrawal history. Native confirmation, draft cancellation, provider reconciliation and shared automatic refresh are preserved. No invoice, credit line or merchant balance is implied.

## Compact finance tabs (2026-10-04)

Four public entries: overview, top-up, withdrawal, refund history. Only one panel is visible. References: https://www.radix-ui.com/primitives/docs/components/tabs and https://ui.shadcn.com/docs/components/tabs. Independently implemented ARIA roles, roving focus, arrow/Home/End navigation, RTL direction and hash deep links. Inactive panels remain mounted so form state and the shared progress scheduler continue safely. Operator dashboard remains a separate authorized link.
