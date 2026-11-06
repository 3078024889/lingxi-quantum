#!/usr/bin/env bash
# Publish globalsiai.cn only, preserving all existing production services.
set -Eeuo pipefail
umask 077
if [ "$#" != 1 ] || [ "$1" != "--publish-globalsiai-cn-only" ] || [ "$(id -u)" != 0 ]; then
  echo "GLOBALSIAI_CN_PUBLIC_USAGE: bash script --publish-globalsiai-cn-only (root)"
  exit 2
fi
DOMAIN=globalsiai.cn
WWW=www.globalsiai.cn
ECS_IP=39.104.205.16
PORT=4289
VHOST=/etc/nginx/conf.d/98-globalsiai-cn-only.conf
WEBROOT=/var/www/globalsiai-acme
CERTDIR=/etc/letsencrypt/live/globalsiai.cn
HOOK=/etc/letsencrypt/renewal-hooks/deploy/98-globalsiai-cn-nginx.sh
TMP="$(mktemp -d /tmp/globalsiai-cn-public-XXXXXX)"
installed=0
hook_installed=0
completed=0
rollback(){
 rc=$?
 trap - EXIT
 rm -rf -- "$TMP"
 if [ "$rc" -ne 0 ] && [ "$completed" -eq 0 ]; then
   echo GLOBALSIAI_CN_CUTOVER_FAILED_ROLLBACK_START
   if [ "$hook_installed" -eq 1 ]; then rm -f -- "$HOOK"; fi
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
exec 9>/run/lock/globalsiai-cn-public.lock
flock -n 9 || { echo GLOBALSIAI_CN_CONCURRENT_CUTOVER_ABORT; exit 3; }

echo "=== 1. 私有站与DNS只读发布门禁 ==="
for svc in lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage nginx; do
 systemctl is-active --quiet "$svc"
done
command -v certbot >/dev/null
command -v openssl >/dev/null
test ! -e "$VHOST" && test ! -L "$VHOST" || {
 echo GLOBALSIAI_CN_EXISTING_SITE_CONFIG_ABORT; exit 3;
}
test ! -e "$HOOK" && test ! -L "$HOOK" || {
 echo GLOBALSIAI_CN_EXISTING_RENEW_HOOK_ABORT; exit 3;
}
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
cat >"$VHOST" <<EOF
# LINGXIFIELD globalsiai.cn: owned independent virtual host only
server {
  listen 80;
  server_name globalsiai.cn www.globalsiai.cn;
  location ^~ /.well-known/acme-challenge/ {
    root $WEBROOT;
    default_type text/plain;
    try_files \$uri =404;
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
test "$(curl --noproxy '*' -fsS --max-time 10 \
 --resolve "$DOMAIN:80:127.0.0.1" \
 "http://$DOMAIN/.well-known/acme-challenge/$(basename "$PROBE")")" = "GLOBALSIAI-PROBE-$$" || {
 rm -f -- "$PROBE"
 echo GLOBALSIAI_CN_ACME_CHALLENGE_HTTP_FAILED; exit 4;
}
rm -f -- "$PROBE"
echo GLOBALSIAI_CN_LOCAL_ACME_HTTP_PROBE_PASS

echo "=== 3. 仅申请两个 .cn 域名的正式 HTTPS 证书 ==="
certbot certonly --webroot --webroot-path "$WEBROOT" \
 --cert-name "$DOMAIN" -d "$DOMAIN" -d "$WWW" \
 --email 3078024889@qq.com \
 --non-interactive --agree-tos --keep-until-expiring
test -s "$CERTDIR/fullchain.pem" && test -s "$CERTDIR/privkey.pem"
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkend 604800 >/dev/null
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkhost "$DOMAIN" | grep -qi 'does match'
openssl x509 -in "$CERTDIR/fullchain.pem" -noout -checkhost "$WWW" | grep -qi 'does match'
echo GLOBALSIAI_CN_CERT_HTTPS_BOTH_HOSTS_PASS

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

echo "=== 6. HTTPS 证书续期自动安全重载 ==="
install -d -m 755 "$(dirname "$HOOK")"
cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
if [ "${RENEWED_LINEAGE:-}" = "/etc/letsencrypt/live/globalsiai.cn" ]; then
 /usr/sbin/nginx -t >/dev/null
 /usr/bin/systemctl reload nginx
fi
EOF
chmod 755 "$HOOK"
hook_installed=1
completed=1
trap - EXIT
rm -rf -- "$TMP"
echo GLOBALSIAI_CN_PUBLIC_HTTPS_RELEASE_ACCEPTED
echo GLOBALSIAI_CN_OLD_SITES_AND_COM_VERCEL_UNTOUCHED
echo "GLOBALSIAI_CN_URL=https://globalsiai.cn/"
