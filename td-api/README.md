# td-api

Dépôt Git autonome de l'API TD (Gateway et six microservices FastAPI). Le site React est dans un AUTRE dépôt : `td-frontend`.

1. Ouvrir ce dossier **seul** dans Cursor.
2. Lire `AGENTS.md`, `ARCHITECTURE_BACKEND.md` et `CAHIER_DES_CHARGES_TD.md`.
3. Débuter uniquement par la phase 0 : infrastructure et squelettes, pas la logique métier.
4. Exposer la Gateway via variable d'environnement et versionner `contracts/openapi/`.
5. Utiliser un dépôt Git distinct de `td-frontend`.

## Premier prompt Cursor
« Lis les trois fichiers de consignes. Initialise uniquement le dépôt `td-api` : gateway FastAPI, six microservices isolés, six bases PostgreSQL, RabbitMQ, Docker Compose et healthchecks. Aucun code React. Publie les futurs contrats REST dans `contracts/openapi/`. Après chaque réponse, fournis tes recommandations UX, techniques et de sécurité. »
