# TODO — Backend (Pierre-Feuille-Ciseaux)

Périmètre : voir [CLAUDE.md](./CLAUDE.md). Ce fichier ne couvre que le back-end
(API, base de données, auth, temps réel, logique de jeu, IA, tournoi).
Front-end / Docker / déploiement = hors périmètre (autre membre).

Convention de dossier à valider avec l'équipe : le front est dans
`pfc-frontend/` (branche `front-end_base`) → proposition : `pfc-backend/`
pour le back, à la racine du repo.

Ordre = dépendances logiques entre modules (un module "Gaming" ne peut pas
démarrer tant que le jeu de base n'est pas fonctionnel).

**Statut actuel (2026-09-15) :** les Phases 1, 2 et 3 (Prisma/DB, Auth,
Temps réel) sont gérées par le collègue qui s'occupe de la base de données —
Phase 1 est déjà faite et mergée. Je pars directement sur la **Phase 4**
(le jeu). Détail des phases 1-3 dans "Hors périmètre" en bas du fichier.

## Phase 0 — Setup projet (fondation technique)
- [x] Créer le dossier `pfc-backend/`
- [x] `package.json` + TypeScript (`tsconfig.json`)
- [x] Serveur Express minimal + route `/health`
- [x] `.env` (ignoré par Git) + `.env.example`
- [x] Rechargement à chaud en dev (`ts-node-dev`)

## Phase 4 — Jeu Pierre-Feuille-Ciseaux (base) — 👉 Point de départ actuel
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

## Total visé
2 (framework backend) + 2 (real-time) + 1 (ORM) + 2 (user mgmt) + 1 (OAuth)
+ 2 (AI) + 2 (jeu de base) + 2 (remote players) + 1 (tournoi) + 1 (customization)
= **16 points**

## Hors périmètre (autres membres)
- Front-end (React)
- Dockerfile / docker-compose / déploiement
- Pages Politique de confidentialité / CGU (contenu, mais doivent pouvoir
  appeler le back si besoin de stocker un consentement, à voir plus tard)
- **Schéma de données & ORM (Prisma)** — fait, mergé (collègue DB) —
  couvre Use an ORM (mineur, 1pt)
- **Authentification & gestion utilisateurs** — géré par le collègue DB —
  couvre Standard user management (majeur, 2pts)
- **Temps réel (Socket.io)** — géré par le collègue DB —
  couvre Real-time features (majeur, 2pts)
