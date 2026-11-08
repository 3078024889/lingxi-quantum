# Legacy SASI retirement — staged, not deployed

This branch preserves the new software marketplace, seller APIs, downloads, account data and historical paid deliveries. It removes 22 retired field components/media/archive files plus the unreferenced video assembler and BYOK image studio. Twelve obsolete creation pages redirect to `/sasi`; the generation-submit and old radar endpoints return HTTP 410 without invoking providers. The radar schedule is removed from Vercel configuration. Cloudflare's asset allowlist no longer serves the retired entrance movie.

Remaining work: retire other legacy creation APIs and their shared implementation only after checking dependencies on tools and historical orders; run the full production gate; publish the new build; inspect and remove dedicated obsolete cloud deployments and R2 media. Do not delete the shared Cloudflare Worker or Vercel project. Removing files from this branch does not delete Git history or previously deployed artifacts.

The requested cleanup in `D:\30780\lingxi-quantum` was blocked by automatic approval review (`blocked by policy`); no files were deleted there by this attempt. Its existing uncommitted edits remain untouched. No cloud deletion was performed.
