# Image de base Node.js
FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des sources du frontend
COPY . .

# Exposition du port du serveur de dev Vite/React
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "start"]