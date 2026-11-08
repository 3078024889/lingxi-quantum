#!/usr/bin/env python3
"""Restore the currently-live CN 3191 release's admin database reads.

Use: sudo python3 script.py --plan, then --apply.
The active 86b956c release reads SUPABASE_SERVICE_ROLE_KEY, while a new
verified sb_secret_ key was saved in /etc/lingxifield/production.env.
Keep the original standalone runtime, files, Nginx, Supabase rows and funds.
Fail closed on unknown service/port/environment; restart only the live 3191
service; preserve a rollback copy and restore on failed health checks.
Never print keys, emails, database rows or systemd Environment values.
"""
import fcntl
import json
import os
import pathlib
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from urllib.parse import urlsplit

SERVICE = "lingxifield-cn-release-86b956c9700e"
RELEASE = "86b956c9700ede4a537c021af3a0dc1df825fa9b"
SOURCE = pathlib.Path("/etc/lingxifield/production.env")
SUPABASE = "https://sxsgdpqojepgbbrxrzlq.supabase.co"
LOCK = pathlib.Path("/run/lock/lingxifield-cn3191-admin-hotfix.lock")
KEY_PATTERN = re.compile(r"^sb_secret_[A-Za-z0-9_-]{12,}$")


def abort(message):
    raise RuntimeError(message)


def run(*args, timeout=20):
    result = subprocess.run(args, universal_newlines=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout, check=False)
    if result.returncode != 0:
        abort("COMMAND_FAILED:" + args[0] + ":" + args[1] if len(args)>1 else args[0])
    return result.stdout.strip()


def value(text, name):
    matches = []
    for line in text.splitlines():
        if re.match(r"^\s*(?:export\s+)?" + re.escape(name) + r"\s*=", line):
            matches.append(line.split("=", 1)[1].strip().strip('"').strip("'"))
    if len(matches) > 1:
        abort("DUPLICATE_ENV_VARIABLE:" + name)
    return matches[0] if matches else None


def assert_secure_file(path):
    if path.is_symlink() or not path.is_file():
        abort("ENV_NOT_REGULAR:" + str(path))
    st = path.stat()
    if st.st_uid != 0 or (st.st_mode & 0o077):
        abort("ENV_PERMISSIONS_UNSAFE:" + str(path))


def effective_file():
    if run("systemctl", "is-active", SERVICE) != "active":
        abort("ACTIVE_3191_SERVICE_REQUIRED")
    wd = run("systemctl", "show", "-p", "WorkingDirectory", "--value", SERVICE)
    if RELEASE not in wd:
        abort("LIVE_SERVICE_RELEASE_VERSION_MISMATCH")
    envs = run("systemctl", "show", "-p", "EnvironmentFiles", "--value", SERVICE)
    found = sorted(set(re.findall(r"/etc/lingxifield/[A-Za-z0-9_.-]+\.env", envs)))
    if len(found) != 1:
        abort("EXPECTED_ONE_LIVE_ENVFILE_GOT_" + str(len(found)))
    inline = run("systemctl", "show", "-p", "Environment", "--value", SERVICE)
    if "SUPABASE_SERVICE_ROLE_KEY=" in inline or "SUPABASE_SECRET_KEY=" in inline:
        abort("SYSTEMD_INLINE_ADMIN_KEY_OVERRIDES_FILE")
    return pathlib.Path(found[0])


