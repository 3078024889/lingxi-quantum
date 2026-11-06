#!/usr/bin/env bash
# LINGXIFIELD .cn 3189 preproduction-only atomic candidate installer.
# It NEVER changes nginx, DNS, port 3188, production env, payments or database.
set -Eeuo pipefail
umask 027
if [ "$(id -u)" != 0 ]; then echo CN_STAGE_INSTALL_REQUIRES_ROOT; exit 2; fi
if [ "$#" != 2 ]; then
  echo 'USAGE: bash ecs-cn-3189-safe-apply.sh /root/cn-ecs-standalone.tar.gz /root/cn-ecs-standalone.sha256'
  exit 2
fi
ARCHIVE="$(realpath -e -- "$1")"
CHECKSUM="$(realpath -e -- "$2")"
RELEASE=/opt/lingxifield/releases/cn-pr199
BACKUP_BASE=/opt/lingxifield/backups
SERVICE=lingxifield-cn-stage
PRODUCTION=lingxifield-ecs
STAGING_ENV=/etc/lingxifield/staging.env
test -s "$ARCHIVE"
test -s "$CHECKSUM"
test -s "$STAGING_ENV"
test ! -L "$RELEASE"
command -v tar >/dev/null
command -v python3 >/dev/null
command -v systemctl >/dev/null
id lingxifield >/dev/null
systemctl is-active --quiet "$PRODUCTION" || { echo CN_PRODUCTION_NOT_HEALTHY_ABORT; exit 3; }
test "$(systemctl show --property=WorkingDirectory --value "$SERVICE")" = "$RELEASE" || {
  echo CN_STAGE_WORKING_DIRECTORY_MISMATCH; exit 3;
}
stage_env="$(systemctl show --property=EnvironmentFiles --value "$SERVICE")"
case "$stage_env" in *"$STAGING_ENV"*) ;; *) echo CN_STAGE_USES_NONISOLATED_ENV_ABORT; exit 3;; esac
prod_work="$(systemctl show --property=WorkingDirectory --value "$PRODUCTION")"
prod_exec="$(systemctl show --property=ExecStart --value "$PRODUCTION")"
if [ "$prod_work" = "$RELEASE" ] || [[ "$prod_exec" == *"$RELEASE"* ]]; then
  echo CN_PROD_STAGE_PATH_COLLISION_ABORT; exit 3
fi
expected="$(awk 'NR==1 {print $1}' "$CHECKSUM")"
if ! [[ "$expected" =~ ^[a-fA-F0-9]{64}$ ]]; then
  echo CN_ARCHIVE_SHA256_RECORD_INVALID; exit 4
fi
actual="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
if [ "$actual" != "${expected,,}" ]; then
  echo CN_ARCHIVE_INTEGRITY_FAILED; exit 4
fi
python3 - "$ARCHIVE" <<'PY'
import sys,tarfile,posixpath
with tarfile.open(sys.argv[1],"r:gz") as tf:
    members=tf.getmembers()
    if not members or len(members)>150000: raise SystemExit("CN_ARCHIVE_MEMBERS_INVALID")
    paths=set()
    for m in members:
        name=posixpath.normpath(m.name)
        if name.startswith("/") or name.startswith("../") or name==".." or "\\" in m.name:
            raise SystemExit("CN_ARCHIVE_UNSAFE_PATH")
        paths.add(name)
        if m.isdev() or m.isfifo(): raise SystemExit("CN_ARCHIVE_SPECIAL_NODE")
        if m.issym() or m.islnk():
            if m.linkname.startswith("/"): raise SystemExit("CN_ARCHIVE_UNSAFE_LINK")
            link=posixpath.normpath(posixpath.join(posixpath.dirname(name),m.linkname))
            if link.startswith("../") or link=="..": raise SystemExit("CN_ARCHIVE_ESCAPING_LINK")
    if "server.js" not in paths or ".next" not in paths:
        raise SystemExit("CN_ARCHIVE_STANDALONE_INCOMPLETE")
