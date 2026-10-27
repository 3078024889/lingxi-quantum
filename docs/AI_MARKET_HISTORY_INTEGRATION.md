# Price history integration contract

The history chart component accepts only a validated chronological PriceSeries for the same OpenRouter model ID. It must never be populated with generated, interpolated or synthetic production data. The current market preview is a live single-observation view and does not display a history chart until a durable licensed snapshot store and server-side ingestion endpoint are integrated.

Required next steps:
1. Store daily validated snapshots in durable access-controlled storage; Actions artifacts expire.
2. Normalize prices into the same USD/token basis, retaining source version and observation time.
3. Load a selected model's last 30/90/365 daily observations, preserving missing days.
4. Call validatePriceSeries before rendering PriceSparkline; reject mixed providers or out-of-order timestamps.
5. Verify licenses and public redistribution rights before exposing any chart publicly.
6. Browser test date selection, unavailable series, accessibility, mobile rendering and error recovery.

Do not infer provider-direct pricing or a quality ranking from OpenRouter quotes.
