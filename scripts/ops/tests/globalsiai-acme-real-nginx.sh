#!/usr/bin/env bash
# Real HTTP-01 file mapping check in an isolated unprivileged nginx on 18080.
# Reads the exact public-cutover HTTP server heredoc. No production writes.
set -Eeuo pipefail
if [ "$#" != 1 ]; then echo GLOBALSIAI_ACME_FIXTURE_USAGE; exit 2; fi
case "$1" in
  cn) domain=globalsiai.cn ;;
  com) domain=globalsiai.com ;;
  *) echo GLOBALSIAI_ACME_FIXTURE_USAGE; exit 2 ;;
esac
root="$(mktemp -d)"
cleanup(){
  nginx -s stop -c "$root/nginx.conf" -p "$root/" >/dev/null 2>&1 || true
  if [ -f "$root/nginx.pid" ]; then kill "$(cat "$root/nginx.pid")" 2>/dev/null || true; fi
  rm -rf -- "$root"
}
trap cleanup EXIT
mkdir -p "$root/acme/.well-known/acme-challenge"
chmod 755 "$root" "$root/acme" "$root/acme/.well-known" "$root/acme/.well-known/acme-challenge"
printf 'GLOBALSIAI-ACME-FIXTURE\n' >"$root/acme/.well-known/acme-challenge/probe"
chmod 644 "$root/acme/.well-known/acme-challenge/probe"
python3 - "$root" "$domain" <<'PY'
import pathlib,re,sys
tmp=pathlib.Path(sys.argv[1])
domain=sys.argv[2]
path=pathlib.Path('scripts/ops/globalsiai-ecs-'+('cn' if domain.endswith('.cn') else 'com')+'-public-cutover.sh')
src=path.read_text()
match=re.search(r'cat >"\$VHOST" <<EOF\n(.*?)\nEOF',src,re.S)
assert match, 'ACME_SERVER_HEREDOC_MISSING'
body=match.group(1)
body=body.replace('$WEBROOT',str(tmp/'acme'))
body=body.replace('$DOMAIN',domain)
body=body.replace('\\$','$')
body=body.replace('listen 80;','listen 127.0.0.1:18080;')
assert f'X-Globalsiai-Acme-Vhost {domain}' in body, 'ACME_VHOST_HEADER_MISSING'
assert 'location ^~ /.well-known/acme-challenge/' in body
assert 'try_files $uri =404;' in body
(tmp/'site.conf').write_text(body)
(tmp/'nginx.conf').write_text(
 f'pid {tmp}/nginx.pid;\n'
 f'error_log {tmp}/error.log info;\n'
 'worker_processes 1;\n'
 'events { worker_connections 64; }\n'
 f'http {{ access_log {tmp}/access.log; include {tmp}/site.conf; }}\n'
)
PY
nginx -t -c "$root/nginx.conf" -p "$root/"
nginx -c "$root/nginx.conf" -p "$root/"
for name in "$domain" "www.$domain"; do
  ok=0
  for i in $(seq 1 10); do
    code="$(curl --noproxy '*' -sS --max-time 3 \
      --resolve "$name:18080:127.0.0.1" \
      -D "$root/headers" -o "$root/body" -w '%{http_code}' \
      "http://$name:18080/.well-known/acme-challenge/probe" || true)"
    if [ "$code" = 200 ] && \
       grep -Fxq 'GLOBALSIAI-ACME-FIXTURE' "$root/body" && \
       grep -Fqi "X-Globalsiai-Acme-Vhost: $domain" "$root/headers"; then
      ok=1
      break
    fi
    sleep 1
  done
  if [ "$ok" != 1 ]; then
    echo "GLOBALSIAI_ACME_REAL_HTTP_FAIL_DOMAIN=$name HTTP=$code"
    tail -n 18 "$root/error.log" || true
    exit 1
  fi
  echo "GLOBALSIAI_ACME_REAL_HTTP_PASS_DOMAIN=$name"
done
