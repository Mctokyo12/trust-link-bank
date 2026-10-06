# Trust Link Bank — Plateforme Bancaire Multi-Devises Panafricaine

Architecture modulaire avec séparation stricte du **Frontend** et du **Backend**.

---

## 📁 Structure du Projet

```text
.
├── frontend/                   # Application Web React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/                    # Composants, pages, store Zustand, services API, i18n
│   ├── public/                 # Fichiers statiques et logos
│   ├── index.html              # Point d'entrée HTML
│   ├── package.json            # Dépendances & scripts du frontend
│   ├── vite.config.ts          # Configuration Vite
│   ├── tsconfig.json           # Typage TypeScript
│   └── Dockerfile              # Conteneur Node.js pour production/dev
│
├── backend/                    # API RESTful Laravel 12 + MySQL + Redis
│   ├── app/                    # Modèles, Contrôleurs API, Services métiers (Ledger, FX, P2P)
│   ├── bootstrap/              # Démarrage Laravel
│   ├── config/                 # Configurations (app, database, cors, auth)
│   ├── database/               # Migrations, seeders, SQLite/MySQL
│   ├── public_api/             # Point d'entrée HTTP (index.php)
│   ├── routes/                 # Routes API REST (/api/v1/...)
│   ├── storage/                # Cache, sessions, journaux
│   ├── tests/                  # Tests unitaires et d'intégration
│   ├── composer.json           # Dépendances PHP/Laravel
│   └── Dockerfile              # Image PHP 8.3-FPM avec extensions MySQL, Redis, BCMath
│
├── docker/                     # Configurations Nginx et conteneurs
│   └── nginx/default.conf      # Reverse proxy Nginx pour le backend Laravel
├── docker-compose.yml          # Orchestration complète : frontend, backend, mysql, redis, nginx
└── package.json                # Orchestrateur monorepo (npm workspaces)
```

---

## 🚀 Démarrage Rapide

### 1. Développement Frontend (Studio / Local)
```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement (Port 3000)
npm run dev

# Compiler pour la production
npm run build

# Linter le code TypeScript
npm run lint
```

### 2. Déploiement Complet avec Docker Compose (Full-Stack)
```bash
docker compose up -d --build
```
- **Frontend** : `http://localhost:3000`
- **Backend API (Nginx)** : `http://localhost:8000/api`
- **Base de données MySQL** : `localhost:3306` (Base: `trustlinkbank_db`)
- **Cache & Queues Redis** : `localhost:6379`
