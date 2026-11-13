#!/usr/bin/env bash
# Read-only: no real emails/passwords, secrets, service changes, or user data.
set -Eeuo pipefail
if [ "$#" -ne 1 ] || [ "$1" != "--read-only" ]; then
 echo CN_MEMORY_AUTH_DIAG_USAGE; exit 2
fi
echo '=== MEMORY AND CGROUP ==='
awk '/^(MemTotal|MemAvailable|SwapTotal|SwapFree):/ {print $1,$2,"kB"}' /proc/meminfo
for p in memory.max memory.current memory.swap.max memory.swap.current; do
 if [ -r "/sys/fs/cgroup/$p" ]; then echo "$p=$(cat "/sys/fs/cgroup/$p")"; fi
done
for svc in lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage nginx; do
 status="$(systemctl is-active "$svc" || true)"
 memory="$(systemctl show "$svc" -p MemoryCurrent --value 2>/dev/null || true)"
 echo "SERVICE=$svc STATE=$status MEMORY_BYTES=$memory"
done
echo '=== ENV NAME PRESENCE ONLY: MAIN AND CHILD PROCESSES ==='
python3 - <<'PY'
import os,subprocess
for svc in ('lingxifield-ecs','lingxifield-cn-stage'):
    main=subprocess.run(['systemctl','show',svc,'-p','MainPID','--value'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,universal_newlines=True).stdout.strip()
    if not main.isdecimal() or main=='0':
        print(f'SERVICE={svc} MAIN_PID_UNAVAILABLE');continue
    todo=[int(main)];seen=set()
    while todo and len(seen)<15:
        pid=todo.pop(0)
        if pid in seen:continue
        seen.add(pid)
        try:
            comm=open(f'/proc/{pid}/comm').read().strip()
            keys={v.partition(b'=')[0].decode('utf-8','replace') for v in open(f'/proc/{pid}/environ','rb').read().split(b'\0')}
            flags={k:('YES' if k in keys else 'NO') for k in ('NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','RESEND_API_KEY','SUPABASE_SERVICE_ROLE_KEY')}
            print('AUTH_PROCESS SERVICE='+svc+' PID='+str(pid)+' COMM='+comm+' '+' '.join(f'{k}={v}' for k,v in flags.items()))
            children=open(f'/proc/{pid}/task/{pid}/children').read().split()
            todo.extend(int(c) for c in children if c.isdecimal())
        except OSError:
            print(f'AUTH_PROCESS SERVICE={svc} PID={pid} UNREADABLE')
PY
echo '=== ONE SYNTHETIC NONEXISTENT LOGIN PER PORT ==='
for port in 3188 3189; do
 headers="$(curl --noproxy '*' --silent --show-error --max-time 25 -o /dev/null -D - -X POST \
    -H 'Host: lingxifield.cn' -H 'X-Forwarded-Host: lingxifield.cn' \
    -H 'X-Forwarded-Proto: https' -H 'Origin: https://lingxifield.cn' \
    -H 'Sec-Fetch-Site: same-origin' \
    --data-urlencode 'mode=signin' \
    --data-urlencode 'email=auth-check-20261106@invalid.example' \
    --data-urlencode 'password=DeliberatelyInvalidPassword2026' \
    "http://127.0.0.1:$port/account/auth" || true)"
 status="$(printf '%s\n' "$headers" | head -1 | tr -d '\r')"
 location="$(printf '%s\n' "$headers" | grep -i '^location:' | head -1 | tr -d '\r' || true)"
 case "$location" in
    *auth_error=credentials*) result=INVALID_CREDENTIALS_SUPABASE_REACHED;;
    *auth_error=service*) result=SERVICE_OR_AUTH_CONFIG_FAILED;;
    *auth_error=origin*) result=ORIGIN_GATE_FAILED;;
    *auth_error=*) result=OTHER_AUTH_ERROR;;
    *) result=NO_AUTH_REDIRECT;;
 esac
 echo "AUTH_SYNTHETIC PORT=$port STATUS=$status RESULT=$result"
done
echo CN_MEMORY_AUTH_DIAG_READ_ONLY_COMPLETE
