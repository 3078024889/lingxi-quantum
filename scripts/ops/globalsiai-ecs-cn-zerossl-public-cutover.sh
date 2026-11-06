#!/usr/bin/env bash
# ZeroSSL fallback: publish globalsiai.cn only; preserve all existing production services.
set -Eeuo pipefail
umask 077
if [ "$#" != 1 ] || [ "$1" != "--publish-globalsiai-cn-zerossl-only" ] || [ "$(id -u)" != 0 ]; then
  echo "GLOBALSIAI_CN_PUBLIC_USAGE: bash script --publish-globalsiai-cn-zerossl-only (root)"
  exit 2
fi
DOMAIN=globalsiai.cn
WWW=www.globalsiai.cn
ECS_IP=39.104.205.16
PORT=4289
VHOST=/etc/nginx/conf.d/98-globalsiai-cn-only.conf
WEBROOT=/var/www/globalsiai-acme
CERTDIR=/etc/lingxifield/certs/globalsiai.cn
ACME_HOME=/opt/lingxifield/ops/globalsiai-cn-zerossl-acme
ACME_SOURCE=$ACME_HOME/acme.sh
ACME_BLOB=9561ff768478f994ea7992a56411c376e073c7f6
RENEW_UNIT=/etc/systemd/system/globalsiai-cn-zerossl-renew.service
RENEW_TIMER=/etc/systemd/system/globalsiai-cn-zerossl-renew.timer
HOOK=/etc/letsencrypt/renewal-hooks/deploy/98-globalsiai-cn-nginx.sh
TMP="$(mktemp -d /tmp/globalsiai-cn-public-XXXXXX)"
installed=0
hook_installed=0
completed=0
acme_created=0
timer_created=0
rollback(){
 rc=$?
 trap - EXIT
 rm -rf -- "$TMP"
 if [ "$rc" -ne 0 ] && [ "$completed" -eq 0 ]; then
   echo GLOBALSIAI_CN_CUTOVER_FAILED_ROLLBACK_START
   if [ "$timer_created" -eq 1 ]; then
     systemctl disable --now globalsiai-cn-zerossl-renew.timer >/dev/null 2>&1 || true
     rm -f -- "$RENEW_UNIT" "$RENEW_TIMER"
     systemctl daemon-reload || true
   fi
   if [ "$acme_created" -eq 1 ]; then
     case "$ACME_HOME" in
       /opt/lingxifield/ops/globalsiai-cn-zerossl-acme)
         rm -rf -- "$ACME_HOME" "$CERTDIR" ;;
     esac
   fi
   if [ "$installed" -eq 1 ]; then
     rm -f -- "$VHOST"
     if nginx -t >/dev/null 2>&1; then
       systemctl reload nginx || true
     else
       echo GLOBALSIAI_CN_ORIGINAL_NGINX_CHECK_REQUIRED
     fi
   fi
   echo GLOBALSIAI_CN_PUBLIC_ROLLBACK_OLD_SITES_UNTOUCHED
 fi
 exit "$rc"
}
trap rollback EXIT
exec 9>/run/lock/globalsiai-dual-domain-public.lock
flock -n 9 || { echo GLOBALSIAI_CN_CONCURRENT_CUTOVER_ABORT; exit 3; }

echo "=== 1. 私有站与DNS只读发布门禁 ==="
for svc in lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage nginx; do
 systemctl is-active --quiet "$svc"
done
command -v dig >/dev/null
command -v sha256sum >/dev/null
command -v sh >/dev/null
command -v openssl >/dev/null
test ! -e "$VHOST" && test ! -L "$VHOST" || {
 echo GLOBALSIAI_CN_EXISTING_SITE_CONFIG_ABORT; exit 3;
}
for obj in "$ACME_HOME" "$CERTDIR" "$RENEW_UNIT" "$RENEW_TIMER"; do
 if [ -e "$obj" ] || [ -L "$obj" ]; then
   echo GLOBALSIAI_CN_EXISTING_ZEROSSL_RESOURCES_ABORT
   exit 3
 fi
done
# ZeroSSL/Sectigo must be permitted by CAA in addition to Let's Encrypt.
for ns in dns1.hichina.com dns2.hichina.com; do
  answer="$(dig "@$ns" globalsiai.cn CAA +tcp +time=4 +tries=1 +noall +comments +answer 2>&1)" || true
  if ! printf '%s\n' "$answer" | grep -Eq 'CAA[[:space:]]+0[[:space:]]+issue[[:space:]]+"sectigo.com"'; then
    echo "GLOBALSIAI_CN_ZEROSSL_CAA_NOT_READY_NS=$ns"
    exit 3
  fi
