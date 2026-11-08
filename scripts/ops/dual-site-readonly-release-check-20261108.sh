#!/usr/bin/env bash
# LINGXIFIELD dual-host release readiness. Read-only: GET/HEAD only.
# Run from GitHub Actions; never prints tokens or protected responses.
set -uo pipefail
failures=0
probe() {
  local host="$1" path="$2" expected="$3" status
  status="$(curl -4 -sS --connect-timeout 8 --max-time 22 --retry 1 --retry-delay 1 \
    -A 'LINGXIFIELD-readonly-20261108/1.0' -H 'Cache-Control: no-cache' \
    -o /dev/null -w '%{http_code}' "https://$host$path" 2>/dev/null)" || status=000
  echo "DUAL_PUBLIC $host$path HTTP_$status EXPECT=$expected"
  case ",$expected," in
    *",$status,"*) ;;
    *) failures=$((failures+1));;
  esac
}
for host in lingxifield.cn lingxifield.com; do
  probe "$host" / 200
  probe "$host" /tools 200
  probe "$host" /siai 200
  probe "$host" /sasi 200
  probe "$host" /sasi/marketplace 200
  probe "$host" /tools/pass 200
  probe "$host" /announcements 200
  probe "$host" /api/health 200
  probe "$host" /api/tools/pass 200
  probe "$host" /api/pay/providers 200
  probe "$host" /api/sasi/account 401,403
  probe "$host" /api/tools/jobs 401,403
done
echo "DUAL_PUBLIC_FAILURES=$failures"
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo 'CLOUDFLARE_READONLY_CHECK_UNAVAILABLE_SECRETS_MISSING'
  failures=$((failures+1))
else
  # Uses documented Cloudflare account GET APIs, never modifying Workers or R2.
  workers="$(curl -fsS --connect-timeout 8 --max-time 25 \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts" 2>/dev/null)" || workers=''
  if [[ -z "$workers" ]] || ! jq -e '.success == true' <<< "$workers" >/dev/null 2>&1; then
    echo 'CF_WORKERS_LIST_UNAVAILABLE_OR_PERMISSION_DENIED'
    failures=$((failures+1))
  else
    for name in lingxifield-main-global-testonly lingxifield-com-admin-facade; do
      if jq -e --arg name "$name" '[.result[]? | select(.id == $name)] | length > 0' <<< "$workers" >/dev/null; then
        echo "CF_WORKER_PRESENT $name"
      else
        echo "CF_WORKER_NOT_PRESENT $name"
        failures=$((failures+1))
      fi
    done
  fi
  buckets="$(curl -fsS --connect-timeout 8 --max-time 25 \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets" 2>/dev/null)" || buckets=''
  if [[ -z "$buckets" ]] || ! jq -e '.success == true' <<< "$buckets" >/dev/null 2>&1; then
    echo 'CF_R2_LIST_UNAVAILABLE_OR_PERMISSION_DENIED'
    failures=$((failures+1))
  elif jq -e '[.result.buckets[]? | select(.name == "lingxifield-com-large-public")] | length > 0' <<< "$buckets" >/dev/null; then
    echo 'CF_R2_PUBLIC_LARGE_BUCKET_PRESENT_OBJECT_SHA_NOT_YET_ATTESTED'
  else
    echo 'CF_R2_PUBLIC_LARGE_BUCKET_MISSING'
    failures=$((failures+1))
  fi
fi
echo "DUAL_RELEASE_READONLY_FAILURES=$failures"
test "$failures" -eq 0
