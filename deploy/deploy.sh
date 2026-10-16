#!/usr/bin/env bash
# Actualiza la app en el servidor: trae los cambios, compila y reinicia.
# Uso: bash ~/appFarmaciaDoSul/deploy/deploy.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> Backend"
cd "$APP_DIR/server"
npm ci --no-audit --no-fund
npm run build
npm prune --omit=dev --no-audit --no-fund

echo "==> Frontend"
cd "$APP_DIR/client"
npm ci --no-audit --no-fund
npm run build

echo "==> Reinicio"
cd "$APP_DIR/server"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "==> Listo. Verificación:"
sleep 2
curl -fsS http://127.0.0.1:4010/health && echo
