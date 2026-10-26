#!/usr/bin/env bash
# Prépare un VPS Ubuntu 24.04 neuf pour Sen Biopest. À lancer une seule fois :
#
#   curl -fsSL https://raw.githubusercontent.com/githubkhadim66/sen-biopest-website/main/deploy/setup-server.sh -o setup-server.sh
#   sudo bash setup-server.sh
#
# Ce que fait le script (relançable sans risque) :
#   - mises à jour système + mises à jour de sécurité automatiques
#   - fuseau horaire Africa/Dakar, 2 Go de swap (le build Next.js en a besoin sur 4 Go de RAM)
#   - Docker + Docker Compose (dépôt officiel), rotation des journaux Docker
#   - pare-feu : seuls SSH, HTTP et HTTPS sont ouverts ; fail2ban contre les attaques SSH
#   - SSH : connexion root interdite ; mots de passe désactivés SEULEMENT si une clé SSH est installée
#   - récupère le code dans /opt/senbiopest et programme la sauvegarde quotidienne
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/senbiopest}
REPO_URL=${REPO_URL:-https://github.com/githubkhadim66/sen-biopest-website.git}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/senbiopest}
SWAP_SIZE=${SWAP_SIZE:-2G}
# L'utilisateur qui gérera le site : celui qui a lancé sudo (« ubuntu » chez OVH)
DEPLOY_USER=${DEPLOY_USER:-${SUDO_USER:-ubuntu}}

step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Lancez ce script avec sudo : sudo bash setup-server.sh"
# shellcheck source=/dev/null
. /etc/os-release
[ "${ID:-}" = "ubuntu" ] || die "Ce script est prévu pour Ubuntu (système détecté : ${ID:-inconnu})"
[ "${VERSION_ID:-}" = "24.04" ] || warn "Testé sur Ubuntu 24.04, vous avez ${VERSION_ID:-?} : on continue."
id "$DEPLOY_USER" >/dev/null 2>&1 || die "L'utilisateur '$DEPLOY_USER' n'existe pas (DEPLOY_USER=... pour en choisir un autre)"
[ "$DEPLOY_USER" != "root" ] || die "Lancez le script depuis votre utilisateur habituel avec sudo, pas directement en root"

export DEBIAN_FRONTEND=noninteractive

step "Mise à jour du système"
apt-get update -q
apt-get -y -q -o Dpkg::Options::=--force-confold upgrade
apt-get install -y -q ca-certificates curl git gnupg openssh-server ufw fail2ban unattended-upgrades

step "Fuseau horaire Africa/Dakar"
timedatectl set-timezone Africa/Dakar

step "Swap de $SWAP_SIZE"
if swapon --show=NAME --noheadings | grep -q .; then
  echo "Un swap existe déjà, rien à faire."
elif fallocate -l "$SWAP_SIZE" /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile; then
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-senbiopest-swap.conf
  sysctl -q -p /etc/sysctl.d/99-senbiopest-swap.conf || true
else
  rm -f /swapfile
  warn "Impossible de créer le swap sur cet hébergement : on continue sans (le build sera plus serré en mémoire)."
fi

step "Installation de Docker"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
# Journaux des conteneurs limités (sinon ils peuvent remplir le disque)
if [ ! -f /etc/docker/daemon.json ]; then
  cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
JSON
  systemctl restart docker
fi
systemctl enable --now docker >/dev/null
usermod -aG docker "$DEPLOY_USER"

step "Pare-feu (SSH, HTTP, HTTPS uniquement)"
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null # HTTP/3
ufw --force enable >/dev/null
ufw status | sed -n '1,12p'

step "fail2ban (bannit les IP qui essaient de deviner le mot de passe SSH)"
cat > /etc/fail2ban/jail.d/senbiopest.local <<'JAIL'
[sshd]
enabled = true
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
JAIL
systemctl enable --now fail2ban >/dev/null
systemctl restart fail2ban

step "Mises à jour de sécurité automatiques"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'END_APT_CONF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
END_APT_CONF
systemctl enable --now unattended-upgrades >/dev/null

step "Sécurisation de SSH"
USER_HOME=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)
SSHD_CONF=/etc/ssh/sshd_config.d/99-senbiopest.conf
if [ -s "$USER_HOME/.ssh/authorized_keys" ] && grep -qE '^(ssh-|ecdsa-|sk-)' "$USER_HOME/.ssh/authorized_keys"; then
  printf 'PermitRootLogin no\nPasswordAuthentication no\nKbdInteractiveAuthentication no\n' > "$SSHD_CONF"
  echo "Clé SSH trouvée pour $DEPLOY_USER : connexion par mot de passe désactivée."
else
  printf 'PermitRootLogin no\n' > "$SSHD_CONF"
  warn "Aucune clé SSH pour $DEPLOY_USER : la connexion par mot de passe reste active (protégée par fail2ban)."
  warn "Conseillé : ajoutez une clé SSH puis relancez ce script pour désactiver les mots de passe."
fi
mkdir -p /run/sshd # normally created by the ssh service; needed by sshd -t
sshd -t || die "Configuration SSH invalide, rien n'a été rechargé"
# Ubuntu 24.04 starts ssh on demand (ssh.socket): reload if running, otherwise it applies at next start
systemctl try-reload-or-restart ssh

step "Récupération du code dans $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  echo "Déjà présent."
else
  git clone -q "$REPO_URL" "$APP_DIR"
fi
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

step "Sauvegarde quotidienne (03:30) dans $BACKUP_DIR"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 750 "$BACKUP_DIR"
cat > /etc/cron.d/senbiopest-backup <<CRON
# Sauvegarde quotidienne de la base et des fichiers envoyés (14 jours conservés)
30 3 * * * $DEPLOY_USER BACKUP_DIR=$BACKUP_DIR /bin/bash $APP_DIR/deploy/backup.sh >> $BACKUP_DIR/backup.log 2>&1
CRON
chmod 644 /etc/cron.d/senbiopest-backup

step "Serveur prêt"
cat <<NEXT
Prochaines étapes (en tant que $DEPLOY_USER) :

  1. Déconnectez-vous puis reconnectez-vous (pour utiliser Docker sans sudo)
  2. cd $APP_DIR
  3. bash deploy/init-env.sh          # crée le fichier .env (domaine, mots de passe générés)
  4. bash deploy/deploy.sh            # construit et lance le site (5 à 10 min la 1re fois)
  5. bash deploy/create-admin.sh      # crée votre compte administrateur
NEXT
