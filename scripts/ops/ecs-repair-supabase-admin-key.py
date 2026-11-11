#!/usr/bin/env python3
"""Safely validate a new Supabase secret key on the ECS before storing it.

Run interactively ON the authorized ECS as root; no key is accepted as a CLI
argument, no secret is printed or uploaded to GitHub, and no database writes
occur. The app must use lib/supabase/admin.ts with SUPABASE_SECRET_KEY support
before this replacement can repair administrator reads.
"""
import getpass
import json
import os
import pathlib
import re
import shutil
import stat
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timezone
from urllib.parse import urlsplit

ENV = pathlib.Path("/etc/lingxifield/production.env")
EXPECTED_SUPABASE_HOST = "sxsgdpqojepgbbrxrzlq.supabase.co"
KEY_PATTERN = re.compile(r"^sb_secret_[A-Za-z0-9_-]{12,}$")


def fail(reason):
    print("KEY_REPAIR_ABORTED:" + reason, file=sys.stderr)
    raise SystemExit(1)


def parse_env_line(text, name):
    values = [ln.partition("=")[2].strip().strip('"').strip("'")
              for ln in text.splitlines() if ln.startswith(name + "=")]
    return values[-1] if values else ""


def validate(key, origin):
    parsed = urlsplit(origin)
    if parsed.scheme != "https" or parsed.hostname != EXPECTED_SUPABASE_HOST or parsed.port not in (None, 443):
        fail("SUPABASE_HOST_NOT_EXPECTED")
    url = origin.rstrip("/") + "/rest/v1/money_operator_settings?select=id&id=eq.true&limit=1"
    request = urllib.request.Request(url, headers={
        "apikey": key,
        "Accept": "application/json",
        "User-Agent": "LINGXIFIELD-authorized-key-validation/1.0",
    })
    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            if response.status != 200:
                fail("SUPABASE_KEY_HTTP_" + str(response.status))
            data = json.loads(response.read(5120))
            if not isinstance(data, list) or len(data) != 1 or data[0].get("id") is not True:
                fail("KEY_HAS_NO_ADMIN_TABLE_READ")
    except urllib.error.HTTPError as exc:
        fail("SUPABASE_KEY_HTTP_" + str(exc.code))
    except (OSError, ValueError, TypeError):
        fail("SUPABASE_KEY_READONLY_VALIDATION_FAILED")
    print("SUPABASE_SECRET_KEY_VALIDATED_READONLY")


def main():
    if os.geteuid() != 0 or not sys.stdin.isatty():
        fail("ROOT_INTERACTIVE_TERMINAL_REQUIRED")
    if ENV.is_symlink() or not ENV.is_file():
        fail("ENV_FILE_NOT_REGULAR")
    original = ENV.read_text(encoding="utf-8")
    current = os.stat(ENV, follow_symlinks=False)
    origin = parse_env_line(original, "SUPABASE_URL") or parse_env_line(original, "NEXT_PUBLIC_SUPABASE_URL")
    if not origin:
        fail("SUPABASE_ORIGIN_MISSING")
    key = getpass.getpass("请粘贴 Supabase 控制台的 sb_secret_ 服务端密钥（输入隐藏）：").strip()
    if not KEY_PATTERN.fullmatch(key):
        fail("ONLY_SB_SECRET_KEY_SUPPORTED")
    validate(key, origin)
    # Copy existing configuration without echoing or reading other secret values.
    changed = [line for line in original.splitlines() if not line.startswith("SUPABASE_SECRET_KEY=")]
    changed.append("SUPABASE_SECRET_KEY=" + key)
    data = ("\n".join(changed) + "\n").encode("utf-8")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    backup = ENV.with_name(ENV.name + ".before-secret-repair-" + stamp)
    if backup.exists():
        fail("BACKUP_COLLISION")
    shutil.copy2(ENV, backup)
    backup.chmod(stat.S_IRUSR | stat.S_IWUSR)
    fd, tmpname = tempfile.mkstemp(prefix=".production.env.new-", dir=str(ENV.parent))
    try:
        os.fchmod(fd, 0o600)
        os.fchown(fd, current.st_uid, current.st_gid)
        with os.fdopen(fd, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmpname, ENV)
    finally:
        if os.path.exists(tmpname):
            os.unlink(tmpname)
    print("SUPABASE_SECRET_KEY_STORED_ATOMICALLY")
    print("EXISTING_SERVICE_ROLE_KEY_LEFT_UNCHANGED")
    print("SERVICE_RESTART_REQUIRED_AFTER_VALIDATED_APP_CODE_DEPLOY")


if __name__ == "__main__":
    main()
