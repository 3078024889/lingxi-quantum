#!/usr/bin/env bash
# LINGXIFIELD .com: isolated HTTP->TLS->local Next.js, no DNS/secrets changes.
set -Eeuo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
MODE="$1"
CONF=/etc/nginx/conf.d/lingxifield-com.conf
ACME=/var/www/lingxifield-com-acme
CERT=/etc/letsencrypt/live/lingxifield.com/fullchain.pem
KEY=/etc/letsencrypt/live/lingxifield.com/privkey.pem
BACKUP="/root/lingxifield-com-nginx-$(date +%Y%m%d-%H%M%S)-$$.bak"
[[ "$EUID" == 0 ]] || { echo RUN_AS_ROOT; exit 1; }
case "$MODE" in --status|--stage-http|--activate-https) ;; *) echo "Use --status"; exit 2;; esac
# lingxifield.com has no ICP registration. Do not deploy this public domain
# to a mainland ECS, even through a CDN reverse proxy. Status remains read-only.
if [[ "$MODE" != --status ]]; then
  echo "COM_MAINLAND_ECS_DEPLOYMENT_BLOCKED_NO_ICP"
  echo "Use a real non-mainland Cloudflare Workers deployment for the .com origin."
  exit 78
fi
if [[ "$MODE" == --status ]]; then
  echo '=== Active origin ==='
  systemctl is-active lingxifield-ecs || true
  curl --noproxy '*' --max-time 10 -sS -o /dev/null -w 'ORIGIN_HTTP=%{http_code}\n' -H 'Host: lingxifield.com' http://127.0.0.1:3188/ || true
  echo '=== Public DNS (may be Cloudflare proxy IP) ==='
  for domain in lingxifield.com www.lingxifield.com; do
    echo "$domain"
    getent ahostsv4 "$domain" | awk '{print $1}' | sort -u || true
  done
  echo '=== Certificate ==='
  [[ -s "$CERT" && -s "$KEY" ]] && echo COM_CERT_EXISTS || echo COM_CERT_MISSING
  echo '=== Existing Nginx server names ==='
  nginx -T 2>/dev/null | grep -E '^[[:space:]]*server_name[[:space:]].*lingxifield[.]com' || true
  echo '=== Certbot ==='
  command -v certbot || true
  exit 0
fi
systemctl is-active --quiet lingxifield-ecs
curl --noproxy '*' --max-time 12 -fsS -o /dev/null -H 'Host: lingxifield.com' http://127.0.0.1:3188/
if [[ "$MODE" == --stage-http ]]; then
  [[ ! -e "$CONF" ]] || { echo COM_CONF_EXISTS_ABORT; exit 1; }
  if nginx -T 2>/dev/null | grep -Eq '^[[:space:]]*server_name[[:space:]].*lingxifield[.]com'; then
    echo COM_EXISTING_VHOST_ABORT
    exit 1
  fi
else
  [[ -f "$CONF" ]] || { echo COM_HTTP_STAGE_REQUIRED; exit 1; }
  grep -q 'LINGXI_COM_HTTP_ACME_V1' "$CONF"
  [[ -s "$CERT" && -s "$KEY" ]] || { echo COM_CERT_MISSING; exit 1; }
  for domain in lingxifield.com www.lingxifield.com; do
    openssl x509 -in "$CERT" -noout -checkhost "$domain" | grep -q 'does match' || { echo "CERT_INVALID_FOR_$domain"; exit 1; }
  done
fi
had_original=0
[[ -e "$CONF" ]] && { cp -a "$CONF" "$BACKUP"; had_original=1; }
changed=0
rollback() {
  code=$?
  if [[ "$code" -ne 0 && "$changed" == 1 ]]; then
    if [[ "$had_original" == 1 ]]; then cp -a "$BACKUP" "$CONF"; else rm -f "$CONF"; fi
    echo COM_CONFIG_ROLLBACK
    nginx -t && systemctl reload nginx || true
  fi
}
trap rollback EXIT
install -d -m 755 "$ACME/.well-known/acme-challenge"
cat > "$CONF" <<'NGINX'
# LINGXI_COM_HTTP_ACME_V1
server {
    listen 80;
    server_name lingxifield.com www.lingxifield.com;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/lingxifield-com-acme;
        default_type text/plain;
        try_files $uri =404;
    }
    location / { return 301 https://$host$request_uri; }
}
NGINX
if [[ "$MODE" == --activate-https ]]; then
cat >> "$CONF" <<'NGINX'
# LINGXI_COM_HTTPS_ECS_V1
server {
    listen 443 ssl;
    server_name lingxifield.com www.lingxifield.com;
    ssl_certificate /etc/letsencrypt/live/lingxifield.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lingxifield.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 100m;
    location / {
        proxy_pass http://127.0.0.1:3188;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Lingxi-Public-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 10s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        add_header X-Lingxi-Origin "ecs-com-3188" always;
    }
}
NGINX
fi
changed=1
nginx -t
systemctl reload nginx
if [[ "$MODE" == --activate-https ]]; then
  for path in / /tools /siai /api/health; do
    verified=0
    for i in $(seq 1 15); do
      h=$(mktemp)
      code=$(curl --noproxy '*' --resolve lingxifield.com:443:127.0.0.1 --max-time 12 --silent --show-error -D "$h" -o /dev/null -w '%{http_code}' "https://lingxifield.com$path" || true)
      if [[ "$code" == 200 ]] && grep -iq '^x-lingxi-origin: ecs-com-3188' "$h"; then
        verified=1
        rm -f "$h"
        break
      fi
      rm -f "$h"
      sleep 2
    done
    echo "$path HTTP_$code"
    [[ "$verified" == 1 ]] || { echo COM_HTTPS_CHECK_FAILED; exit 1; }
  done
  echo LINGXIFIELD_COM_LOCAL_HTTPS_SUCCESS
else
  echo COM_HTTP_ACME_READY
  echo 'Once both DNS records point to ECS, issue certificate with:'
  echo 'certbot certonly --webroot -w /var/www/lingxifield-com-acme -d lingxifield.com -d www.lingxifield.com'
  echo 'Then execute this script with --activate-https'
fi
trap - EXIT
