# Source data integrity and anomaly gate
Run `node --test tests/ai-data-quality.test.mjs` and `node scripts/ai-discovery/audit-snapshots.mjs` before considering any refreshed data for publication.
Reject duplicate repositories, malformed official source links, noninteger or negative counts, missing timestamps, and unrecognized evidence states.
Flag archive status changes, significant count drops and nonadvancing timestamps for human review. These flags are not proof of data corruption; legitimate GitHub corrections can happen.
The source snapshot and latest history record must match exactly. A failure exits nonzero.
These are source metadata checks, not independent verification of user counts, pricing or model capabilities. Do not interpret stars as usage or quality.
