# Mise en ligne sur le VPS OVH

Guide pas à pas pour un VPS OVH **Ubuntu 24.04** (VPS-1 : 2 vCore, 4 Go, 40 Go).
Comptez 30 à 45 minutes la première fois, dont 10 minutes d'attente pendant la construction.

## Ce qu'il vous faut

- L'email d'OVH « Votre VPS est installé » : il contient **l'adresse IP** du serveur,
  l'utilisateur (**`ubuntu`**) et le mot de passe (ou le lien pour le définir).
- Un **nom de domaine** (ex. `senbiopest.sn`) et l'accès à sa zone DNS.
- Un terminal : sous Windows, **PowerShell** suffit (la commande `ssh` est incluse).

## 1. Faire pointer le domaine vers le serveur

Dans la zone DNS du domaine (chez OVH : *Web Cloud › Noms de domaine › Zone DNS*),
créez ou modifiez deux enregistrements **A** :

| Sous-domaine | Type | Cible |
|---|---|---|
| *(vide)* | A | IP du VPS |
| `www` | A | IP du VPS |

Supprimez les anciens enregistrements A ou AAAA qui pointeraient ailleurs.
La propagation prend de quelques minutes à quelques heures : faites-le en premier.

## 2. (Conseillé) Se connecter avec une clé SSH plutôt qu'un mot de passe

Sur **votre PC**, dans PowerShell :

```powershell
ssh-keygen -t ed25519
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh ubuntu@IP_DU_VPS "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Appuyez sur Entrée aux questions de `ssh-keygen`, puis tapez une dernière fois le mot de passe OVH.
Avec une clé installée, l'étape 3 désactive la connexion par mot de passe : le serveur devient
inaccessible aux robots qui essaient de deviner les mots de passe.
**Ne perdez pas ce PC ou sauvegardez le fichier `id_ed25519`** : c'est votre accès au serveur.

## 3. Préparer le serveur (une seule fois)

```powershell
ssh ubuntu@IP_DU_VPS
```

Puis, sur le serveur :

```bash
curl -fsSL https://raw.githubusercontent.com/githubkhadim66/sen-biopest-website/main/deploy/setup-server.sh -o setup-server.sh
sudo bash setup-server.sh
```

Le script installe Docker, le pare-feu (seuls SSH, HTTP et HTTPS sont ouverts), fail2ban,
les mises à jour de sécurité automatiques, 2 Go de swap, récupère le code dans `/opt/senbiopest`
et programme une sauvegarde chaque nuit à 03:30. Il peut être relancé sans risque.

**Déconnectez-vous (`exit`) puis reconnectez-vous** : c'est nécessaire pour utiliser Docker.

## 4. Configurer et lancer le site

```bash
cd /opt/senbiopest
bash deploy/init-env.sh        # domaine + numéro WhatsApp ; mots de passe et secrets générés
bash deploy/deploy.sh          # 5 à 10 min la première fois
bash deploy/create-admin.sh    # votre compte administrateur (mot de passe de 12 caractères min.)
```

Le site est en ligne sur `https://votre-domaine`, le back-office sur `https://votre-domaine/admin`.
Le certificat HTTPS est obtenu automatiquement (Let's Encrypt) dès que le DNS de l'étape 1 est propagé.

Ensuite, dans **Admin › Paramètres** : numéro WhatsApp, téléphone, email et adresse affichés sur le site.
Puis ajoutez vos produits, formations, FAQ et témoignages.

## Pas encore de nom de domaine ? (mode IP temporaire)

À la question « Domaine ou IP » de `init-env.sh`, entrez **l'adresse IP du serveur**.
Le site est alors servi en HTTP sur `http://IP_DU_VPS` (back-office : `http://IP_DU_VPS/admin`).

Limites de ce mode, à réserver à la préparation du site :
- **pas de cadenas** : le mot de passe du back-office circule en clair. Ne vous connectez pas
  depuis un Wi-Fi public, et ne communiquez pas cette adresse à vos clients ;
- pas de certificat HTTPS : un certificat ne peut être délivré que pour un nom de domaine.

Les produits et contenus saisis dans ce mode sont **conservés** au passage au domaine.

### Passer ensuite au nom de domaine

1. Créez les enregistrements DNS de l'étape 1 et attendez leur propagation.
2. Sur le serveur, ouvrez le fichier de configuration :
   ```bash
   cd /opt/senbiopest && nano .env
   ```
   - remplacez l'adresse IP de la ligne `DOMAIN=` par votre domaine (ex. `DOMAIN=senbiopest.sn`) ;
   - supprimez les trois lignes `SITE_SCHEME=http`, `CADDYFILE=Caddyfile.ip` et `COOKIE_SECURE=false` ;
   - enregistrez avec `Ctrl+O` puis Entrée, et quittez avec `Ctrl+X`.
3. Relancez :
   ```bash
   bash deploy/deploy.sh --no-pull
   ```
   Le site passe en `https://votre-domaine`, avec certificat. Vos données sont conservées.

## Au quotidien

| Besoin | Commande (dans `/opt/senbiopest`) |
|---|---|
| Mettre à jour le site après un `git push` sur `main` | `bash deploy/deploy.sh` |
| Appliquer une modification de `.env` | `bash deploy/deploy.sh --no-pull` |
| Voir les journaux en direct | `docker compose -f docker/docker-compose.yml --env-file .env logs -f` |
| État des services | `docker compose -f docker/docker-compose.yml --env-file .env ps` |
| Sauvegarde immédiate | `bash deploy/backup.sh` |
| Restaurer une sauvegarde | `bash deploy/restore.sh /var/backups/senbiopest/db-….dump /var/backups/senbiopest/uploads-….tar.gz` |
| Créer un autre admin / réinitialiser un mot de passe | `bash deploy/create-admin.sh` |

## Sauvegardes

- **Chaque nuit à 03:30** : la base (`db-….dump`) et les photos envoyées (`uploads-….tar.gz`)
  dans `/var/backups/senbiopest`, 14 jours conservés. Journal : `/var/backups/senbiopest/backup.log`.
- **Sauvegarde automatique OVH** (option prise avec le VPS) : copie du serveur entier.
- Ces deux sauvegardes restent chez OVH. Copiez de temps en temps la dernière sur votre PC :

  ```powershell
  scp "ubuntu@IP_DU_VPS:/var/backups/senbiopest/db-*.dump" .
  ```

## En cas de problème

| Symptôme | Piste |
|---|---|
| `https://` affiche une erreur de certificat | Le DNS ne pointe pas encore vers le VPS : vérifiez l'étape 1, puis `bash deploy/deploy.sh --no-pull` |
| `permission denied` avec `docker` | Vous ne vous êtes pas reconnecté après l'étape 3 |
| Le build s'arrête (`Killed`, mémoire) | Vérifiez le swap : `swapon --show` ; relancez `bash deploy/deploy.sh --no-pull` |
| Le site ne répond plus | `... ps` puis `... logs --tail=100 api` (commandes du tableau ci-dessus) |
