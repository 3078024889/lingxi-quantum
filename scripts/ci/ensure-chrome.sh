#!/usr/bin/env bash
# Use the branded Google Chrome already present on GitHub ubuntu-24.04.
# Playwright channel "chrome" launches this binary. Only download if absent.
set -euo pipefail

if command -v google-chrome >/dev/null 2>&1 && google-chrome --version; then
  echo "PLAYWRIGHT_USING_RUNNER_CHROME"
  exit 0
fi

echo "::warning::Google Chrome not available on runner; attempting a bounded install."
for attempt in 1 2 3; do
  if PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000 pnpm exec playwright install --with-deps chrome; then
    if command -v google-chrome >/dev/null 2>&1 && google-chrome --version; then
      echo "PLAYWRIGHT_CHROME_FALLBACK_INSTALLED"
      exit 0
    fi
  fi
  echo "::warning::Chrome installation attempt ${attempt} failed"
  sleep $((attempt * 12))
done

echo "::error::Google Chrome unavailable after three installation attempts"
exit 1
