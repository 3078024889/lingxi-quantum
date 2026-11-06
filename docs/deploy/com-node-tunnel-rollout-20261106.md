# LINGXIFIELD .com — complete Node candidate → Cloudflare Tunnel

**Current status (2026-11-06): candidate only, no production DNS cutover.** Independent Next.js Node server passed five real loopback HTTP checks on an isolated GitHub Linux runner, see [Actions run 42191436254](https://github.com/3078024889/lingxi-quantum/actions/runs/42191436254). The old Vercel project remains, but its apex origin currently returns 402/DEPLOYMENT_DISABLED. Do not call it a working fallback. Never touch `.cn` while installing this .com preview.

## Verified upstream patterns reused

- Next.js official `output: "standalone"` plus `.next/static` and `public`: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Cloudflare Tunnel published applications: https://developers.cloudflare.com/tunnel/get-started/
- Cloudflare remotely managed tunnel `--token-file`: https://developers.cloudflare.com/tunnel/reference/run-parameters/
- Self-host behind an outbound-only tunnel and localhost port, not a publicly exposed Node port. Use separate new tunnel for .com; do **not** replace any existing `cloudflared.service` belonging to .cn.

## Host preparation (not yet run)

1. Obtain a reviewed, *private* Node standalone archive produced from the exact passing source SHA; it must contain `server.js`, `node_modules`, `.next/static`, `public`, and `lingxi-com-candidate-report.json`. The CI candidate build currently validates the tree **but does not upload a release archive**, to avoid unnecessary GitHub artifact storage charges. Never upload this private runtime bundle to the public R2 bucket.
2. On an authorized Linux host (Node 24, systemd, curl, tar and available disk/RAM), verify the archive using `bash infra/com-node/install-preview.sh --verify /path/bundle.tar.gz SHA256`. This does not need root.
3. Once the bundle and host resource checks pass, run `sudo bash infra/com-node/install-preview.sh --install /path/bundle.tar.gz SHA256 SOURCE_SHA`. This installs *only* `/opt/lingxifield-com-preview`, `/etc/lingxifield-com-preview`, and `lingxifield-com-preview.service`. The Node process listens on **127.0.0.1:4187**. It does not open the port publicly or touch another site's service.
4. Keep Supabase, payment, artifact and SASI credentials exclusively in `/etc/lingxifield-com-preview/app.env` with root-only permissions. The install script leaves this file unchanged; missing values mean production is not ready.
5. Create a **separate** Cloudflare Tunnel under **Networking → Tunnels**. First publish only a preview hostname such as `node-preview.lingxifield.com`, pointing at `http://127.0.0.1:4187`. Restrict this preview route using Cloudflare Access or equivalent allowlisting; do not attach the apex domain. Use a dedicated `cloudflared` instance/service and keep its token in a root-owned file (not Git, CLI arguments or chat).
6. End-to-end verify registered-user login/session/cookies, private Supabase/RLS and R2, at least one real file each for PDF/Office/video, billing quotations and live provider callbacks/refunds, refund history/entitlements, native GPU model artifacts, nine languages, mobile and desktop, cron, and all 124 tool delivery paths. **Passing the five health/pages checks is not enough.**
7. Only after complete production gates and a working rollback target exist, plan an explicit controlled cutover of `lingxifield.com`. Leave `lingxifield.cn` and the Vercel project unchanged. A Cloudflare Tunnel public hostname causes DNS changes *for that hostname* automatically; do not configure the apex during preview.

## Security invariants

- No shared `.cn` port, Linux service, filesystem, or Tunnel credentials.
- No payment writes during smoke acceptance.
- Installer checks archive checksum, archive paths, source report and symlink isolation; preserves existing releases and tries to restore previous symlink on failed health.
- Exposing a preview public hostname without Access gates permits unsolicited access to API endpoints; do not do so before authentication and provider security testing.
- `sourceSha` and `archiveSha256` must be carried together as release evidence; an archive without matching source audit must not be promoted.

## Signed provenance and private release package

The audited Next standalone GitHub CI now creates a self-contained Node runtime
artifact only AFTER isolated server startup and 5/5 loopback HTTP checks succeed.
The release bundle includes the exact 40-digit Git commit SHA, its own SHA-256
checksum, and a JSON manifest showing that production acceptance is not complete.
GitHub retains this private Actions artifact for **one day** to limit storage.
The job declines to upload archives over 1.2 GB; even a successful upload can
consume GitHub Actions artifact storage capacity.

Download the ZIP from the *exact passing Actions run* (not the branch name);
unzip and verify the SHA256SUMS entry for the tar.gz locally. The installer
checks the SHA-256 before extraction and strictly rejects all archive links,
special files, duplicated paths and traversal. For --install it also verifies
the internal sourceSha equals the intended commit. Never upload the Node
package into the publicly readable models/WASM R2 bucket.

This artifact is a **preview candidate**, never a proof of operational login,
payment settlement/refunds, native GPU video render, or tool entitlements.

## 2026-11-06 · Exact installation handoff for existing Alibaba Cloud ECS

Release evidence: https://github.com/3078024889/lingxi-quantum/actions/runs/42193934734. Download its authenticated GitHub Artifact named lingxifield-com-node-preview (ZIP about 472 MB, available for only one day, through 2026-11-07 09:21:04 UTC). The archive's Git SHA is e99b572ef708322dea4e9fc5c71aa6bd114fd20c. Aliyun Workbench Linux upload supports up to 1200 MB (https://help.aliyun.com/zh/ecs/user-guide/use-workbench-to-upload-a-file-to-a-linux-instance).

1. Use Alibaba Cloud ECS > Instances > Workbench terminal connection > File Manager, and upload the downloaded GitHub Artifact ZIP into a newly created **/root/lingxifield-com-stage** directory. This is staging only; never upload over .cn folders or a running system directory. Workbench's SSM-only sessions lack File Manager.
2. In ECS terminal perform the read-only preflight below. Stop if Node is not major version 24, disk capacity below 3 GiB, or the archive is missing. Download the two exact, public, source-pinned installer scripts using HTTPS; never pipe curl directly to bash.

```bash
set -euo pipefail
mkdir -p /root/lingxifield-com-stage
cd /root/lingxifield-com-stage
for cmd in node python3 unzip tar curl sha256sum systemctl ss; do command -v "$cmd" >/dev/null || { echo "MISSING_COMMAND:$cmd"; exit 1; }; done
node -e 'if(Number(process.versions.node.split(".")[0])!==24)process.exit(1)' || { echo NODE_24_REQUIRED; exit 1; }
test "$(df -B1 /opt | awk 'NR==2{print $4}')" -ge 3221225472 || { echo MINIMUM_3G_FREE_DISK_REQUIRED; exit 1; }
test -f lingxifield-com-node-preview.zip || { echo GITHUB_ARTIFACT_ZIP_MISSING; exit 1; }
unzip -n lingxifield-com-node-preview.zip
sha=$(awk 'NR==1 {print $1}' SHA256SUMS.txt)
archive=lingxifield-com-node-e99b572ef708322dea4e9fc5c71aa6bd114fd20c.tar.gz
test -f "$archive"
curl --fail --location --retry 3 --silent --show-error 'https://raw.githubusercontent.com/3078024889/lingxi-quantum/e99b572ef708322dea4e9fc5c71aa6bd114fd20c/infra/com-node/install-preview.sh' -o install-preview.sh
curl --fail --location --retry 3 --silent --show-error 'https://raw.githubusercontent.com/3078024889/lingxi-quantum/e99b572ef708322dea4e9fc5c71aa6bd114fd20c/infra/com-node/strict-archive.py' -o strict-archive.py
bash -n install-preview.sh
python3 -m py_compile strict-archive.py
bash install-preview.sh --verify "$archive" "$sha"
```

3. Only after this prints **COM_NODE_ARCHIVE_VERIFIED**, and only if this is the approved isolated .com ECS instance, invoke the installer to create the new dedicated 127.0.0.1:4187 service. It does not change DNS. First-time installation has no production payment or private-auth secrets, so mark it **preview only**.

```bash
cd /root/lingxifield-com-stage
sudo bash install-preview.sh --install "$archive" "$sha" e99b572ef708322dea4e9fc5c71aa6bd114fd20c
sudo systemctl status lingxifield-com-preview.service --no-pager
curl --fail --silent --show-error http://127.0.0.1:4187/api/health
```

4. Tunnel: follow the current official [Cloudflare route guide](https://developers.cloudflare.com/tunnel/get-started/), under Networking > Tunnels. Do not run cloudflared service uninstall or modify an existing .cn tunnel. If a cloudflared service already exists, **do not run** its default service-install command a second time (official troubleshooting: https://developers.cloudflare.com/tunnel/troubleshooting/). Plan a separately named manual systemd instance or separately reviewed existing connector route only after verifying that it will not affect .cn. On a dedicated .com-only host, use the standard install flow. First publish the Access-protected **node-preview.lingxifield.com** hostname to http://127.0.0.1:4187, not the apex.
5. Verify real Supabase login, permissions/RLS, private R2, PDF/Office/video file round-trip, billing/settlements/refunds, native-GPU artifact checksum, mobile/desktop, 9 languages, and full 124-tool deliverables. The login/payments/generation functions are NOT verified by the existing five HTTP checks. Cutover to lingxifield.com is prohibited until these gates and a *working* Vercel or equivalent rollback are actually evidenced.

**Artifact naming note:** The GitHub downloadable ZIP is called `lingxifield-com-node-preview.zip`; the internal tarball contains the full 40-character source SHA. The SHA256SUMS.txt generated by Actions contains an absolute CI path for the tarball. Extract its **first SHA column** as above rather than passing SHA256SUMS.txt directly to `sha256sum -c` on ECS.
