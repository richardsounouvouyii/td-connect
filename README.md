# TD CONNECT

Monorepo local regroupant les deux parties du projet :

| Dossier | Rôle |
|---------|------|
| `td-frontend/` | Application React (Vite, TypeScript) |
| `td-api/` | Spécifications / futur backend (Gateway + microservices) |

## Démarrer le frontend

```bash
cd td-frontend
npm install
cp .env.example .env   # si besoin
npm run dev
```

Compte démo élève (mocks) : `eleve@demo.td` / `demo1234`  
(`VITE_ENABLE_MOCKS=true` dans `.env`)

## Build

```bash
cd td-frontend
npm run build
npm test
```

## Notes

- Le front parle à l’API uniquement via `VITE_API_BASE_URL` (Gateway).
- Les deux dossiers restent séparés pour un déploiement indépendant plus tard.