done
echo GLOBALSIAI_CN_ZEROSSL_CAA_AUTHORIZED_BOTH_ALIDNS
nginx -t >/dev/null
nginx -T > "$TMP/nginx-original" 2>/dev/null
if grep -Eq 'server_name[[:space:]][^;]*(www\.)?globalsiai\.cn' "$TMP/nginx-original"; then
 echo GLOBALSIAI_CN_SERVERNAME_COLLISION_ABORT; exit 3
fi
grep -Eq 'include[[:space:]]+/etc/nginx/conf\.d/\*\.conf' "$TMP/nginx-original" || {
 echo GLOBALSIAI_CN_NGINX_CONF_D_NOT_INCLUDED_ABORT; exit 3;
}
for domain in "$DOMAIN" "$WWW"; do
  ips="$(getent ahostsv4 "$domain" | awk '{print $1}' | sort -u)"
  if [ "$ips" != "$ECS_IP" ]; then
    echo "GLOBALSIAI_CN_DNS_NOT_READY:$domain=$ips"; exit 3
  fi
done
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
 code="$(curl --noproxy '*' -sS --max-time 18 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT$path")"
 test "$code" = 200 || { echo "GLOBALSIAI_CN_STAGE_FAILED:$path=$code"; exit 3; }
done
curl --noproxy '*' -fsS --max-time 15 -H "Host: $DOMAIN" \
 "http://127.0.0.1:$PORT/" >"$TMP/cn"
grep -Fq '湘ICP备2026031465号-4' "$TMP/cn" || { echo GLOBALSIAI_CN_ICP_MISSING_ABORT; exit 3; }
curl --noproxy '*' -fsS --max-time 15 -H 'Host: globalsiai.com' \
 "http://127.0.0.1:$PORT/" >"$TMP/com"
if grep -Fq '湘ICP备2026031465号-4' "$TMP/com"; then
 echo GLOBALSIAI_COM_ICP_LEAK_ABORT; exit 3
fi
curl --noproxy '*' -fsS --max-time 10 "http://127.0.0.1:$PORT/robots.txt" |
 grep -qi 'Disallow: /' || { echo GLOBALSIAI_CN_NOINDEX_ABORT; exit 3; }
PID_3188="$(systemctl show -p MainPID --value lingxifield-ecs)"
PID_3189="$(systemctl show -p MainPID --value lingxifield-cn-stage)"
echo GLOBALSIAI_CN_STAGE_DNS_ICP_9LANG_PRECHECK_PASS

