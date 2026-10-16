# Web acceptance continuation — 2026-10-17

Continue the 2026-10-16 real-file evidence and independent branch; no main push or production promotion. Physical-phone testing is assigned to the user. Keep one reusable Chrome tool tab, close temporary inspectors, retain private originals locally and make no paid provider/payment calls.

## Previous commit receipts

Source `363fa72f`: media run `38908795004` succeeded (native and browser jobs); delivery run `38908795040` succeeded. Full gate `38908794427` built successfully but desktop closure ended at 890 passed, 59 skipped, one failure. These are test cases, not fully accepted tool counts. The failure was real: the newly curated result-summary formatter inadvertently hid ISO/Unix time outputs because its field list did not include them. Restore meaningful time outputs with nine-language labels, retaining timestamp strings exactly rather than converting large integers to floating point. Internal diagnostic keys remain hidden.

## Actual timestamp/date exploration

Production webpage Excel/Sheets mode was used with serials 1, 59, 60, 61, 25569, 40729 and 40729.5. Observed outputs were one day early; for example 25569 produced 1969-12-31 and 40729 produced 2011-07-04. Evidence is saved locally as `时间转换-真实网页基线-20261017.json`.

The component used a 1899-12-30 base and also subtracted the fictitious 1900 leap day, shifting dates twice. Use 1899-12-31 with the post-60 adjustment; keep 1904-01-01 for the 1904 system. Reject serials 60≤x<61 because their day does not exist in the Gregorian calendar. Empty input must be invalid rather than implicitly converted to zero.

An isolated test of the actual component function passed for 1/59/61/25569/40729 and the 1904 example 39267. Browser regressions additionally verify all four Unix units, ISO/RFC visibility, fractional days, both date systems, empty input and the fictitious leap-day interval. Patched full-web verification runs remotely; production still has the old behavior until release acceptance.

Primary references: [Microsoft Excel date systems and examples](https://support.microsoft.com/en-us/excel/date-systems-in-excel), [Microsoft's explanation of the fictitious 1900 leap day](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/wrongly-assumes-1900-is-leap-year). No new date library or third-party code was copied for this correction.
