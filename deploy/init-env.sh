#!/usr/bin/env bash
# Crée le fichier .env de production : demande le domaine et le numéro WhatsApp,
# génère des mots de passe et des secrets aléatoires. Ne remplace jamais un .env existant.
#   bash deploy/init-env.sh
source "$(dirname "$0")/common.sh"

[ ! -f "$ENV_FILE" ] || die ".env existe déjà ($ENV_FILE). Modifiez-le directement ou supprimez-le d'abord."
command -v openssl >/dev/null || die "openssl est requis"

read -rp "Nom de domaine du site (ex : senbiopest.sn, sans https://) : " domain
domain=${domain#http://}
domain=${domain#https://}
domain=${domain%/}
domain=${domain#www.}
[[ "$domain" =~ ^[a-z0-9.-]+\.[a-z]{2,}$ ]] || die "Domaine invalide : '$domain'"

read -rp "Numéro WhatsApp (format international, ex : +221771234567) : " whatsapp
[[ "$whatsapp" =~ ^\+[0-9]{8,15}$ ]] || die "Numéro invalide : '$whatsapp' (ex : +221771234567)"

umask 077
cat > "$ENV_FILE" <<ENV
# Généré par deploy/init-env.sh le $(date '+%Y-%m-%d %H:%M')
# Ne partagez jamais ce fichier : il contient les mots de passe de la base et les clés de connexion.

DOMAIN=$domain

POSTGRES_DB=senbiopest
POSTGRES_USER=senbiopest
POSTGRES_PASSWORD=$(openssl rand -hex 24)

JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

WHATSAPP_NUMBER=$whatsapp
ENV

step ".env créé ($ENV_FILE, lisible par vous seul)"
cat <<NEXT
Avant de déployer, vérifiez que le domaine pointe vers ce serveur :
  - enregistrement A  : $domain      -> $(curl -fsS -4 --max-time 5 https://ifconfig.me 2>/dev/null || echo "<IP du serveur>")
  - enregistrement A  : www.$domain  -> même IP
Puis : bash deploy/deploy.sh
NEXT
