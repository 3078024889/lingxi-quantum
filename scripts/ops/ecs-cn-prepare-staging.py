#!/usr/bin/env python3
"""Create a private and FINANCIALLY DISABLED ECS staging env; never print keys.
Requires interactive service-role key from the real Supabase project dashboard.
Does NOT change production.env, public 3188, Nginx, or Supabase itself.
"""
import base64
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time

ROOT = Path("/etc/lingxifield")
SRC = ROOT / "production.env"
DST = ROOT / "staging.env"
WORKFLOW_URL = (
 "https://gh-proxy.com/https://raw.githubusercontent.com/"
 "3078024889/lingxi-quantum/bef1cfafdc3d3f6d23b2d73132c8d085db24e56d/"
 ".github/workflows/ecs-cn-main199-build.yml"
)
WORKFLOW_BLOB = "4a6a9c07243feffb7aa7f722c0f1720029f021ac"
EXPECTED_URL = "https://sxsgdpqojepgbbrxrzlq.supabase.co"
if os.geteuid() != 0:
    raise SystemExit("RUN_AS_ROOT")
if not SRC.is_file():
    raise SystemExit("PRODUCTION_ENV_NOT_FOUND")
if not Path("/opt/lingxifield/releases/cn-pr199/server.js").is_file():
    raise SystemExit("CN_PR199_RELEASE_NOT_FOUND")
for f in (Path("/root/lingxifield-cn-stage.sh"),Path("/root/lingxifield-cn-stage.service")):
    if not f.is_file():
        raise SystemExit("STAGE_SCRIPT_MISSING")

data = subprocess.run(["curl","-fsSL","--retry","2","--max-time","100",WORKFLOW_URL],
 capture_output=True,check=True).stdout
actual_blob = hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
if actual_blob != WORKFLOW_BLOB:
    raise SystemExit("PUBLIC_WORKFLOW_INTEGRITY_FAILED")
text = data.decode("utf8")
keys = re.findall(r"NEXT_PUBLIC_SUPABASE_ANON_KEY:\s*\$\{\{\s*vars\.NEXT_PUBLIC_SUPABASE_ANON_KEY\s*\|\|\s*'([^']+)'\s*\}\}", text)
if len(keys) != 2 or len(set(keys)) != 1:
    raise SystemExit("PUBLIC_ANON_SOURCE_AMBIGUOUS")
anon = keys[0]
def jwt_claims(jwt):
    try:
        parts = jwt.split(".")
        return json.loads(base64.urlsafe_b64decode(parts[1] + "=" * (-len(parts[1]) % 4)))
    except (ValueError, IndexError, json.JSONDecodeError) as exc:
        raise SystemExit("SUPABASE_KEY_NOT_JWT") from exc
if jwt_claims(anon).get("role") != "anon":
    raise SystemExit("PUBLIC_KEY_NOT_ANON")
print("VERIFIED_PUBLIC_SUPABASE_ANON_KEY_RECOVERED")

print("请打开 Supabase 控制台：Settings > API Keys，选择原项目的 service_role 或新 secret key")
print("私钥只粘贴在当前 ECS 终端的隐藏输入框，最后按回车。不要发送到聊天或 GitHub。")
admin = getpass.getpass("SUPABASE_SERVICE_ROLE_KEY (hidden): ").strip()
if admin.startswith("sb_secret_"):
    if len(admin) < 25:
        raise SystemExit("SUPABASE_SECRET_KEY_TOO_SHORT")
else:
    if jwt_claims(admin).get("role") != "service_role":
        raise SystemExit("NOT_A_SERVICE_ROLE_KEY")
print("SUPABASE_ADMIN_KEY_FORMAT_OK_NOT_YET_VERIFIED_WITH_SERVER")

# Preserve valid non-sensitive production values. Exclude ALL Vercel placeholders.
source_lines = SRC.read_text(encoding="utf8").splitlines()
out_lines = []
overrides = {
 "NEXT_PUBLIC_SUPABASE_ANON_KEY": anon,
 "NEXT_PUBLIC_SITE_URL": "https://lingxifield.cn",
 "SUPABASE_SERVICE_ROLE_KEY": admin,
 "ALIPAY_ENABLED": "false",
 "WECHAT_MINI_VPAY_TOPUPS_ENABLED": "false",
 "WECHAT_MINI_VPAY_TOOLS_ENABLED": "false",
}
seen = set()
redacted_names = []
for line in source_lines:
    match = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$",line)
    if not match:
        out_lines.append(line)
        continue
    name, value = match.group(1),match.group(2).strip()
    if name in seen:
        raise SystemExit("DUPLICATE_ENV_VAR_"+name)
    seen.add(name)
    if name in overrides:
        continue
    if value.strip("\"' ") == "[SENSITIVE]":
        redacted_names.append(name)
        continue
    out_lines.append(line)
for key,value in overrides.items():
    out_lines.append(key+"="+json.dumps(value,ensure_ascii=True))
env_out = "\n".join(out_lines) + "\n"
if "[SENSITIVE]" in env_out:
    raise SystemExit("REDACTED_MARKER_STILL_PRESENT")
ROOT.mkdir(mode=0o700,exist_ok=True)
os.chmod(ROOT,0o700)
if DST.exists():
    shutil.copy2(DST, ROOT / ("staging.env.backup."+time.strftime("%Y%m%d-%H%M%S")))
fd,tmp=tempfile.mkstemp(dir=ROOT,prefix=".stage.",text=True)
try:
    with os.fdopen(fd,"w",encoding="utf8") as stream:
        stream.write(env_out)
    os.chmod(tmp,0o600)
    os.replace(tmp,DST)
except Exception:
    try: os.unlink(tmp)
    except OSError: pass
    raise
for path in ("/root/lingxifield-cn-stage.sh","/root/lingxifield-cn-stage.service"):
    p=Path(path)
    old=p.read_text()
    if "/etc/lingxifield/production.env" not in old:
        raise SystemExit("STAGE_UNIT_REFERENCE_UNEXPECTED_"+p.name)
    backup=p.with_name(p.name+".before-private-stage")
    if not backup.exists():
        shutil.copy2(p,backup)
    p.write_text(old.replace("/etc/lingxifield/production.env",
                             "/etc/lingxifield/staging.env"))
subprocess.run(["bash","-n","/root/lingxifield-cn-stage.sh"],check=True)
print("CN_STAGING_ENV_PREPARED")
print("VERCEL_REDACTED_KEYS_EXCLUDED="+str(len(redacted_names)))
print("STAGE_PAYMENTS_DISABLED")
print("PUBLIC_SITE_AND_PRODUCTION_ENV_NOT_CHANGED")