print("CN_ARCHIVE_CONTENTS_VALIDATED")
PY
mem_kb="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
if (( mem_kb < 350000 )); then echo CN_MEMORY_HEADROOM_TOO_SMALL_ABORT; exit 5; fi
avail_kb="$(df -Pk /opt/lingxifield | awk 'NR==2 {print $4}')"
if (( avail_kb < 2500000 )); then echo CN_DISK_HEADROOM_TOO_SMALL_ABORT; exit 5; fi
test -d "$RELEASE" || { echo CN_STAGE_RELEASE_MISSING; exit 5; }
mkdir -p -m 750 "$BACKUP_BASE"
BACKUP="$BACKUP_BASE/cn-stage-$(date -u +%Y%m%dT%H%M%SZ)-$$"
moved=0
completed=0
restore(){
  rc=$?
  trap - EXIT
  if [ "$completed" = 0 ] && [ "$moved" = 1 ]; then
    set +e
    echo CN_STAGE_ACCEPTANCE_FAILED_ROLLING_BACK
    systemctl stop "$SERVICE" >/dev/null 2>&1
    if [ "$RELEASE" = /opt/lingxifield/releases/cn-pr199 ]; then rm -rf -- "$RELEASE"; fi
    mv -- "$BACKUP" "$RELEASE"
    systemctl start "$SERVICE"
    echo CN_STAGE_ROLLBACK_DONE_PRODUCTION_UNTOUCHED
  fi
  exit "$rc"
}
trap restore EXIT
systemctl stop "$SERVICE"
mv -- "$RELEASE" "$BACKUP"
moved=1
install -d -m 750 -o lingxifield -g lingxifield "$RELEASE"
tar --no-same-owner --no-same-permissions -xzf "$ARCHIVE" -C "$RELEASE"
# The candidate Standalone archive omits five Node probe modules because
# their imports happen in subprocesses. Add ONLY missing files from the old,
# still-working 3189 release (now moved into $BACKUP). Never overwrite any
# candidate files. All source packages are already installed on this server.
test -d "$BACKUP/node_modules" && test ! -L "$BACKUP/node_modules" || {
 echo CN_STAGE_OLD_ENGINE_DEPENDENCIES_UNAVAILABLE; exit 7;
}
test -d "$RELEASE/node_modules" && test ! -L "$RELEASE/node_modules" || {
 echo CN_STAGE_NEW_NODE_MODULES_UNAVAILABLE; exit 7;
}
echo CN_STAGE_ENGINE_MISSING_ONLY_OVERLAY_BEGIN
cp -a -n -- "$BACKUP/node_modules/." "$RELEASE/node_modules/"
chown -R lingxifield:lingxifield "$RELEASE"
python3 - "$RELEASE" <<'PY'
import os,sys
root=os.path.realpath(sys.argv[1])
for module in ["sharp","mammoth","exceljs","@mozilla/readability","dompurify","turndown"]:
 p=os.path.realpath(os.path.join(root,"node_modules",module))
 if not p.startswith(root+os.sep) or not os.path.exists(p):
  raise SystemExit("CN_STAGE_NODE_MODULE_SYMLINK_OR_MISSING_ABORT")
print("CN_STAGE_SIX_NODE_MODULE_ROOTS_LOCAL_PASS")
PY
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
test -x "$NODE"
command -v runuser >/dev/null
for module in sharp mammoth exceljs @mozilla/readability dompurify turndown; do
 if ! (cd "$RELEASE" && runuser -u lingxifield -- env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/nonexistent NODE_ENV=production "$NODE" -e 'import(process.argv[1]).then(()=>process.exit(0),()=>process.exit(3))' "$module"); then
  echo "CN_STAGE_ENGINE_IMPORT_FAILURE=$module"
  exit 7
 fi
done
echo CN_STAGE_SIX_ENGINE_IMPORTS_PASS_WITHOUT_OVERWRITING_NEW_PACKAGES
systemctl start "$SERVICE"
healthy=0
for i in $(seq 1 40); do
  code="$(curl --noproxy '*' --silent --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/health || true)"
  if [ "$code" = 200 ]; then healthy=1; break; fi
  sleep 1
done
test "$healthy" = 1 || { echo CN_STAGE_HEALTH_GATE_FAILED; exit 7; }
for route in / /tools /siai; do
  code="$(curl --noproxy '*' --silent --max-time 15 -o /dev/null -w '%{http_code}' "http://127.0.0.1:3189$route")"
  test "$code" = 200 || { echo CN_STAGE_PUBLIC_ROUTE_FAILED; exit 7; }
done
code="$(curl --noproxy '*' --silent --max-time 15 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/tools/jobs)"
test "$code" = 401 || { echo CN_STAGE_UNAUTHENTICATED_TASK_GATE_FAILED; exit 7; }
report="$(mktemp /tmp/cn-stage-engines-XXXXXX)"
if ! curl --noproxy '*' --fail --silent --max-time 30 -o "$report" http://127.0.0.1:3189/api/tools/engine/health; then
  rm -f "$report"
  echo CN_STAGE_ENGINE_GATE_UNREACHABLE; exit 7
fi
python3 - "$report" <<'PY'
import json,sys
j=json.load(open(sys.argv[1]))
n=int(j.get("summary",{}).get("available",0))
if n<6: raise SystemExit("CN_STAGE_LIGHT_ENGINE_GATE_FAILED")
print("CN_STAGE_LIGHT_ENGINE_AVAILABLE="+str(n))
PY
rm -f "$report"
systemctl is-active --quiet "$PRODUCTION" || { echo CN_3188_PRODUCTION_CHECK_FAILED; exit 8; }
systemctl is-active --quiet "$SERVICE" || { echo CN_3189_STAGE_CHECK_FAILED; exit 8; }
completed=1
trap - EXIT
echo "CN_3189_CANDIDATE_VALIDATED_PRODUCTION_3188_UNCHANGED"
echo "CN_3189_ROLLBACK_BACKUP=$BACKUP"
