# Evidence publishing contract (offline staging)
1. Collect a candidate observation from an official report or licensed analytics source. Record metric, units, geography, window, captured date, source URL, source type, limitations.
2. Independently open the source and verify the exact number, period and licensing. Never treat a URL as proof that a claim is correct.
3. Editorial reviewer signs off with status=approved, sourceChecked=true, reviewer identity and reviewedAt timestamp. Sponsored placements are never eligible to change the organic order.
4. Run `node scripts/ai-discovery/review-evidence.mjs candidates.json reviewed-new.json`. This validates shape only and intentionally refuses overwrite.
5. Review the output diff, remove duplicates, confirm provider identity and commit explicitly approved records to `lib/ai-discovery/reviewed-evidence.json` only after second-person review. Default is [].
6. Ranking is permitted only when metric, unit, geography and period match exactly; different metrics never merge into a universal score.
7. No scheduled crawling, unattended scraping, third-party account credentials, or payment charging is enabled. Data refresh remains manual until source agreements and runtime access are verified.
8. SQL evidence tables are a separate staged design, not yet deployed. The JSON reviewed-evidence dataset is the only planned public ranking source at this phase.
