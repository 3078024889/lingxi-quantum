#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then echo "Docker is required"; exit 1; fi
if [ ! -f .env ]; then echo "Copy .env.example to .env and fill production secrets first."; exit 1; fi
set -a
. ./.env
set +a
[ "${#LINGXIFIELD_DOCUMENT_GATEWAY_SECRET}" -ge 32 ] || { echo "Gateway secret must be at least 32 chars"; exit 1; }
[ "${#GOTENBERG_BASIC_PASSWORD}" -ge 24 ] || { echo "Gotenberg password must be at least 24 chars"; exit 1; }
[ -n "${DOCUMENT_GATEWAY_DOMAIN}" ] || { echo "DOCUMENT_GATEWAY_DOMAIN is required"; exit 1; }
docker compose pull
docker compose build --pull gateway
docker compose up -d --remove-orphans
docker compose ps
echo "DOCUMENT_GATEWAY_DEPLOY=PASS"
