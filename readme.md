# 🖼️ Three.js – Environment map 🌐

Illustration de plusieurs fonctionnalités relatives aux environment maps avec [Three.js](https://threejs.org/), inspirée du parcours Three.js Journey par Bruno Simon.

<img src="./docs/scene.png" alt="Aperçu de la scène" width="480"/>

## 🚀 Démo

[Voir la démo](https://rekuiem84.github.io/environment-map/)

## Fonctionnalités

- Chargement et application d'une environment map
- Réflexions réalistes sur les matériaux, notamment de la lumière

## 🛠️ Installation & Lancement

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/Rekuiem84/environment-map
   cd environment-map
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

3. **Lancer le serveur :**

   ```bash
   npm run dev
   ```

4. **Build pour la production :**

   ```bash
   npm run build
   ```

   Les fichiers optimisés seront générés dans le dossier `dist/`.

## 📁 Structure du projet

```
├── src/           # Fichiers sources
├── static/        # Fichiers statiques (models et environment maps)
├── dist/          # Fichiers générés pour la production
├── package.json   # Dépendances et scripts
└── vite.config.js # Configuration Vite
```

## 🔗 Mes autres projets Three.js

- [Repo Three.js Journey principal](https://github.com/Rekuiem84/threejs-journey) — pour retrouver tous mes projets suivant ce parcours
