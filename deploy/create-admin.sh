#!/usr/bin/env bash
# Crée un compte administrateur (ou réinitialise son mot de passe s'il existe déjà).
#   bash deploy/create-admin.sh
source "$(dirname "$0")/common.sh"

load_env
read -rp "Email de l'administrateur : " email
read -rp "Prénom : " first_name
read -rp "Nom : " last_name
read -rsp "Mot de passe (12 caractères minimum) : " password; echo
read -rsp "Confirmez le mot de passe : " confirm; echo
[ "$password" = "$confirm" ] || die "Les mots de passe ne correspondent pas."

# Les valeurs passent par l'environnement du conteneur, jamais par la ligne de commande visible dans `ps`
compose exec -T \
  -e ADMIN_EMAIL="$email" \
  -e ADMIN_PASSWORD="$password" \
  -e ADMIN_FIRST_NAME="$first_name" \
  -e ADMIN_LAST_NAME="$last_name" \
  api node dist/scripts/create-admin.js

echo "Connexion : ${SITE_SCHEME:-https}://$DOMAIN/admin"
