#!/usr/bin/env bash
set -euo pipefail
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
bash -n infra/com-node/install-preview.sh
python3 -m py_compile infra/com-node/strict-archive.py
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

# Verify that all malicious tar metadata fails before any content is extracted.
python3 - "$dir" <<'PY'
import io, os, sys, tarfile
d=sys.argv[1]
for case in ("path-escape","symlink","hardlink","duplicate","file-as-parent"):
 with tarfile.open(os.path.join(d,case+".tar.gz"),"w:gz") as tf:
  def put(name,typ=tarfile.REGTYPE,link=""):
   m=tarfile.TarInfo(name);m.type=typ;m.linkname=link
   m.size=1 if typ==tarfile.REGTYPE else 0;m.mode=0o644
   tf.addfile(m,io.BytesIO(b"x") if typ==tarfile.REGTYPE else None)
  if case=="path-escape":put("../escape")
  elif case=="symlink":put("./escape",tarfile.SYMTYPE,"/etc/passwd")
  elif case=="hardlink":put("./escape",tarfile.LNKTYPE,"../../escape")
  elif case=="duplicate":put("./same");put("same")
  else:put("./parent");put("./parent/child")
PY
for case in path-escape symlink hardlink duplicate file-as-parent; do
 bad_file="$dir/$case.tar.gz"
 bad_sha=$(sha256sum "$bad_file" | awk '{print $1}')
 if bash infra/com-node/install-preview.sh --verify "$bad_file" "$bad_sha" >/dev/null 2>&1;then
  echo "MALICIOUS_ARCHIVE_ACCEPTED:$case" >&2;exit 1
 fi
done
echo "COM_ARCHIVE_TRAVERSAL_LINK_DUPLICATE_REJECTED"
