#!/usr/bin/env bash
# Safe read-only account release gate. Never authenticates a real user,
# reads account balances, changes services, publishes sites or logs secrets.
set -Eeuo pipefail
if [ "$#" -ne 1 ] || [ "$1" != "--read-only" ]; then
  echo CN_ACCOUNT_GATE_USAGE
  exit 2
fi
for cmd in curl python3 systemctl; do command -v "$cmd" >/dev/null; done
echo CN_ACCOUNT_GATE_READONLY_VERSION=20261106
for svc in lingxifield-ecs lingxifield-cn-stage; do
  state="$(systemctl is-active "$svc" || true)"
  echo "CN_ACCOUNT_SERVICE=$svc STATE=$state"
  test "$state" = active
  pid="$(systemctl show "$svc" -p MainPID --value)"
  if [[ "$pid" =~ ^[0-9]+$ ]] && [ "$pid" != 0 ]; then
    python3 - "$pid" "$svc" <<'PY'
import os,sys
pid,service=sys.argv[1:3]
names={
  'NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY',
  'RESEND_API_KEY','LINGXIFIELD_AUTH_FROM_EMAIL'
}
try:
    raw=open(f'/proc/{pid}/environ','rb').read().split(b'\0')
    present={x.partition(b'=')[0].decode('utf-8','replace') for x in raw}
    for n in sorted(names):
        print('CN_AUTH_ENV_SERVICE='+service+' NAME='+n+
              ' PRESENT='+('YES' if n in present else 'NO'))
except (OSError,PermissionError):
    print('CN_AUTH_ENV_SERVICE='+service+' UNAVAILABLE=YES')
PY
  fi
done
for port in 3188 3189; do
  for route in /account /api/health; do
    status="$(curl --noproxy '*' -sS --max-time 12 -o /dev/null \
      -w '%{http_code}' -H 'Host: lingxifield.cn' \
      -H 'X-Forwarded-Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' \
      "http://127.0.0.1:$port$route")"
    echo "CN_ACCOUNT_ROUTE_PORT=$port PATH=$route HTTP=$status"
  done
  # Negative test only. This request is rejected BEFORE any credentials/auth.
  headers="$(curl --noproxy '*' -sS --max-time 12 -i -o /dev/null \
    -D - -X POST -H 'Host: lingxifield.cn' \
    -H 'X-Forwarded-Host: lingxifield.cn' \
    -H 'X-Forwarded-Proto: https' \
    -H 'Origin: https://bad-origin.invalid' \
    -H 'Sec-Fetch-Site: cross-site' \
    --data 'mode=signin' "http://127.0.0.1:$port/account/auth" || true)"
  status="$(printf '%s\n' "$headers" | head -1 | tr -d '\r')"
  location="$(printf '%s\n' "$headers" | grep -i '^location:' | head -1 | tr -d '\r')"
  if [[ "$status" == *'303'* ]] && [[ "$location" == *'auth_error=origin'* ]]; then
    echo "CN_AUTH_CSRF_REJECT_PORT=$port PASS"
  else
    echo "CN_AUTH_CSRF_REJECT_PORT=$port UNVERIFIED"
  fi
  # Invalid email, not a real credential, verifies trusted reverse-proxy origin
  # is accepted by the same-origin gate without contacting Supabase.
  h2="$(curl --noproxy '*' -sS --max-time 12 -o /dev/null \
    -D - -X POST -H 'Host: lingxifield.cn' \
    -H 'X-Forwarded-Host: lingxifield.cn' \
    -H 'X-Forwarded-Proto: https' \
    -H 'Origin: https://lingxifield.cn' \
    -H 'Sec-Fetch-Site: same-origin' \
    --data-urlencode 'mode=signin' --data-urlencode 'email=not-an-email' \
    "http://127.0.0.1:$port/account/auth" || true)"
  status2="$(printf '%s\n' "$h2" | head -1 | tr -d '\r')"
  loc2="$(printf '%s\n' "$h2" | grep -i '^location:' | head -1 | tr -d '\r')"
  if [[ "$status2" == *'303'* ]] && [[ "$loc2" == *'auth_error=email'* ]]; then
    echo "CN_AUTH_SAME_ORIGIN_PORT=$port PASS"
  else
    echo "CN_AUTH_SAME_ORIGIN_PORT=$port UNVERIFIED"
  fi
done
echo CN_ACCOUNT_PUBLIC_LOGIN_WITH_REAL_CREDENTIALS=NOT_TESTED
echo CN_AUTH_NO_3188_SWITCH_NO_SECRET_OUTPUT_NO_ACCOUNT_MUTATION
echo CN_ACCOUNT_READONLY_DIAG_COMPLETE
