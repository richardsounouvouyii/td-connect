# Deux dépôts Git distincts

- `td-frontend` : dépôt Git A, site React.
- `td-api` : dépôt Git B, API Gateway, six microservices et RabbitMQ.

Créer DEUX dépôts GitLab/GitHub vides séparés, puis déposer chaque dossier dans son propre dépôt. Ne pas faire `git init` à la racine de ce pack ZIP.

Exemple de travail local :
```text
Projets/
  td-frontend/   # git remote origin = URL du dépôt frontend
  td-api/        # git remote origin = URL du dépôt backend
```

Les deux projets peuvent être ouverts dans deux fenêtres Cursor. Le frontend parle à la Gateway par URL HTTP, pas par import de fichiers. L'API publie un contrat OpenAPI versionné; le frontend génère son client TypeScript. CI/CD et déploiement indépendants.

Dans chaque dépôt, le fichier `AGENTS.md` impose après chaque réponse : bilan/tests, recommandations UX, recommandations techniques, recommandations sécurité et prochaine étape.
