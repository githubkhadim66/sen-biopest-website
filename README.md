# Sen Biopest — plateforme web & back-office

Plateforme web complète pour une société de **biopesticides** au Sénégal : un
site public (catalogue de produits, cultures & ravageurs ciblés, formations,
demandes de devis et d'accompagnement technique) et un **back-office** de gestion
des demandes, des produits, des formations, des partenariats et du contenu.

> ⚠️ **Statut** : code source complet, **non encore déployé**. Une démo vidéo
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

## 🚀 Démarrage rapide

### Option 1 — Docker (recommandé)

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up --build
```

- Web : http://localhost:3000
- API : http://localhost:3001/api
- Base PostgreSQL : `localhost:5432` (`postgres` / `postgres`)

### Option 2 — en local

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.example .env            # renseigner DATABASE_URL et les secrets JWT

# 3. Base de données
pnpm db:generate                # génère le client Prisma
pnpm db:push                    # applique le schéma à la base
pnpm db:seed                    # (optionnel) jeu de données de démonstration

# 4. Lancer le web + l'API en parallèle
pnpm dev
```

- Web : http://localhost:3000
- API + docs **Swagger** : http://localhost:3001/api

## 🔧 Scripts

| Commande | Effet |
| --- | --- |
| `pnpm dev` | Lance web + api en développement (Turborepo) |
| `pnpm build` | Build de toutes les applications |
| `pnpm lint` | Lint de l'ensemble du monorepo |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:push` | Synchronise le schéma avec la base |
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

## 🚢 Déploiement

Les images Docker (`docker/Dockerfile.web`, `docker/Dockerfile.api`) et le
`docker-compose.yml` permettent un déploiement conteneurisé. Le projet n'est pas
encore déployé publiquement.

## 👤 Auteur

**Khadim Touré** — Ingénieur IA & développeur full-stack
· [GitHub](https://github.com/githubkhadim66)
· [LinkedIn](https://www.linkedin.com/in/khadim-toure-024a41246/)
