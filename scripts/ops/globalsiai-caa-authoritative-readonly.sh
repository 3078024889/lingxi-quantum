#!/usr/bin/env bash
# Read-only direct-authority DNS tests (no DNS edits, no Certbot requests).
set -uo pipefail
if [ "$#" != 1 ] || [ "$1" != "--read-only" ]; then
 echo "GLOBALSIAI_CAA_USAGE: bash script --read-only"
 exit 2
fi
command -v dig >/dev/null || { echo GLOBALSIAI_CAA_DIG_MISSING; exit 3; }
pass=0
fail=0
echo GLOBALSIAI_AUTH_CAA_DIAGNOSTIC=20261106_EXPLICIT_LE_ISSUE_GATE
for ns in dns1.hichina.com dns2.hichina.com; do
 for proto in udp tcp; do
  for host in globalsiai.cn www.globalsiai.cn; do
   for rr in CAA A; do
    if [ "$rr" = CAA ]; then attempts=6; else attempts=2; fi
    for attempt in $(seq 1 "$attempts"); do
     if [ "$proto" = tcp ]; then
      result="$(dig "@$ns" "$host" "$rr" +tcp +norecurse +time=4 +tries=1 +noall +comments +answer +authority 2>&1)" || true
     else
      result="$(dig "@$ns" "$host" "$rr" +norecurse +time=4 +tries=1 +noall +comments +answer +authority 2>&1)" || true
     fi
     status="$(printf '%s\n' "$result" | sed -n 's/.*status: \([A-Z0-9]*\),.*/\1/p' | head -n 1)"
     auth="$(printf '%s\n' "$result" | grep -E 'flags:.*[; ]aa[; ]' | head -n 1 || true)"
     if [ -z "$status" ]; then status=TIMEOUT_OR_NO_RESPONSE; fi
     answers="$(printf '%s\n' "$result" | awk '$1 !~ /^;/ && $2 ~ /^[0-9]+$/ && $4=="A" {print $5}' | sort -u | paste -sd, -)"
     state=FAIL
     if [ "$status" = NOERROR ] && [ -n "$auth" ]; then
      if [ "$rr" = A ]; then
       [ "$answers" = 39.104.205.16 ] && state=PASS
      elif [ "$host" = globalsiai.cn ]; then
       if printf '%s\n' "$result" | grep -Fq '0 issue "letsencrypt.org"'; then
        state=PASS
       else
        state=FAIL_CAA_MISSING_OR_STALE
       fi
      else
       # www can inherit apex CAA when it has no local RRset.
       state=PASS
      fi
     fi
     if [ "$state" = PASS ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
     if [ -z "$answers" ]; then answers=-; fi
     printf 'AUTH_QUERY NS=%s PROTO=%s HOST=%s RR=%s ATTEMPT=%s RCODE=%s AA=%s A=%s RESULT=%s\n' \
      "$ns" "$proto" "$host" "$rr" "$attempt" "$status" \
      "$([ -n "$auth" ] && echo yes || echo no)" "$answers" "$state"
    done
   done
  done
 done
done
echo '=== Delegation and DS reference ==='
for rr in NS DS; do
 r="$(dig @1.1.1.1 globalsiai.cn "$rr" +time=5 +tries=1 +noall +comments +answer 2>&1)" || true
 status="$(printf '%s\n' "$r" | sed -n 's/.*status: \([A-Z0-9]*\),.*/\1/p' | head -n 1)"
 echo "RECURSIVE_$rr=$status"
 printf '%s\n' "$r" | awk '$1 !~ /^;/ && NF>=5 {print "RECURSIVE_RECORD=" $1 " " $4 " " $5}'
done
echo "GLOBALSIAI_AUTH_PASS=$pass FAIL=$fail"
if [ "$fail" -gt 0 ]; then
 echo GLOBALSIAI_AUTH_DNS_CONSISTENCY=FAIL
 echo GLOBALSIAI_CERTBOT_RETRY=BLOCKED
else
 echo GLOBALSIAI_AUTH_CAA_ISSUE_LETSENCRYPT=CONFIRMED_BOTH_NS_TCP_AND_UDP
 echo GLOBALSIAI_CERTBOT_RETRY=NOT_AUTHORIZED_FROM_THIS_TEST_ALONE
fi
echo GLOBALSIAI_AUTH_DNS_READ_ONLY_COMPLETE
