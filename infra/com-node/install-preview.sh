#!/usr/bin/env bash
# Isolated .com Node preview installer. Does not touch .cn, Vercel, apex DNS or Tunnel routes.
set -euo pipefail
umask 077

readonly ROOT=/opt/lingxifield-com-preview
readonly UNIT=/etc/systemd/system/lingxifield-com-preview.service
readonly MARKER=LINGXIFIELD_COM_PREVIEW_MANAGED
readonly PORT=4187
readonly USER_NAME=lingxicom

die(){ printf '%s\n' "COM_PREVIEW_INSTALL_ERROR: $*" >&2; exit 1; }
usage(){ echo "Usage: $0 --verify ARCHIVE.tar.gz SHA256 | --install ARCHIVE.tar.gz SHA256 SOURCE_SHA"; exit 2; }
[[ $# -ge 3 ]] || usage
MODE="$1"; ARCHIVE="$2"; EXPECTED="$3"
[[ "$EXPECTED" =~ ^[a-f0-9]{64}$ ]] || die "ARCHIVE_SHA256_REQUIRED"
[[ -f "$ARCHIVE" && -r "$ARCHIVE" ]] || die "ARCHIVE_NOT_READABLE"
ACTUAL=$(sha256sum "$ARCHIVE" | awk '{print $1}')
[[ "$ACTUAL" == "$EXPECTED" ]] || die "ARCHIVE_HASH_MISMATCH"

# Validate all archive metadata BEFORE unpacking anything, reject all links
# or special entries, and copy members only to new regular files.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
command -v python3 >/dev/null || die "PYTHON3_REQUIRED"
[[ -r "$SCRIPT_DIR/strict-archive.py" ]] || die "ARCHIVE_VALIDATOR_REQUIRED"
unpack(){ python3 "$SCRIPT_DIR/strict-archive.py" "$ARCHIVE" "$1"; }

verify_dir(){
 local where="$1"
 [[ -f "$where/server.js" && -d "$where/node_modules/next" &&
    -d "$where/.next/static" && -d "$where/public" &&
    -f "$where/lingxi-com-candidate-report.json" ]] || die "INCOMPLETE_STANDALONE_BUNDLE"
 [[ -z "$(find "$where" -type l -print -quit)" ]] || die "LINK_FOUND_IN_ISOLATED_BUNDLE"
 node - "$where/lingxi-com-candidate-report.json" <<'NODE'
const fs=require("node:fs");
const r=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
if(r.mode!=="next-standalone-node"||r.isolation!==true||
   r.productionReady!==false||r.hadExternalSymlinks!==false||
   r.nodeModulesIncluded!==true||r.publicCopied!==true||
   !/^[a-f0-9]{40}$/.test(r.sourceSha||""))
  process.exit(1);
NODE
}

if [[ "$MODE" == "--verify" ]]; then
 [[ $# -eq 3 ]] || usage
 TMP=$(mktemp -d);trap 'rm -rf "$TMP"' EXIT
 unpack "$TMP"
 verify_dir "$TMP"
 echo "COM_NODE_ARCHIVE_VERIFIED; no services or domains changed"
 exit 0
fi

[[ "$MODE" == "--install" && $# -eq 4 ]] || usage
[[ "$(id -u)" -eq 0 ]] || die "ROOT_REQUIRED_FOR_SYSTEMD_INSTALL"
SOURCE_SHA="$4"
[[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ ]] || die "SOURCE_SHA_INVALID"
[[ ! -L "$ROOT" && ! -L "$UNIT" ]] || die "SYMLINKED_INSTALL_TARGET"
if [[ -f "$UNIT" ]]; then
 grep -q "$MARKER" "$UNIT" || die "REFUSING_TO_REPLACE_UNRELATED_SYSTEMD_SERVICE"
fi
NODE_BIN=$(command -v node) || die "NODE_BINARY_REQUIRED"
[[ "$NODE_BIN" = /* ]] || die "NODE_BINARY_MUST_BE_ABSOLUTE"
command -v systemctl >/dev/null || die "SYSTEMD_REQUIRED"
command -v curl >/dev/null || die "CURL_REQUIRED"
[[ -z "$(ss -ltn "( sport = :$PORT )" 2>/dev/null | tail -n +2)" ||
   -f "$UNIT" ]] || die "PREVIEW_PORT_OCCUPIED_BY_ANOTHER_SERVICE"

RELEASE="$ROOT/releases/$SOURCE_SHA"
[[ ! -e "$RELEASE" ]] || die "RELEASE_ALREADY_EXISTS"
mkdir -p "$ROOT/releases" /etc/lingxifield-com-preview
mkdir -p "$RELEASE"
trap 'rm -rf "$RELEASE"' ERR
unpack "$RELEASE"
verify_dir "$RELEASE"
BUNDLE_SHA=$(node -p 'require(process.argv[1]).sourceSha' "$RELEASE/lingxi-com-candidate-report.json")
[[ "$BUNDLE_SHA" == "$SOURCE_SHA" ]] || die "RELEASE_SOURCE_SHA_MISMATCH"

if ! id "$USER_NAME" >/dev/null 2>&1; then
 useradd --system --home-dir "$ROOT" --shell /usr/sbin/nologin "$USER_NAME"
fi
chown -R "$USER_NAME:$USER_NAME" "$ROOT"
PREVIOUS=""
if [[ -L "$ROOT/current" ]]; then PREVIOUS=$(readlink "$ROOT/current"); fi

if [[ ! -f "$UNIT" ]]; then
 cat > "$UNIT" <<UNITFILE
# $MARKER: independent .com preview only; preserve .cn services.
[Unit]
Description=LINGXIFIELD isolated .com Node preview
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$ROOT/current
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=HOSTNAME=127.0.0.1
Environment=PORT=$PORT
EnvironmentFile=-/etc/lingxifield-com-preview/app.env
ExecStart=$NODE_BIN $ROOT/current/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=$ROOT
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNITFILE
fi
ln -s "$RELEASE" "$ROOT/current.next"
mv -Tf "$ROOT/current.next" "$ROOT/current"
systemctl daemon-reload
systemctl enable --now lingxifield-com-preview.service
systemctl restart lingxifield-com-preview.service
OK=0
for i in $(seq 1 25); do
 if curl -fsS --max-time 3 "http://127.0.0.1:$PORT/api/health" |
    grep -q '"ok":true'; then OK=1;break;fi
 sleep 1
done
if [[ "$OK" -ne 1 ]]; then
 if [[ -n "$PREVIOUS" ]]; then
  ln -s "$PREVIOUS" "$ROOT/current.revert"
  mv -Tf "$ROOT/current.revert" "$ROOT/current"
  systemctl restart lingxifield-com-preview.service || true
 else
  systemctl stop lingxifield-com-preview.service || true
  rm -f "$ROOT/current"
 fi
 die "NODE_HEALTH_FAILED_ROLLBACK_ATTEMPTED"
fi
trap - ERR
echo "COM_NODE_ISOLATED_PREVIEW_INSTALLED=$SOURCE_SHA"
echo "LOCAL_HEALTH=http://127.0.0.1:$PORT/api/health"
echo "NO_APEX_DNS_CHANGE_NO_CN_CHANGE_NO_VERCEL_CHANGE"
