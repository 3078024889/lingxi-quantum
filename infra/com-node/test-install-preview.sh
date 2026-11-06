#!/usr/bin/env bash
set -euo pipefail
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
bash -n infra/com-node/install-preview.sh
mkdir -p "$dir/bundle/node_modules/next" "$dir/bundle/.next/static" "$dir/bundle/public"
printf '%s\n' "console.log('test');" > "$dir/bundle/server.js"
printf '%s\n' 'x' > "$dir/bundle/.next/static/app.js"
printf '%s\n' 'x' > "$dir/bundle/public/favicon.ico"
printf '%s\n' '{"mode":"next-standalone-node","isolation":true,"productionReady":false,"hadExternalSymlinks":false,"nodeModulesIncluded":true,"publicCopied":true}' > "$dir/bundle/lingxi-com-candidate-report.json"
tar -C "$dir/bundle" -czf "$dir/bundle.tar.gz" .
sha=$(sha256sum "$dir/bundle.tar.gz" | cut -d' ' -f1)
bash infra/com-node/install-preview.sh --verify "$dir/bundle.tar.gz" "$sha" |
 grep -q "COM_NODE_ARCHIVE_VERIFIED"
# A wrong checksum must never be accepted.
if bash infra/com-node/install-preview.sh --verify "$dir/bundle.tar.gz" "$(printf '0%.0s' {1..64})" >/dev/null 2>&1; then
 echo "INVALID_CHECKSUM_ACCEPTED" >&2;exit 1
fi
# Symlinks in a release are prohibited, not silently followed.
ln -s /etc/passwd "$dir/bundle/outside"
tar -C "$dir/bundle" -czf "$dir/bad.tar.gz" .
bad=$(sha256sum "$dir/bad.tar.gz" | cut -d' ' -f1)
if bash infra/com-node/install-preview.sh --verify "$dir/bad.tar.gz" "$bad" >/dev/null 2>&1; then
 echo "RELEASE_SYMLINK_ACCEPTED" >&2;exit 1
fi
echo "COM_NODE_PREVIEW_INSTALLER_SAFE_VERIFY_PASSED"
