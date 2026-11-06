#!/usr/bin/env bash
# Staging-only, fail-closed loopback bridge install and 3189 real re-acceptance.
# No 3188, nginx, DNS, public sites, payment, Vercel or Supabase writes.
set -Eeuo pipefail
umask 077
[[ "$(id -u)" == 0 && "${1:-}" == "--repair-stage-3189-only" && "$#" == 1 ]] || {
  echo CN_DOC_BRIDGE_USAGE; exit 2;
}
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SOURCE=/root/cn-doc-gateway-loopback-verified.mjs
TARGET=/opt/lingxifield/ops/cn-doc-gateway-loopback.mjs
ENVFILE=/etc/lingxifield/cn-doc-gateway-loopback.env
STAGE_ENV=/etc/lingxifield/staging.env
UNIT=/etc/systemd/system/lingxifield-cn-doc-gateway-loopback.service
STAGE_SCRIPT=/root/cn-six-engine-stage.sh
BRIDGE_SHA=8f3cb866be46bb1c2eeef96d7ab441a8569e3d6e
STAGE_SHA=45002f8751ff714851ae87ffc1c1411fb52877f4

echo "=== CN 3189 loopback bridge preflight ==="
test -x "$NODE"
test -f "$STAGE_ENV"
test -s "$STAGE_SCRIPT"
test ! -e "$UNIT" && test ! -e "$ENVFILE" && test ! -e "$TARGET" || {
 echo CN_DOC_BRIDGE_ALREADY_INSTALLED_ABORT; exit 3;
}
systemctl is-active --quiet lingxifield-ecs
systemctl is-active --quiet lingxifield-cn-stage
test "$(systemctl show -p WorkingDirectory --value lingxifield-cn-stage)" = /opt/lingxifield/releases/cn-pr199
case "$(systemctl show -p EnvironmentFiles --value lingxifield-cn-stage)" in
 *"/etc/lingxifield/staging.env"*) ;;
 *) echo CN_DOC_BRIDGE_STAGING_ENV_ISOLATION_FAILED; exit 3;;
esac
if ss -H -lnt '( sport = :3100 )' | grep -q .; then
 echo CN_DOC_BRIDGE_PORT_3100_ALREADY_IN_USE_ABORT
 exit 3
fi

cleanup(){
 rc=$?
 trap - EXIT
 if [ "$rc" -ne 0 ]; then
   echo CN_DOC_BRIDGE_STAGE_FAILED_CLEANING_BRIDGE
   systemctl disable --now lingxifield-cn-doc-gateway-loopback.service >/dev/null 2>&1 || true
   rm -f "$UNIT" "$TARGET" "$ENVFILE"
   systemctl daemon-reload || true
 fi
 exit "$rc"
}
trap cleanup EXIT

echo "=== CN verified operator and gateway bridge source ==="
"$NODE" - "$STAGE_ENV" "$ENVFILE" <<'NODE'
const fs=require("node:fs"),{parseEnv}=require("node:util");
const env=parseEnv(fs.readFileSync(process.argv[2],"utf8"));
const origin=env.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL;
const payment=["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"];
if(env.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn" ||
   !origin || payment.some(k=>env[k]!=="false")) {
 console.error("CN_DOC_BRIDGE_ENV_OR_PAYMENT_GATE_FAILED"); process.exit(4);
}
const url=new URL(origin);
if(url.protocol!=="https:" || url.username||url.password || url.port && url.port!=="443" ||
   url.search||url.hash|| (url.pathname!=="/"&&url.pathname!=="")) {
 console.error("CN_DOC_BRIDGE_ORIGIN_FAILED"); process.exit(4);
}
fs.writeFileSync(process.argv[3],"LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL="+JSON.stringify(origin.replace(/\/+$/,""))+"\n",{mode:0o600,flag:"wx"});
console.log("CN_DOC_BRIDGE_HTTPS_PUBLIC_ORIGIN_CONFIGURED_NO_SECRET_EXPOSURE");
NODE

# Reuse already downloaded source if exact Git blob matches.
blob_sha(){
 python3 - "$1" <<'PY'
import hashlib,sys
b=open(sys.argv[1],"rb").read()
print(hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest())
PY
}
if [ "$(blob_sha "$STAGE_SCRIPT")" != "$STAGE_SHA" ]; then
 echo CN_DOC_BRIDGE_PREVIOUS_OPERATOR_HASH_MISMATCH
 rm -f "$ENVFILE"
 exit 4
fi
if [ "$(blob_sha "$SOURCE" 2>/dev/null || true)" != "$BRIDGE_SHA" ]; then
 URL=https://raw.githubusercontent.com/3078024889/lingxi-quantum/931d0687ff20f29158bbc5b6374658e4eaa3d57a/scripts/ops/ecs-cn-doc-gateway-loopback.mjs
 if ! curl -4fLsS --retry 3 --max-time 120 -o "$SOURCE" "https://gh-proxy.com/$URL"; then
   curl -4fLsS --retry 3 --max-time 120 -o "$SOURCE" "$URL"
 fi
fi
test "$(blob_sha "$SOURCE")" = "$BRIDGE_SHA" || {
 echo CN_DOC_BRIDGE_SOURCE_MISMATCH; rm -f "$ENVFILE"; exit 4;
}
"$NODE" --check "$SOURCE"
"$NODE" "$SOURCE" --self-test
install -d -m 755 /opt/lingxifield/ops
install -m 644 "$SOURCE" "$TARGET"
cat >"$UNIT" <<EOF
[Unit]
Description=LINGXIFIELD CN 3189 document gateway loopback compatibility bridge
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=lingxifield
Group=lingxifield
EnvironmentFile=$ENVFILE
ExecStart=$NODE $TARGET
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectHome=true
ProtectSystem=strict
RestrictSUIDSGID=true

[Install]
WantedBy=multi-user.target
EOF


systemctl daemon-reload
systemctl enable --now lingxifield-cn-doc-gateway-loopback.service
for i in 1 2 3 4 5 6 7 8; do
 if curl --noproxy '*' -fsS --max-time 4 http://127.0.0.1:3100/health >/dev/null; then
   echo CN_DOC_BRIDGE_REAL_UPSTREAM_HEALTH_PASS
   break
 fi
 if [ "$i" = 8 ]; then echo CN_DOC_BRIDGE_UPSTREAM_HEALTH_FAILED; exit 7; fi
 sleep 1
done

echo "=== Reuse SHA256-verified 454MB archive and rerun 3189-only gates ==="
bash "$STAGE_SCRIPT" --apply-doc-gateway-3189
systemctl is-active --quiet lingxifield-ecs
systemctl is-active --quiet lingxifield-cn-stage
echo CN_DOC_BRIDGE_AND_REAL_STAGE_ACCEPTANCE_PASS_3188_UNCHANGED
