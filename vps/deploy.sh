#!/usr/bin/env bash
# Deploy layanan data + jembatan chat Hermes ke VPS sebagai systemd service di host
# (bukan Docker, supaya bisa memanggil `hermes` yang terpasang di host).
# HTTPS lewat Traefik milik Coolify (file provider) dengan Let's Encrypt.
# Jalankan dari Mac: bash vps/deploy.sh
set -euo pipefail

HOST="${VPS_HOST:-root@187.53.129.205}"
ROOT=/srv/easylearn
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${API_DOMAIN:-easylearn-api.187.53.129.205.sslip.io}"

echo "==> salin berkas ke $HOST:$ROOT (satu koneksi, ufw membatasi laju SSH)"
tar -C "$HERE" -cf - vps/server.js vps/package.json vps/easylearn-data.service vps/traefik-easylearn.yaml content/topics.json \
  | ssh "$HOST" "set -e; mkdir -p $ROOT/app $ROOT/seed $ROOT/data/jurnal/lampiran; T=\$(mktemp -d); tar -C \$T -xf -; \
      cp \$T/vps/server.js \$T/vps/package.json $ROOT/app/; cp \$T/content/topics.json $ROOT/seed/topics.json; \
      cp \$T/vps/easylearn-data.service /etc/systemd/system/easylearn-data.service; \
      cp \$T/vps/traefik-easylearn.yaml /data/coolify/proxy/dynamic/easylearn.yaml; rm -rf \$T"

echo "==> pasang dependensi, service, firewall"
ssh "$HOST" bash -s "$ROOT" <<'REMOTE'
set -euo pipefail
ROOT="$1"
test -f "$ROOT/.env" || { echo "Belum ada $ROOT/.env (salin dari vps/.env.example dan isi)"; exit 1; }
cd "$ROOT/app" && npm install --omit=dev --no-audit --no-fund >/dev/null
# izinkan Traefik (network coolify 10.0.1.0/24) mencapai port 3210 di host
ufw status | grep -q "3210/tcp.*10.0.1.0/24" || ufw allow from 10.0.1.0/24 to any port 3210 proto tcp comment "easylearn via Traefik" >/dev/null
# container lama (versi Docker) tidak dipakai lagi
docker rm -f easylearn-data >/dev/null 2>&1 || true
systemctl daemon-reload
systemctl enable --now easylearn-data >/dev/null
systemctl restart easylearn-data
sleep 2
systemctl --no-pager --lines=4 status easylearn-data | sed -n '1,3p;/Active/p'
journalctl -u easylearn-data -n 3 --no-pager -o cat
REMOTE

echo "==> cek https://$DOMAIN/health"
for i in 1 2 3 4 5 6; do
  if curl -fsS --max-time 10 "https://$DOMAIN/health"; then echo; echo "OK"; exit 0; fi
  sleep 10
done
echo "Belum menjawab lewat HTTPS. Cek: ssh $HOST journalctl -u easylearn-data -n 30"
