#!/usr/bin/env bash
# Read-only ECS -> ACME CA connectivity diagnostic. Never issues certificates,
# edits services, logs proxy values or exposes any site secrets.
set -uo pipefail
if [ "$#" -ne 1 ] || [ "$1" != "--read-only" ]; then
  echo GLOBALSIAI_ACME_EGRESS_USAGE
  exit 2
fi
command -v curl >/dev/null || { echo GLOBALSIAI_CURL_MISSING; exit 2; }
echo GLOBALSIAI_ACME_OUTBOUND_DIAG_20261106
echo "=== Proxy configuration: presence only (values NOT printed) ==="
for key in HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY http_proxy https_proxy all_proxy no_proxy; do
 if printenv "$key" >/dev/null 2>&1; then
  echo "PROXY_ENV_NAME_PRESENT=$key"
 fi
done

echo "=== Compare IPv4 direct, IPv6 direct, and inherited proxy paths ==="
# GET /directory is read-only. No nonce/new-order is requested.
destinations=(
 "LE_PRODUCTION|https://acme-v02.api.letsencrypt.org/directory"
 "LE_STAGING|https://acme-staging-v02.api.letsencrypt.org/directory"
 "ZEROSSL|https://acme.zerossl.com/v2/DV90"
)
le4ok=0
les4ok=0
zero4ok=0
for item in ${destinations[@]}; do
 label="${item%%|*}"
 url="${item#*|}"
 for method in IPv4_DIRECT IPv6_DIRECT DEFAULT_ENV; do
  for attempt in 1 2; do
   flags=()
   case "$method" in
    IPv4_DIRECT) flags=(-4 --noproxy '*') ;;
    IPv6_DIRECT) flags=(-6 --noproxy '*') ;;
    DEFAULT_ENV) flags=(-4) ;;
   esac
   metrics="$(curl "${flags[@]}" -sS --retry 0 --connect-timeout 6 --max-time 16 \
    -H 'Accept: application/json' -o /dev/null \
    -w '%{http_code},%{remote_ip},%{time_namelookup},%{time_connect},%{time_appconnect},%{time_starttransfer}' \
    "$url" 2>/dev/null)"
   rc=$?
   IFS=, read -r http ip dns connect tls firstbyte <<< "$metrics"
   if [ -z "$http" ]; then http=000; fi
   if [ -z "$ip" ]; then ip=-; fi
   if [ -z "$dns" ]; then dns=-; fi
   if [ -z "$connect" ]; then connect=-; fi
   if [ -z "$tls" ]; then tls=-; fi
   if [ -z "$firstbyte" ]; then firstbyte=-; fi
   echo "ACME_EGRESS CA=$label METHOD=$method ATTEMPT=$attempt RC=$rc HTTP=$http IP=$ip DNS_S=$dns TCP_S=$connect TLS_S=$tls FIRST_BYTE_S=$firstbyte"
   if [ "$rc" -eq 0 ] && [ "$http" = 200 ]; then
    if [ "$label" = LE_PRODUCTION ] && [ "$method" = IPv4_DIRECT ]; then le4ok=$((le4ok+1)); fi
    if [ "$label" = LE_STAGING ] && [ "$method" = IPv4_DIRECT ]; then les4ok=$((les4ok+1)); fi
    if [ "$label" = ZEROSSL ] && [ "$method" = IPv4_DIRECT ]; then zero4ok=$((zero4ok+1)); fi
   fi
  done
 done
done
echo "ACME_LE_PRODUCTION_DIRECT_IPV4_SUCCESS_COUNT=$le4ok"
echo "ACME_LE_STAGING_DIRECT_IPV4_SUCCESS_COUNT=$les4ok"
echo "ACME_ZEROSSL_DIRECT_IPV4_SUCCESS_COUNT=$zero4ok"
echo "=== Python requests path used by Certbot (read only) ==="
python3 - <<'PY'
try:
    import requests
except ImportError:
    print("ACME_PYTHON_REQUESTS=UNAVAILABLE_WITH_THIS_PYTHON")
else:
    endpoint = "https://acme-v02.api.letsencrypt.org/directory"
    for trust in (False, True):
        session = requests.Session()
        session.trust_env = trust
        try:
            response = session.get(endpoint, timeout=(6, 15))
            print("ACME_REQUESTS TRUST_PROXY_ENV="+str(trust)
                  +" HTTP="+str(response.status_code)
                  +" BODY_BYTES="+str(len(response.content)))
        except requests.RequestException as exc:
            print("ACME_REQUESTS TRUST_PROXY_ENV="+str(trust)
                  +" ERROR_TYPE="+type(exc).__name__)
        finally:
            session.close()
PY
echo GLOBALSIAI_ACME_OUTBOUND_DIAG_READ_ONLY_COMPLETE
if [ "$le4ok" -eq 0 ] && [ "$les4ok" -eq 0 ]; then
 echo GLOBALSIAI_ACME_ISSUANCE_PRECHECK=BLOCKED_EGRESS_TO_LE
else
 echo GLOBALSIAI_ACME_ISSUANCE_PRECHECK=PARTIAL_CONNECTIVITY_PROVEN
 echo GLOBALSIAI_ACME_ISSUANCE_PRECHECK_NOTE=DIRECTORY_GET_DOES_NOT_GUARANTEE_CA_ORDER_POST
fi
