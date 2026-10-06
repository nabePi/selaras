#!/bin/sh
# Menjalankan PostgreSQL lokal lewat Podman. Port 5434 dipilih agar tidak bentrok dengan
# container Postgres proyek lain (5432/5433).
set -e
NAME=selaras-postgres
VOLUME=selaras-pgdata

case "$1" in
  up)
    if podman container exists "$NAME"; then
      podman start "$NAME" >/dev/null
    else
      podman volume create "$VOLUME" >/dev/null
      podman run -d --name "$NAME" \
        -e POSTGRES_USER=selaras -e POSTGRES_PASSWORD=selaras -e POSTGRES_DB=selaras \
        -p 5434:5432 -v "$VOLUME":/var/lib/postgresql/data \
        docker.io/library/postgres:16-alpine >/dev/null
    fi
    echo "PostgreSQL berjalan di localhost:5434 (db/user/password: selaras)"
    ;;
  down)
    podman stop "$NAME"
    ;;
  *)
    echo "pemakaian: db.sh up|down" >&2
    exit 1
    ;;
esac
