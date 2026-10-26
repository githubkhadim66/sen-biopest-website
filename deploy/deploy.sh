#!/usr/bin/env bash
# Met en ligne (ou met à jour) le site : récupère la dernière version du code,
# reconstruit les images et redémarre les conteneurs. Les données sont conservées.
#   bash deploy/deploy.sh            # avec git pull
#   bash deploy/deploy.sh --no-pull  # sans toucher au code (ex : après avoir modifié .env)
source "$(dirname "$0")/common.sh"

load_env
cd "$ROOT_DIR"

if [ "${1:-}" != "--no-pull" ]; then
  step "Récupération de la dernière version du code"
  git pull --ff-only
fi

step "Vérification du DNS de $DOMAIN"
server_ip=$(curl -fsS -4 --max-time 5 https://ifconfig.me 2>/dev/null || true)
dns_ip=$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk 'NR==1 {print $1}' || true)
if [ -z "$dns_ip" ]; then
  warn "$DOMAIN ne résout vers aucune IP : le certificat HTTPS ne pourra pas être obtenu tant que le DNS n'est pas configuré."
elif [ -n "$server_ip" ] && [ "$dns_ip" != "$server_ip" ]; then
  warn "$DOMAIN pointe vers $dns_ip mais ce serveur est $server_ip : vérifiez l'enregistrement A."
else
  echo "OK : $DOMAIN -> $dns_ip"
fi

step "Construction des images (5 à 10 min la première fois)"
compose build

step "Démarrage des conteneurs"
compose up -d --remove-orphans

step "Attente de l'API (migrations de la base)"
if wait_for_api 60; then
  echo "API opérationnelle."
else
  compose logs --tail=50 api
  die "L'API ne répond pas après 3 minutes (journaux ci-dessus)."
fi

step "Nettoyage des anciennes images"
docker image prune -f >/dev/null

compose ps
cat <<DONE

Site en ligne : https://$DOMAIN
(le certificat HTTPS est obtenu automatiquement au premier accès, comptez quelques secondes)
Journaux : docker compose -f docker/docker-compose.yml --env-file .env logs -f
DONE
