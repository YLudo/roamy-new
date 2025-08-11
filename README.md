
# Roamy

Roamy est une plateforme web collaborative permettant d'organiser des voyages de groupe : itinéraires, budgets, documents, sondages, et gestion des participants.

## 🚀 Fonctionnalités principales

- Création et gestion de voyages
- Tableau de bord collaboratif
- Suivi des dépenses et remboursements
- Gestion des activités avec carte interactive (Mapbox)
- Intégration bancaire (Plaid)
- Sondages et prise de décision
- Gestion des documents partagés
- Temps réel avec Pusher / WebSockets

---

## 📦 Prérequis techniques

Avant de lancer le projet, assurez-vous d’avoir installé :

- [Node.js](https://nodejs.org/) (version 20+)
- npm (inclus avec Node.js)
- [Docker](https://www.docker.com/) et Docker Compose
- [Git](https://git-scm.com/)

---

## 🔧 Installation

```bash
# 1. Cloner le projet
git clone https://github.com/YLudo/roamy-new.git
cd roamy-new

# 2. Installer les dépendances
npm install

# 3. Lancer PostgreSQL avec Docker
docker-compose up -d

# 4. Créer un fichier d'environnement
cp .env.example .env.local
# → Renseigner vos clés API et paramètres

# 5. Lancer l'application en développement
npm run dev
```

---

## ⚙️ Scripts disponibles
`npm run dev` # Lancer en mode développement
`npm run build` # Construire pour la production
`npm run start` # Lancer en production 
`npm run lint` # Vérifier la qualité du code npm run test  # Lancer les tests unitaires

---

## 📦 Déploiement

Le projet utilise **Vercel** pour le déploiement continu.
-   **Production** → branche `main`
-   **Staging** → branche `dev`
-   **Preview** → toute Pull Request

Rollback possible directement depuis l’interface Vercel.

---

## 📜 Licence
Ce projet est sous licence MIT.