def check_http(path, expected, port=3191):
    url = "http://127.0.0.1:" + str(port) + path
    req = urllib.request.Request(url, headers={
        "Host": "lingxifield.cn",
        "X-Forwarded-Host": "lingxifield.cn",
        "X-Forwarded-Proto": "https",
        "User-Agent": "LINGXIFIELD-cn3191-safe-health/1",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            code = resp.status
    except urllib.error.HTTPError as err:
        code = err.code
    except OSError:
        code = 0
    if code != expected:
        abort("LOOPBACK_HEALTH_FAILED:" + path + ":" + str(code))
    print("LOOPBACK_CHECK_OK", path, code)


def verify_key(key):
    if not KEY_PATTERN.fullmatch(key):
        abort("SB_SECRET_KEY_MISSING_OR_BAD_FORMAT")
    req = urllib.request.Request(
        SUPABASE + "/rest/v1/money_operator_settings?select=id&id=eq.true&limit=1",
        headers={"apikey": key, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status != 200:
                abort("SUPABASE_READ_NOT_200")
            rows = json.loads(resp.read(5000))
    except urllib.error.HTTPError as err:
        abort("SUPABASE_ADMIN_KEY_REJECTED_HTTP_" + str(err.code))
    except (OSError, ValueError):
        abort("SUPABASE_ADMIN_KEY_READ_FAILED")
    if len(rows) != 1 or rows[0].get("id") is not True:
        abort("SUPABASE_ADMIN_SETTINGS_NOT_ACCESSIBLE")
    print("ADMIN_KEY_REMOTE_READ_VERIFIED_NO_ROWS_LOGGED")


def safe_patch(text, secret):
    rx = re.compile(r"^\s*(?:export\s+)?SUPABASE_SERVICE_ROLE_KEY\s*=.*$", re.MULTILINE)
    if len(rx.findall(text)) > 1:
        abort("MULTIPLE_LEGACY_ADMIN_KEYS")
    line = "SUPABASE_SERVICE_ROLE_KEY=" + secret
    if rx.search(text):
        return rx.sub(lambda _: line, text)
    return text.rstrip("\n") + "\n" + line + "\n"


def atomic_write(path, payload, original):
    mode = stat.S_IMODE(original.st_mode)
    fd, temp = tempfile.mkstemp(prefix=".lingxi-cn3191-env-", dir=str(path.parent))
    try:
        os.fchmod(fd, mode)
        os.fchown(fd, original.st_uid, original.st_gid)
        with os.fdopen(fd, "wb") as file:
            file.write(payload)
            file.flush()
            os.fsync(file.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def baseline():
    check_http("/api/health", 200)
    check_http("/api/sasi/account", 401)
    check_http("/api/tools/jobs", 401)
    check_http("/api/pay/providers", 200)


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--plan", "--apply"):
        abort("USE_EXPLICIT_--plan_OR_--apply")
    if os.geteuid() != 0:
        abort("ROOT_REQUIRED")
    LOCK.parent.mkdir(parents=True, exist_ok=True)
    with open(LOCK, "w") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        dest = effective_file()
        assert_secure_file(SOURCE)
        assert_secure_file(dest)
        orig = dest.read_bytes()
        src = SOURCE.read_text("utf-8")
        dest_text = orig.decode("utf-8")
        origin = value(src, "SUPABASE_URL") or value(src, "NEXT_PUBLIC_SUPABASE_URL")
        if origin != SUPABASE:
            abort("PRODUCTION_SOURCE_PROJECT_MISMATCH")
        secret = value(src, "SUPABASE_SECRET_KEY") or ""
        verify_key(secret)
        baseline()
        if dest != SOURCE:
            live_origin = value(dest_text, "SUPABASE_URL") or value(dest_text, "NEXT_PUBLIC_SUPABASE_URL")
            if live_origin != SUPABASE:
                abort("LIVE_SERVICE_PROJECT_MISMATCH")
        patched = safe_patch(dest_text, secret).encode("utf-8")
        print("ACTIVE_SERVICE", SERVICE, "PORT", 3191)
        print("ACTIVE_ENV_FILE", str(dest))
        print("NEW_VALID_KEY_PRESENT", bool(secret), "LEGACY_ALIAS_NEEDS_UPDATE", patched != orig)
        if sys.argv[1] == "--plan":
            print("CN_3191_ADMIN_KEY_PLAN_READ_ONLY_NO_RESTART")
            return
        if patched == orig:
            print("CN_3191_ALIAS_ALREADY_MATCHES_NO_RESTART")
            return
        st = dest.stat()
        backup = dest.with_name(dest.name + ".before-cn3191-key-20261108-" + str(int(time.time())))
        if backup.exists():
            abort("BACKUP_COLLISION")
        shutil.copy2(dest, backup)
        backup.chmod(0o600)
        print("SAFE_BACKUP_CREATED", str(backup))
        try:
            atomic_write(dest, patched, st)
            run("systemctl", "restart", SERVICE, timeout=50)
            if run("systemctl", "is-active", SERVICE) != "active":
                abort("POST_RESTART_SYSTEMD_INACTIVE")
            baseline()
            verify_key(secret)
            print("CN_3191_ADMIN_KEY_ALIAS_APPLIED_VERIFIED_BROWSER_ADMIN_LOGIN_STILL_REQUIRED")
        except Exception:
            print("CN_3191_POSTCHECK_FAILED_ROLLING_BACK", file=sys.stderr)
            atomic_write(dest, orig, st)
            try:
                run("systemctl", "restart", SERVICE, timeout=50)
                baseline()
                print("CN_3191_ORIGINAL_ENV_RESTORED")
            except Exception:
                print("CRITICAL_CN3191_ROLLBACK_HEALTH_FAILURE_CHECK_SYSTEMD", file=sys.stderr)
            raise


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("CN_3191_ADMIN_KEY_ABORTED", type(exc).__name__, str(exc)[:160], file=sys.stderr)
        sys.exit(1)
