# LINGXIFIELD Global Commerce Kernel V20

## Gross margin
The platform minimum gross margin is 45%.

This means:
price = cost / 0.55

It does NOT mean cost × 1.45.

## User-owned connections
The user pays their external model bill, but LINGXIFIELD still has real platform cost:
- orchestration
- database
- storage
- upload/download egress
- media extraction/mux
- retries
- abuse prevention
- support

Therefore user-owned connections are not free. The platform charges the greater of:
1. a small product-specific service floor; or
2. measured/estimated platform cost divided by 0.55.

## SASI video
Public standard floor:
- China: ¥0.20/output-second
- International: $0.20/output-second

This tier is only eligible when the provider + platform cost still satisfies ≥45% gross margin.
For expensive providers/resolutions, price automatically moves upward:
max(public floor, total cost / 0.55)

The UI should show user-facing tiers such as Standard / HD / Cinema, not provider names.

## Website building
- plan / initial hero preview: free
- single-page complete export: ¥6 / $6
- up to 8 pages: ¥15 / $15
- web app base delivery: from ¥30 / $30
- subsequent complex iterations: dynamic cost-based quote
- hosting is separate from build price

## Approved utility prices
- image watermark: first 1 image/account/day free; then ¥0.60 / $0.60
- batch image watermark: ¥0.50 / $0.50 per image
- video watermark: account+IP first experience once, up to 60s; then ¥1.50 / $1.50 per minute
- video dubbing: one 30s audio preview/account, no complete MP4; full output ¥3 / $3 per minute
- subtitle translation: first 10 lines preview, export ¥0.30 / $0.30 per minute, minimum ¥0.60 / $0.60
- ID photo: edit and preview free, HD export ¥1 / $1

## Paid-product integrity
A paid button is allowed only when:
- tool id is in the public paid catalog
- runtime readiness exists
- the quoted result can actually be produced
- paid grant/quote is validated before paid output
- failure does not fake success
