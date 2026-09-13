#!/usr/bin/env bash
# Deploy layanan data ke VPS sebagai container Docker di network coolify (Traefik + Let's Encrypt otomatis).
# Jalankan dari Mac: bash vps/deploy.sh
# Prasyarat: SSH root ke VPS tanpa sandi, dan /srv/easylearn/.env sudah diisi di VPS (lihat vps/.env.example).
set -euo pipefail

HOST="${VPS_HOST:-root@187.53.129.205}"
DOMAIN="${API_DOMAIN:-easylearn-api.187.53.129.205.sslip.io}"
ROOT=/srv/easylearn
HERE="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> salin berkas ke $HOST:$ROOT"
ssh "$HOST" "mkdir -p $ROOT/app $ROOT/seed $ROOT/data/jurnal/lampiran"
scp -q "$HERE/vps/server.js" "$HERE/vps/package.json" "$HERE/vps/Dockerfile" "$HOST:$ROOT/app/"
scp -q "$HERE/content/topics.json" "$HOST:$ROOT/seed/topics.json"

echo "==> build image dan jalankan ulang container"
ssh "$HOST" bash -s "$ROOT" "$DOMAIN" <<'REMOTE'
set -euo pipefail
ROOT="$1"; DOMAIN="$2"
test -f "$ROOT/.env" || { echo "Belum ada $ROOT/.env (salin dari vps/.env.example dan isi)"; exit 1; }
docker build -q -t easylearn-data:latest "$ROOT/app" >/dev/null
docker rm -f easylearn-data >/dev/null 2>&1 || true
docker run -d --name easylearn-data --restart unless-stopped \
  --network coolify \
  --env-file "$ROOT/.env" \
  -v "$ROOT/data:/data" \
  -v "$ROOT/seed:/seed:ro" \
  -l traefik.enable=true \
  -l traefik.docker.network=coolify \
  -l "traefik.http.routers.easylearn-http.rule=Host(\`$DOMAIN\`)" \
  -l traefik.http.routers.easylearn-http.entryPoints=http \
  -l traefik.http.routers.easylearn-http.middlewares=redirect-to-https \
  -l "traefik.http.routers.easylearn-https.rule=Host(\`$DOMAIN\`)" \
  -l traefik.http.routers.easylearn-https.entryPoints=https \
  -l traefik.http.routers.easylearn-https.tls=true \
  -l traefik.http.routers.easylearn-https.tls.certresolver=letsencrypt \
  -l traefik.http.routers.easylearn-https.service=easylearn \
  -l traefik.http.routers.easylearn-http.service=easylearn \
  -l traefik.http.services.easylearn.loadbalancer.server.port=3210 \
  easylearn-data:latest >/dev/null
sleep 3
docker logs --tail 5 easylearn-data
REMOTE

echo "==> cek https://$DOMAIN/health (sertifikat bisa butuh sekitar satu menit)"
for i in 1 2 3 4 5 6; do
  if curl -fsS --max-time 10 "https://$DOMAIN/health"; then echo; echo "OK"; exit 0; fi
  sleep 10
done
echo "Belum menjawab lewat HTTPS. Cek: ssh $HOST docker logs easylearn-data"
