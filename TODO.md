# Prompt à donner à une IA — Cours complet sur mon backend ft_transcendence

Je développe le back-end d'un projet appelé ft_transcendence : un jeu
Pierre-Feuille-Ciseaux multijoueur en temps réel. Je suis **débutant en
développement back-end**. Stack : Node.js, TypeScript, Express, Prisma,
PostgreSQL, Socket.io, React (front, géré par un coéquipier).

Je veux que tu me fasses un **cours complet, structuré et pédagogique** sur
toutes les notions que je dois maîtriser pour comprendre en profondeur ce que
j'ai déjà codé — pas juste une liste de définitions, mais des explications
qui partent de zéro, avec des analogies simples, puis qui font le lien direct
avec mon propre code ci-dessous.

## Ce que j'ai déjà implémenté (à utiliser comme fil rouge du cours)

**1. API REST avec Express + TypeScript**
- Routes CRUD sur les sessions de jeu (`POST /session`, `GET /session/:id`,
  `POST /session/:id/move`)
- Validation basique des inputs (vérifier que `playerId`/`move` sont présents
  avant de traiter la requête)

**2. Authentification (email/mot de passe + OAuth)**
- Mot de passe haché et salé avec `bcrypt` (`bcrypt.hash`, `bcrypt.compare`)
- Session utilisateur maintenue avec un token **JWT** (`jsonwebtoken`,
  `jwt.sign`, payload `{ userId, email }`, expiration `1h`)
- OAuth (42/Google) : `findOrCreateOAuthUser`, association d'un compte
  externe via `oauthProvider` + `oauthId`, gestion des conflits de pseudo

**3. Base de données avec Prisma (ORM) + PostgreSQL**
- Modèles `User`, `Game`, `GameMove`, `Tournament`, `TournamentParticipant`
  dans `schema.prisma`, avec relations (`@relation`), enums
  (`GameStatus`, `MoveType`), contraintes d'unicité composites
  (`@@unique([oauthProvider, oauthId])`)
- Requêtes Prisma : `findUnique`, `findMany`, `create`, `update`, et
  transactions atomiques avec `prisma.$transaction([...])` (ex : mettre à
  jour le score Elo du gagnant ET du perdant en une seule opération, sans
  état intermédiaire incohérent en cas d'erreur)

**4. Temps réel avec Socket.io**
- Matchmaking par file d'attente : un joueur en attente (`waitingPlayer`), un
  deuxième qui le rejoint, création d'une session serveur
- Événements `emit`/`on` : `joinQueue`, `matched`, `playMove`, `roundResult`,
  `rejoinSession`, `rejoined`, `leaveQueue`, `queueError`, `moveError`
- **Rooms** Socket.io (`socket.join(sessionId)`) pour isoler la
  communication entre les deux joueurs d'une même partie
- Reconnexion : le client renvoie `rejoinSession` à chaque connexion, le
  serveur retrouve la partie en cours et renvoie l'état actuel

**5. Logique métier du jeu**
- Moteur de règles pur, indépendant du transport (`rules.ts`)
- Machine à états d'un match (`playing` / `finished`, score, vainqueur)
- **Le serveur est la seule source de vérité** : le client ne calcule jamais
  lui-même qui a gagné, il ne fait qu'envoyer son coup et afficher ce que le
  serveur renvoie (anti-triche)
- Timer serveur (`setTimeout`) qui force une résolution de manche si un
  joueur ne joue pas à temps (AFK), fin de partie si 3 manches AFK
  consécutives
- IA (bot) qui prédit le dernier coup humain et essaie de le contrer, plutôt
  qu'un simple choix aléatoire
- Calcul de classement **Elo** après chaque match

**6. Connexion Frontend (React) ↔ Backend**
- Appels REST classiques avec `fetch(..., { credentials: "include" })` pour
  envoyer le cookie de session
- Client `socket.io-client` : ouverture d'une seule connexion, écouteurs
  d'événements, `useRef` (et pas `useState`) pour les valeurs lues à
  l'intérieur des callbacks socket (piège des closures React figées)
- Un flux complet : clic sur "Commencer" → `joinQueue` → écran de recherche
  ou passage direct au jeu si un adversaire attend déjà ou si une partie est
  déjà en cours (rejoin automatique)

## Ce que je veux dans le cours

Pour chaque notion ci-dessus, structure ta réponse ainsi :
1. **Explication simple** de la notion en général (comme si je ne savais
   rien), avec une analogie concrète si utile
2. **Pourquoi ce choix technique** plutôt qu'une alternative évidente (ex :
   pourquoi JWT et pas juste une session en mémoire ? pourquoi Socket.io et
   pas du simple HTTP ? pourquoi un ORM et pas du SQL brut ?)
3. **Le lien avec mon code** : comment cette notion apparaît concrètement
   dans ce que j'ai décrit plus haut
4. **Un piège ou une erreur fréquente** à éviter sur cette notion

Termine par un **glossaire récapitulatif** (une ligne par terme technique
utilisé) et, si pertinent, **2-3 questions** pour vérifier que j'ai compris
avant de continuer sur la suite du projet (tournoi, personnalisation du jeu).
