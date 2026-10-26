#!/usr/bin/env bash
# Sauvegarde la base de données et les fichiers envoyés (photos), puis supprime
# les sauvegardes de plus de KEEP_DAYS jours. Lancé chaque nuit par cron (voir setup-server.sh).
#   bash deploy/backup.sh
source "$(dirname "$0")/common.sh"

BACKUP_DIR=${BACKUP_DIR:-/var/backups/senbiopest}
KEEP_DAYS=${KEEP_DAYS:-14}
load_env
mkdir -p "$BACKUP_DIR"
stamp=$(date +%Y-%m-%d_%H%M)
# An interrupted backup must not leave a half-written file that looks usable
trap 'rm -f "$BACKUP_DIR"/*-"$stamp".*.part' EXIT

echo "[$(date '+%F %T')] Sauvegarde $stamp"

# Base : format « custom » de pg_dump (compressé, restaurable avec pg_restore)
db_file="$BACKUP_DIR/db-$stamp.dump"
compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom > "$db_file.part"
mv "$db_file.part" "$db_file"

# Fichiers envoyés : copie du volume « uploads » de l'API
uploads_file="$BACKUP_DIR/uploads-$stamp.tar.gz"
compose exec -T api tar czf - -C /app/uploads . > "$uploads_file.part"
mv "$uploads_file.part" "$uploads_file"

find "$BACKUP_DIR" -maxdepth 1 \( -name 'db-*.dump' -o -name 'uploads-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete
echo "  OK : $(du -h "$db_file" | cut -f1) (base), $(du -h "$uploads_file" | cut -f1) (fichiers)"
