# shellcheck shell=bash
# Fonctions partagées par les scripts de deploy/ (à « sourcer », pas à exécuter)
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ENV_FILE="$ROOT_DIR/.env"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"

step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

# Charge .env et vérifie que les valeurs indispensables sont remplies
load_env() {
  [ -f "$ENV_FILE" ] || die "Fichier .env introuvable. Lancez d'abord : bash deploy/init-env.sh"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  local missing=()
  for var in DOMAIN POSTGRES_PASSWORD JWT_SECRET JWT_REFRESH_SECRET; do
    [ -n "${!var:-}" ] || missing+=("$var")
  done
  [ ${#missing[@]} -eq 0 ] || die "Valeurs manquantes dans .env : ${missing[*]}"
  POSTGRES_USER=${POSTGRES_USER:-postgres}
  POSTGRES_DB=${POSTGRES_DB:-senbiopest}
}

# Attend que l'API réponde (elle applique les migrations au démarrage)
wait_for_api() {
  local tries=${1:-60}
  for _ in $(seq 1 "$tries"); do
    if compose exec -T api wget -qO- http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 3
  done
  return 1
}
