# Sen Biopest — plateforme web & back-office

Plateforme web complète pour une société de **biopesticides** au Sénégal : un
site public (catalogue de produits, cultures & ravageurs ciblés, formations,
demandes de devis et d'accompagnement technique) et un **back-office** de gestion
des demandes, des produits, des formations, des partenariats et du contenu.

> ⚠️ **Statut** : code source complet et prêt pour la production (voir [Mise en production](#-mise-en-production)), **non encore déployé**. Une démo vidéo
> (`senbio`) est disponible — voir la section [Démo](#-démo).

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000?logo=nextdotjs">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-9-f69220?logo=pnpm">
</p>

## ✨ Fonctionnalités

**Site public**
- Catalogue de **produits** (bénéfices, matières actives, dosage, précautions),
  classés par **catégorie**, **culture** et **ravageur** ciblés.
- Pages **formations** avec inscription en ligne.
- Formulaires : demande de **devis / commande / échantillon / rappel**,
  **accompagnement technique** (avec photos), **partenariat**, contact.
- Boutons d'appel à l'action **WhatsApp** et suivi des clics (analytics CTA).
- Contenu géré via un mini-**CMS** (blocs de contenu, FAQ, témoignages, réglages).

**Back-office (authentifié)**
- Rôles : **ADMIN**, **COMMERCIAL**, **CONSEILLER**.
- Suivi des demandes commerciales et techniques (statuts, affectation, notes).
- Gestion des produits, formations, partenariats, médias.
- **Journal d'audit** des actions.

## 🎬 Démo

Une démonstration vidéo (`senbio`) présente le parcours complet.

> 📌 *À compléter :* remplacer par le lien de la vidéo une fois publiée.
> `Démo vidéo : https://…`

## 🏗️ Architecture

Monorepo **pnpm + Turborepo** : deux applications et des paquets partagés.

```
┌──────────────┐   /api/*    ┌──────────────┐        ┌──────────────┐
│  apps/web     │ ─────────▶ │  apps/api     │ ─────▶ │  PostgreSQL   │
│  Next.js 15   │  (REST)    │  NestJS 10    │  Prisma│      16       │
│  React 19     │            │  JWT · Swagger│        └──────────────┘
│  Tailwind     │            │  Multer (up.) │
└──────────────┘            └──────────────┘
        └──── packages/ (types · ui · utils · config) partagés ────┘
```

| Chemin | Rôle |
| --- | --- |
| `apps/web` | Front-end **Next.js 15** (React 19, Tailwind, React Query, React Hook Form + Zod, Framer Motion) |
| `apps/api` | API **NestJS 10** (auth JWT, Swagger, upload Multer, validation class-validator) |
| `packages/types` | Types & schémas partagés entre le web et l'API |
| `packages/ui` | Composants d'interface réutilisables |
| `packages/utils` | Fonctions utilitaires partagées |
| `packages/config` | Configuration partagée (TS, lint…) |
| `prisma/` | Schéma **Prisma**, migrations et *seed* (PostgreSQL) |
| `docker/` | `Dockerfile.api`, `Dockerfile.web`, `docker-compose.yml` |

## 🧰 Stack technique

| Domaine | Technologies |
| --- | --- |
| Front-end | Next.js 15 · React 19 · TypeScript · Tailwind CSS · TanStack Query · React Hook Form · Zod · Framer Motion |
| Back-end | NestJS 10 · Prisma 6 · PostgreSQL 16 · Passport-JWT · class-validator · Swagger · Multer |
| Monorepo | pnpm 9 · Turborepo · TypeScript |
| Infra | Docker · Docker Compose |

## ✅ Prérequis

- **Node.js 20+**
- **pnpm 9** (`npm i -g pnpm`)
- **PostgreSQL 16** (ou Docker)

## 🚀 Démarrage rapide (développement)

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement (copier aussi dans prisma/ et apps/api/)
cp .env.example .env

# 3. Base PostgreSQL locale (ou une instance existante, cf. DATABASE_URL)
docker run -d --name senbiopest-db -e POSTGRES_DB=senbiopest \
  -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine

# 4. Schéma + données de démonstration
pnpm db:generate
pnpm --filter prisma-config exec prisma migrate deploy
pnpm db:seed                    # admin@senbiopest.com / admin123 (démo uniquement)

# 5. Lancer le web + l'API
pnpm dev
```

- Site : http://localhost:3000 — back-office : http://localhost:3000/admin
- API + docs **Swagger** : http://localhost:3001/api/docs

> `pnpm dev` compile chaque page à la première visite : c'est lent par nature.
> Pour juger des performances réelles : `pnpm build` puis lancer les builds.

## 🔧 Scripts

| Commande | Effet |
| --- | --- |
| `pnpm dev` | Lance web + api en développement (Turborepo) |
| `pnpm build` | Build de toutes les applications |
| `pnpm lint` | Lint de l'ensemble du monorepo |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:push` | Synchronise le schéma avec la base (prototypage uniquement) |
| `pnpm db:migrate` | Crée/joue une migration de développement |
| `pnpm db:seed` | Insère les données de démonstration |
| `pnpm db:studio` | Ouvre Prisma Studio |

## 🔐 Variables d'environnement

Toutes les variables sont documentées dans [`.env.example`](./.env.example) :
`DATABASE_URL`, secrets **JWT**, ports, numéro **WhatsApp**, dossier d'upload,
et (optionnels) stockage **S3** et **SMTP**.

> Les fichiers `.env` réels ne sont **pas** versionnés (voir `.gitignore`).
> En production, générer les secrets JWT (`openssl rand -hex 32`).

## 🗂️ Modèle de données (aperçu)

Utilisateurs & rôles · Produits (catégories, images, FAQ, cultures, ravageurs,
tags) · Demandes commerciales · Demandes techniques (avec photos) · Formations &
inscriptions · Partenariats · Messages de contact · CMS (blocs, FAQ, témoignages,
réglages) · Médias · Journal d'audit · Suivi des clics CTA.

Schéma complet : [`prisma/schema.prisma`](./prisma/schema.prisma).

## 🚢 Mise en production

Pile Docker complète dans [`docker/`](./docker) : PostgreSQL, API, site et
**Caddy** (HTTPS automatique). Tout est servi sur **un seul domaine** :
`/api` et `/uploads` vers l'API, le reste vers le site.

1. Un serveur Linux avec Docker, et un enregistrement DNS `A` du domaine vers son IP
   (ports 80 et 443 ouverts).
2. Configurer :
   ```bash
   cp .env.production.example .env   # renseigner DOMAIN, mots de passe et secrets
   ```
3. Démarrer (les migrations de base sont appliquées automatiquement au démarrage de l'API) :
   ```bash
   docker compose -f docker/docker-compose.yml --env-file .env up -d --build
   ```
4. Créer le premier administrateur (pas de données de démo en production) :
   ```bash
   docker compose -f docker/docker-compose.yml exec \
     -e ADMIN_EMAIL=vous@domaine.sn -e ADMIN_PASSWORD='mot-de-passe-long' \
     api node dist/scripts/create-admin.js
   ```
5. Dans **Admin > Paramètres**, renseigner le numéro WhatsApp, le téléphone,
   l'email et l'adresse affichés sur le site.

**Sauvegardes** : la base (`pgdata`) et les fichiers envoyés (`uploads`) sont des
volumes Docker. Exemple de sauvegarde quotidienne de la base :
`docker compose -f docker/docker-compose.yml exec -T db pg_dump -U <user> senbiopest | gzip > backup-$(date +%F).sql.gz`

**Santé** : `GET /api/health` (utilisé par les healthchecks Docker).

## 👤 Auteur

**Khadim Touré** — Ingénieur IA & développeur full-stack
· [GitHub](https://github.com/githubkhadim66)
· [LinkedIn](https://www.linkedin.com/in/khadim-toure-024a41246/)
