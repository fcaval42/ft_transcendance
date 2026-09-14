brew install node (MAC) :
    J'ai commencé par installer Node.js pour avoir node + npm + npx


1. npx create-react-app pfc-frontend --template typescript

pfc-frontend/
├── node_modules/       # Toutes les dépendances npm (React, TypeScript, etc.)
├── public/             # Fichiers statiques (HTML, images, etc.)
│   ├── index.html      # Point d'entrée HTML
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/                # Code source de ton application
│   ├── App.css         # Styles pour le composant App
│   ├── App.tsx         # Composant principal (en TypeScript)
│   ├── App.test.tsx    # Tests pour App
│   ├── index.css       # Styles globaux
│   ├── index.tsx       # Point d'entrée de l'application (montage du DOM)
│   ├── logo.svg        # Logo React
│   └── react-app-env.d.ts # Déclarations TypeScript pour create-react-app
├── .gitignore          # Fichiers à ignorer pour Git
├── package.json        # Dépendances et scripts npm
├── tsconfig.json       # Configuration TypeScript
└── README.md           # Documentation du projet

Fichiers clés :

- public/index.html = seul fichier HTML de l'appli. Il contient
une <div id="root"> où React va monter l'appli.

- src/index.tsx = point d'entrée de l'appli. Utilise ReactDOM.createRoot pour injecter le composant App dans le DOM. 

- src/App.tsx = composant principal. Par défaut, il contient un exemple avec le logo React et un lien vers la documentation.

-> pour démarrer le serveur de dvlpt et voir l'appli dans le navigateur : 
cd pfc-frontend
npm start

cela lancera un serveur local sur http://localhost:3000.
!!! toute modification dans le code sera automatiquement rechargée dans le navigateur. 

EN GROS =  on va modifier le fichier App.tsx pour modifier le site. 
On a Typescript et React et on va modifier le code des fichiers qui ont été générés. 

Tu as un projet généré (probablement avec create-react-app ou un outil similaire) qui utilise React (pour construire l'interface) et TypeScript (pour typer le code et éviter les erreurs).
Le fichier App.tsx est le point d'entrée principal de ton application React. C'est là que tu définis ce qui s'affiche à l'écran.

Modifier App.tsx :
Ce fichier contient le code qui décrit ce que l'utilisateur voit (ex : un titre, un bouton, une liste, etc.).
Tu peux l'éditer pour :Changer le contenu (ex : remplacer un texte).
Ajouter des composants (ex : un formulaire, une image).
Modifier le style ou la logique (ex : afficher une liste dynamique).

La base du projet a déjà été générée (avec React et TypeScript) via un outil comme create-react-app.
ex:  C'est comme avoir une maison déjà construite : tu peux rénover les pièces, ajouter des meubles ou changer la décoration, mais les fondations sont déjà là.


# Explications index.tsx

Point de départ qui lance l'appli React dans le navigateur.

1. import React from 'react';
-> importe la biblio React, nécessaire pour écrire du JSX (le HTML-like dans React).

2. import ReactDom from 'react-dom/client';
-> importe ReactDOM qui permet de lier React au DOM (structure HTML de la page).

3. import App from './App';
-> importe le composant principal de l'appli.

4. const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
-> crée un point d'accroche (root) dans le DOM, en ciblant l'élément HTML avec l'id="root"
-> as HTMLElement est une assertion TypeScript pour dire "je suis sûr que cet élément existe et est un HTMLElement".

5.root.render(...)
-> affiche l'application React dans le DOM, à l'endroit où se trouve la <div id="root>.
-> <React.StrictMode> est un outil de dvlpt qui détecte pb potentiels (ex: effets de bord, API dépréciées) et optimise le code.
-> <App /> est le composant principal: tout ce qu'il rendra sera affiché dans la page. 

POUR LANCER : npm install (si pas encore fait)
npm start