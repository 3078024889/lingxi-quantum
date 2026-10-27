# AI market observation dictionary

All catalog-derived data is provisional and remains internal until redistribution rights and source reliability have been reviewed.

| Field | Meaning | Unit | Null policy |
| --- | --- | --- | --- |
| observedAt | UTC time captured | ISO-8601 | Required |
| model.id | Provider-qualified model ID | String | Required |
| context_length | Advertised context window | Tokens | Null if unavailable |
| pricing.prompt | OpenRouter reported prompt unit price | USD/token | Null if unavailable |
| pricing.completion | OpenRouter reported completion unit price | USD/token | Null if unavailable |
| changePct | Relative change between same model and price field | Percent | Null if baseline zero |
| modelCount | Count of normalized model rows | Count | Must match array length |

Do not confuse OpenRouter routing prices with vendor-direct prices. Free models, promotional prices, discounts, batch prices and cached-token rates may differ. This source alone cannot substantiate traffic, downloads, active users, quality rankings or reliability.

Historical snapshots need a persistent store: GitHub Actions artifacts with finite retention are an interim QA mechanism, not a production database. Missing days are missing observations, not flat-price days.
