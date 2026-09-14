# TODO — Backend (Pierre-Feuille-Ciseaux)

Périmètre : voir [CLAUDE.md](./CLAUDE.md). Ce fichier ne couvre que le back-end
(API, base de données, auth, temps réel, logique de jeu, IA, tournoi).
Front-end / Docker / déploiement = hors périmètre (autre membre).

Convention de dossier à valider avec l'équipe : le front est dans
`pfc-frontend/` (branche `front-end_base`) → proposition : `pfc-backend/`
pour le back, à la racine du repo.

Ordre = dépendances logiques entre modules (un module "Gaming" ne peut pas
démarrer tant que le jeu de base n'est pas fonctionnel).

## Phase 0 — Setup projet (fondation technique)
- [x] Créer le dossier `pfc-backend/`
- [x] `package.json` + TypeScript (`tsconfig.json`)
- [x] Serveur Express minimal + route `/health`
- [x] `.env` (ignoré par Git) + `.env.example`
- [x] Rechargement à chaud en dev (`ts-node-dev`)

## Phase 1 — Schéma de données & ORM (Prisma)
- [ ] ⚠️ Le serveur PostgreSQL lui-même (installation, Docker) n'est **pas** géré ici
      → fourni par le membre Docker/devops, je récupère juste une `DATABASE_URL`
- [ ] Installer Prisma, `schema.prisma`
- [ ] Modèle `User` (email, mot de passe hashé, etc.)
- [ ] Première migration
- Couvre : **Use an ORM** (mineur, 1pt)

## Phase 2 — Authentification & gestion utilisateurs
- [ ] Inscription / connexion email + mot de passe (hash + salt, bcrypt ou argon2)
- [ ] Validation des inputs (ex. zod) côté back
- [ ] Sessions ou JWT
- [ ] Endpoints profil (voir/modifier ses infos)
- [ ] Upload avatar (avec avatar par défaut)
- [ ] Système d'amis (ajouter/retirer/lister)
- [ ] Statut en ligne
- Couvre : obligatoire (auth de base) + **Standard user management** (majeur, 2pts)

## Phase 3 — Temps réel (Socket.io)
- [ ] Serveur Socket.io + authentification à la connexion
- [ ] Gestion connexion / déconnexion propre
- Fondation pour : **Real-time features** (majeur, 2pts) et le jeu

## Phase 4 — Jeu Pierre-Feuille-Ciseaux (base)
- [ ] Moteur de règles pur (rounds, condition de victoire), indépendant du transport
- [ ] Gestion d'un match / session 1v1
- [ ] Intégration temps réel via Socket.io
- Couvre : **Complete web-based game** (majeur, 2pts)
- ⚠️ Prérequis pour toutes les phases suivantes (5 à 8)

## Phase 5 — Joueurs à distance
- [ ] Matchmaking simple (file d'attente)
- [ ] Synchronisation de l'état de partie entre les deux clients
- [ ] Reconnexion après déconnexion
- Couvre : **Remote players** (majeur, 2pts)

## Phase 6 — IA adverse
- [ ] Bot utilisant le moteur de règles (Phase 4)
- [ ] Comportement non parfait (simule un humain)
- Couvre : **AI opponent** (majeur, 2pts)

## Phase 7 — Tournoi
- [ ] Inscription, bracket, matchmaking entre participants
- Couvre : **Tournament** (mineur, 1pt)

## Phase 8 — Personnalisation du jeu
- [ ] Options de partie (ex. best-of-N, variantes de règles)
- Couvre : **Game customization** (mineur, 1pt)

## Phase 9 — OAuth
- [ ] OAuth 2.0 (Google / GitHub / 42) en complément de email+mdp
- Couvre : **OAuth** (mineur, 1pt)

## Total visé
2 (framework backend) + 2 (real-time) + 1 (ORM) + 2 (user mgmt) + 1 (OAuth)
+ 2 (AI) + 2 (jeu de base) + 2 (remote players) + 1 (tournoi) + 1 (customization)
= **16 points**

## Hors périmètre (autres membres)
- Front-end (React)
- Dockerfile / docker-compose / déploiement
- Pages Politique de confidentialité / CGU (contenu, mais doivent pouvoir
  appeler le back si besoin de stocker un consentement, à voir plus tard)
