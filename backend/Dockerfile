# Image de base Node.js
FROM node:20-slim

# Dossier de travail dans le conteneur
WORKDIR /app

# Outils OpenSSL requis par Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Copie des fichiers de dépendances
COPY package*.json ./
COPY schema.prisma ./prisma/schema.prisma

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Build du projet TypeScript
RUN npm run build

# Exposition du port backend (pour la communication interne Docker avec Caddy/Nginx)
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "start"]