echo "=== 2. 仅为 globalsiai.cn 建立 HTTP 证书验证入口 ==="
install -d -m 755 "$WEBROOT/.well-known/acme-challenge"
# Dedicated ACME directories must be readable by the nginx worker, even with umask 077.
chmod 755 "$WEBROOT" "$WEBROOT/.well-known" "$WEBROOT/.well-known/acme-challenge"
cat >"$VHOST" <<EOF
# LINGXIFIELD globalsiai.cn: owned independent virtual host only
server {
  listen 80;
  server_name globalsiai.cn www.globalsiai.cn;
  location ^~ /.well-known/acme-challenge/ {
    root $WEBROOT;
    default_type text/plain;
    try_files \$uri =404;
    add_header X-Globalsiai-Acme-Vhost $DOMAIN always;
  }
  location / { return 301 https://globalsiai.cn\$request_uri; }
}
EOF
installed=1
nginx -t >/dev/null
systemctl reload nginx
PROBE="$WEBROOT/.well-known/acme-challenge/probe-$$"
printf '%s\n' "GLOBALSIAI-PROBE-$$" >"$PROBE"
chmod 644 "$PROBE"
# Nginx reload is asynchronous. Poll both SNI/Host names, and distinguish
# "old default vhost 404" from a path/permission failure inside the new vhost.
probe_name="$(basename "$PROBE")"
probe_expected="GLOBALSIAI-PROBE-$$"
for name in "$DOMAIN" "$WWW"; do
  confirmed=0
  for attempt in $(seq 1 18); do
    code="$(curl --noproxy '*' -sS --max-time 5 -D "$TMP/acme-headers" \
      -o "$TMP/acme-body" -w '%{http_code}' \
      --resolve "$name:80:127.0.0.1" \
      "http://$name/.well-known/acme-challenge/$probe_name" || true)"
    if [ "$code" = 200 ] && \
       grep -Fxq "$probe_expected" "$TMP/acme-body" && \
       grep -Fqi "X-Globalsiai-Acme-Vhost: $DOMAIN" "$TMP/acme-headers"; then
      confirmed=1
      echo "GLOBALSIAI_CN_ACME_PROBE_OK_HOST=$name ATTEMPT=$attempt"
      break
    fi
    # Do not retry through redirects or authentication; strict 200 only.
    if [ "$attempt" -lt 18 ]; then sleep 1; fi
  done
  if [ "$confirmed" != 1 ]; then
    echo "GLOBALSIAI_CN_ACME_HOST_FAILED=$name LAST_HTTP=$code"
    echo "GLOBALSIAI_CN_ACME_VHOST_SEEN=$(grep -Fqi "X-Globalsiai-Acme-Vhost: $DOMAIN" "$TMP/acme-headers" && echo yes || echo no)"
    for dir in "$WEBROOT" "$WEBROOT/.well-known" "$WEBROOT/.well-known/acme-challenge"; do
      stat -c 'ACME_PATH_MODE=%a OWNER=%U GROUP=%G PATH=%n' "$dir" || true
    done
    if command -v getenforce >/dev/null 2>&1; then
      echo "ACME_SELINUX=$(getenforce)"
    fi
    nginx -t || true
    rm -f -- "$PROBE"
    echo GLOBALSIAI_CN_ACME_CHALLENGE_HTTP_FAILED
    exit 4
  fi
done
rm -f -- "$PROBE"
echo GLOBALSIAI_CN_LOCAL_ACME_HTTP_PROBE_PASS

echo "=== 3. ZeroSSL via pinned upstream acme.sh v3.1.6 ==="
# Independent storage; never write into the existing Certbot renewal tree.
install -d -m 700 "$ACME_HOME"
install -d -m 700 "$CERTDIR"
acme_created=1
SOURCE_URL=https://raw.githubusercontent.com/acmesh-official/acme.sh/3.1.6/acme.sh
if ! curl -4fLsS --retry 3 --max-time 120 -o "$ACME_SOURCE" \
 "https://gh-proxy.com/$SOURCE_URL"; then
 curl -4fLsS --retry 3 --max-time 120 -o "$ACME_SOURCE" "$SOURCE_URL"
fi
python3 - "$ACME_SOURCE" "$ACME_BLOB" <<'PY'
import hashlib,sys
p=sys.argv[1]; wanted=sys.argv[2]
b=open(p,'rb').read()
assert len(b)>200000 and len(b)<500000, 'GLOBALSIAI_ACME_SIZE_UNEXPECTED'
actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert actual==wanted,'GLOBALSIAI_ACME_UPSTREAM_SOURCE_HASH_MISMATCH'
print("GLOBALSIAI_ACME_SH_316_SOURCE_VERIFIED")
PY
chmod 700 "$ACME_SOURCE"
sh -n "$ACME_SOURCE"
# acme.sh supports automated ZeroSSL EAB from the registration email.
# TLS verification is never bypassed.
sh "$ACME_SOURCE" --register-account --server zerossl -m 3078024889@qq.com \
 --home "$ACME_HOME"
sh "$ACME_SOURCE" --issue --server zerossl \
 -d "$DOMAIN" -d "$WWW" -w "$WEBROOT" \
 --keylength 2048 --home "$ACME_HOME"
# Install to stable files (NOT the client's mutable internal certificate paths).
install -m 600 /dev/null "$CERTDIR/privkey.pem"
install -m 644 /dev/null "$CERTDIR/fullchain.pem"
sh "$ACME_SOURCE" --install-cert --server zerossl \
 -d "$DOMAIN" --home "$ACME_HOME" \
 --key-file "$CERTDIR/privkey.pem" \
 --fullchain-file "$CERTDIR/fullchain.pem" \
 --reloadcmd "/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx"
chmod 600 "$CERTDIR/privkey.pem"
chmod 644 "$CERTDIR/fullchain.pem"
test -s "$CERTDIR/fullchain.pem" && test -s "$CERTDIR/privkey.pem"
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkend 604800 >/dev/null
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkhost "$DOMAIN" |
 grep -qi "does match"
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkhost "$WWW" |
 grep -qi "does match"
echo GLOBALSIAI_CN_ZEROSSL_CERT_HTTPS_BOTH_HOSTS_PASS

echo "=== 4. 新增专属 HTTPS 反向代理，不碰已有网站 ==="
cat >> "$VHOST" <<EOF
server {
  listen 443 ssl;
  server_name www.globalsiai.cn;
  ssl_certificate $CERTDIR/fullchain.pem;
  ssl_certificate_key $CERTDIR/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  return 301 https://globalsiai.cn\$request_uri;
}
server {
  listen 443 ssl;
  server_name globalsiai.cn;
  ssl_certificate $CERTDIR/fullchain.pem;
  ssl_certificate_key $CERTDIR/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  client_max_body_size 10m;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Robots-Tag "noindex, nofollow" always;
  location / {
    proxy_http_version 1.1;
    proxy_pass http://127.0.0.1:$PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Connection "";
    proxy_connect_timeout 5s;
    proxy_send_timeout 45s;
    proxy_read_timeout 45s;
    proxy_buffering on;
  }
}
EOF
nginx -t >/dev/null
systemctl reload nginx

echo "=== 5. 实际 HTTPS SNI、九语言、备案、301、既有服务验收 ==="
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
 code="$(curl --noproxy '*' --silent --show-error --max-time 25 \
  --resolve "$DOMAIN:443:127.0.0.1" \
  -o /dev/null -w '%{http_code}' "https://$DOMAIN$path")"
 echo "GLOBALSIAI_CN_TLS_ROUTE=$path HTTP=$code"
 test "$code" = 200 || { echo GLOBALSIAI_CN_PUBLIC_HTTPS_ROUTE_FAILED; exit 5; }
done
curl --noproxy '*' -fsS --max-time 20 \
 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" >"$TMP/cn-https"
grep -Fq '湘ICP备2026031465号-4' "$TMP/cn-https" || {
 echo GLOBALSIAI_CN_TLS_ICP_MISSING; exit 5;
}
curl --noproxy '*' -fsS --max-time 15 \
 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/robots.txt" |
 grep -qi 'Disallow: /' || { echo GLOBALSIAI_CN_TLS_NOINDEX_FAILED; exit 5; }
curl --noproxy '*' -fsSI --max-time 12 \
 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" |
 grep -qi '^x-robots-tag: noindex, nofollow' || {
 echo GLOBALSIAI_CN_TLS_INDEX_GUARD_FAILED; exit 5;
}
headers="$(curl --noproxy '*' -sS --max-time 15 -D - \
 --resolve "$WWW:443:127.0.0.1" -o /dev/null "https://$WWW/")"
grep -Eq '^HTTP/[^ ]+ 301' <<< "$headers" &&
 grep -qi '^location: https://globalsiai.cn/' <<< "$headers" || {
 echo GLOBALSIAI_CN_WWW_TLS_REDIRECT_FAILED; exit 5;
}
test "$(systemctl show -p MainPID --value lingxifield-ecs)" = "$PID_3188"
test "$(systemctl show -p MainPID --value lingxifield-cn-stage)" = "$PID_3189"
systemctl is-active --quiet globalsiai-market-stage
echo GLOBALSIAI_CN_HTTPS_9LANG_ICP_WWW_NOINDEX_3188_3189_PASS

echo "=== 6. Separate systemd timer for automated ZeroSSL certificate renewal ==="
cat > "$RENEW_UNIT" <<EOF
[Unit]
Description=Global SIAI CN ZeroSSL ACME renewal, isolated
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=root
Group=root
ExecStart=/usr/bin/sh $ACME_SOURCE --cron --home $ACME_HOME
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$ACME_HOME $CERTDIR
EOF
cat > "$RENEW_TIMER" <<'EOF'
[Unit]
Description=Global SIAI CN ZeroSSL daily renewal check

[Timer]
OnCalendar=*-*-* 05:00:00
RandomizedDelaySec=3600
Persistent=true
Unit=globalsiai-cn-zerossl-renew.service

[Install]
WantedBy=timers.target
EOF
timer_created=1
systemctl daemon-reload
systemctl enable --now globalsiai-cn-zerossl-renew.timer
systemctl is-enabled --quiet globalsiai-cn-zerossl-renew.timer
echo GLOBALSIAI_CN_ZEROSSL_AUTORENEW_TIMER_ENABLED
completed=1
trap - EXIT
rm -rf -- "$TMP"
echo GLOBALSIAI_CN_ZEROSSL_PUBLIC_HTTPS_RELEASE_ACCEPTED
echo GLOBALSIAI_CN_OLD_SITES_AND_COM_VERCEL_UNTOUCHED
echo "GLOBALSIAI_CN_URL=https://globalsiai.cn/"
