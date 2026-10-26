#!/usr/bin/env bash
# Crée le fichier .env de production : demande le domaine (ou l'adresse IP du serveur
# tant qu'il n'y a pas de domaine) et le numéro WhatsApp, génère des mots de passe et
# des secrets aléatoires. Ne remplace jamais un .env existant.
#   bash deploy/init-env.sh
source "$(dirname "$0")/common.sh"

[ ! -f "$ENV_FILE" ] || die ".env existe déjà ($ENV_FILE). Modifiez-le directement ou supprimez-le d'abord."
command -v openssl >/dev/null || die "openssl est requis"

server_ip=$(curl -fsS -4 --max-time 5 https://ifconfig.me 2>/dev/null || true)

echo "Nom de domaine du site (ex : senbiopest.sn, sans https://)."
echo "Pas encore de domaine ? Entrez l'adresse IP du serveur${server_ip:+ ($server_ip)} : site en HTTP, mode temporaire."
read -rp "Domaine ou IP : " domain
domain=${domain#http://}
domain=${domain#https://}
domain=${domain%/}
domain=${domain#www.}

ip_mode=false
if [[ "$domain" =~ ^([0-9]{1,3}[.]){3}[0-9]{1,3}$ ]]; then
  ip_mode=true
elif [[ ! "$domain" =~ ^[a-z0-9.-]+\.[a-z]{2,}$ ]]; then
  die "Domaine invalide : '$domain'"
fi

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

if $ip_mode; then
  cat >> "$ENV_FILE" <<'ENV'

# --- Mode temporaire sans domaine (HTTP sur l'adresse IP) ---
# Une fois le domaine acheté et pointé vers ce serveur : mettez-le dans DOMAIN,
# supprimez ces trois lignes, puis lancez : bash deploy/deploy.sh --no-pull
SITE_SCHEME=http
CADDYFILE=Caddyfile.ip
COOKIE_SECURE=false
ENV
  step ".env créé en mode IP ($ENV_FILE, lisible par vous seul)"
  warn "Site en HTTP sans cadenas : ne vous connectez pas au back-office depuis un Wi-Fi public"
  warn "et ne communiquez pas cette adresse à vos clients avant d'avoir un domaine."
  echo "Ensuite : bash deploy/deploy.sh"
  exit 0
fi

step ".env créé ($ENV_FILE, lisible par vous seul)"
cat <<NEXT
Avant de déployer, vérifiez que le domaine pointe vers ce serveur :
  - enregistrement A  : $domain      -> ${server_ip:-<IP du serveur>}
  - enregistrement A  : www.$domain  -> même IP
Puis : bash deploy/deploy.sh
NEXT
