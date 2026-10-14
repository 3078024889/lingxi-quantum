# Bounded dependency patches

Applied by pnpm's `patchedDependencies` during frozen installs. No advisories are suppressed.

- `braces@3.0.3.patch`: limit the parser's combined brace/parenthesis stack to 128 before recursive AST visitors see deeply nested **string** patterns. Addresses the demonstrated input path in [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Direct caller-supplied AST objects are outside this mitigation claim. Upstream source: [micromatch/braces](https://github.com/micromatch/braces), MIT; attribution/license retained in `LICENSE-braces.txt` and the installed dependency.
- `sprintf-js@1.0.3.patch`: bound format size to 1 MiB, field width to 100,000, precision to 1,000 and aggregate emitted output to 1 MiB before runaway output allocation. Addresses hostile format specifiers in [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c). Upstream source: [alexei/sprintf.js](https://github.com/alexei/sprintf.js), BSD-3-Clause; attribution/license retained in `LICENSE-sprintf-js.txt` and the installed dependency.

Both upstream versions still appear in raw registry audit results because no patched upstream release exists. The local protections are checked by `scripts/test-dependency-compat-v85.cjs`; normal CSS/glob/formatting behavior is also covered by the production build. This is a documented local mitigation, not a claim that the upstream advisory has been withdrawn or every possible third-party API call has been proven safe.
