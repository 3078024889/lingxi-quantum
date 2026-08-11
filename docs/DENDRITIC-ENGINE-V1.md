# Lingxi Dendritic Knowledge Engine

Version: 1.0
Status: architecture contract

## Definition

Lingxi Dendritic Knowledge Engine is not a machine-learning model and does not learn in production. It is a deterministic content operating system built from calculation, multi-node activation, cross-structure reasoning, versioned editorial knowledge, and unified web/PDF publishing.

The internal Copernicus/Pedro narrative may remain a product-world metaphor. Public technical descriptions must use verifiable language and must not claim that the fictional algorithm is an existing scientific method.

    birth and relationship data
    -> deterministic calculation
    -> shared life-field vector
    -> product-derived dimensions
    -> semantic bands
    -> dendritic activation
    -> cross-node reasoning
    -> chapter composition
    -> safety audit
    -> web/PDF publication

## Runtime Contract

Production generation is read-only, deterministic, and reproducible.

- No model API is required for paid report prose.
- The same input, engine version, and knowledge version produce the same report.
- Exact scores remain available even when language uses semantic bands.
- Every paragraph can expose its activated node IDs and evidence.
- Generated report snapshots remain immutable for existing purchases.
- Knowledge updates are released under a new version instead of silently changing old reports.

Learning happens offline:

    anonymous aggregate signals + explicit user feedback
    -> coverage analysis
    -> editorial proposal
    -> safety and language review
    -> regression fixtures
    -> versioned knowledge release

No raw birth data, relationship text, names, or report content may enter an offline learning corpus without explicit consent and a documented retention policy.

## Dendrite Layers

A premium chapter activates several layers at once:

1. Basic: exact dimension, semantic band, ranking, and source fact.
2. Cross: contrast, reinforcement, compensation, blockage, threshold, and mirror structures.
3. Context: romantic, business, family, friendship, growth stage, or pressure state.
4. Temporal: current state, persistent pattern, transition window, and review interval.
5. Action: observation, experiment, protocol, and retrospective.
6. Counterevidence: conditions under which the judgment is not supported.
7. Narrative: Lingxi-specific metaphor used after the mechanism is clear.
8. Safety: autonomy, uncertainty, privacy, and prohibited-claim rules.

A chapter must not be published with only one selected paragraph.

## Required Chapter Anatomy

Every paid chapter contains:

- primary judgment;
- calculation or factual evidence;
- underlying mechanism;
- observable real-world scene;
- shadow or failure mode;
- counterevidence question;
- concrete action protocol;
- optional Lingxi narrative image.

The engine rejects a chapter missing any of the first seven slots.

## Semantic Resolution

Scores are continuous from 0 to 100. Bands guide language; they do not replace exact values.

- 9 bands: ordinary dimensions.
- 13 bands: important product dimensions.
- 21 bands: sensitive dimensions where language changes meaningfully.
- Increasing band count requires calibration evidence and regression fixtures.
- Decimal-level wording differences are forbidden unless the calculation has validated precision at that level.

## Knowledge Scale

Scale is governed by coverage and quality, not a vanity node count.

Phase-one target:

- 48-72 shared atomic dimensions;
- 3,000-5,000 shared nodes;
- 2,000-5,000 product-specific nodes per product;
- 3,000-8,000 sparse two-dimensional crosses per product;
- 500-2,000 meaningful three-dimensional structures per product;
- 1,000-3,000 context and action nodes per product;
- 60,000-120,000 reviewed nodes across the first complete system.

A generated report should activate roughly 50-100 nodes across 10-15 chapters. Node growth must follow observed coverage gaps, not Cartesian expansion.

## Safety Principle

“Serve the highest interest of the greatest number of beings” becomes auditable rules:

- preserve user agency;
- do not manufacture fear;
- do not predict or pronounce fate;
- do not encourage dependency;
- do not disguise symbolic systems as validated science;
- do not provide medical diagnosis or treatment;
- disclose uncertainty and calculation provenance;
- minimise personal data and enforce owner-only report access.

Safety failures block publication rather than silently degrading.

## Performance Architecture

The engine removes model latency but does not by itself guarantee 20,000 concurrent users.

Required production path:

    CDN: images, fonts, immutable knowledge shards
    edge/server: authentication and entitlement only
    compute: deterministic report assembly
    database: owner lookup, entitlement, immutable snapshot
    client: responsive reading and PDF composition
    observability: latency, error, cache, and queue metrics

Capacity acceptance requires load testing with realistic traffic:

- report calculation p95 below 50 ms excluding auth/database;
- cached report response p95 below 300 ms in the target region;
- no model API calls from the ten paid report routes;
- idempotent generation under retries;
- bounded database connections and verified service quotas;
- client PDF generation without server queue pressure;
- CDN hit ratio and image transfer budget measured on WeChat mobile networks.

“Zero latency” is not a product promise. “Near-instant deterministic calculation and cached retrieval” is measurable and defensible.

## Publication Model

Web and PDF use the same chapter document model:

    ReportDocument
      metadata
      theme
      cover
      chapters[]
        title
        slots
        evidence
        trace
        backgroundAsset
      closing

The browser reading view and PDF exporter consume the same ReportDocument. Styling may adapt to screen and page dimensions, but text, chapter order, evidence, and theme assets must remain identical.

## Migration Order

1. Relationship report: security repair, interface repair, deterministic 11-chapter baseline.
2. Engine protocol: activation trace, evidence, counterevidence, safety, and versioning.
3. Life Resilience: migrate existing mature node library to the protocol.
4. Relationship products: expand romantic, business, and general context branches.
5. Life Map, Romance, Wealth, Daily Tide, Life Mirror, and Life Oracle.
6. Remove dead model-generation code only after parity fixtures pass.
7. Run security review, load tests, WeChat mobile visual QA, and payment regression.