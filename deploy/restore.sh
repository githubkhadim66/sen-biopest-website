#!/usr/bin/env bash
# Restaure une sauvegarde faite par backup.sh. REMPLACE les données actuelles.
#   bash deploy/restore.sh /var/backups/senbiopest/db-2026-10-26_0330.dump [uploads-2026-10-26_0330.tar.gz]
source "$(dirname "$0")/common.sh"

db_file=${1:-}
uploads_file=${2:-}
[ -f "$db_file" ] || die "Usage : bash deploy/restore.sh <db-….dump> [uploads-….tar.gz]"
[ -z "$uploads_file" ] || [ -f "$uploads_file" ] || die "Fichier introuvable : $uploads_file"
load_env

warn "Cette opération remplace la base actuelle par $(basename "$db_file")."
read -rp "Tapez RESTAURER pour confirmer : " answer
[ "$answer" = "RESTAURER" ] || die "Annulé."

step "Arrêt du site pendant la restauration"
compose stop web api

step "Restauration de la base"
compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < "$db_file"

if [ -n "$uploads_file" ]; then
  step "Restauration des fichiers envoyés"
  compose start api
  compose exec -T api sh -c 'rm -rf /app/uploads/* && tar xzf - -C /app/uploads' < "$uploads_file"
fi

step "Redémarrage"
compose up -d
wait_for_api 60 || die "L'API ne redémarre pas, voir : docker compose -f docker/docker-compose.yml --env-file .env logs api"
echo "Restauration terminée."
