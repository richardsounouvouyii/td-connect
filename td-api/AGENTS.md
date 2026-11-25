# AGENTS.md — TD API (dépôt autonome)

Tu travailles EXCLUSIVEMENT dans le dépôt Git `td-api`. N'ajoute aucun composant React ni Vite. Lis `ARCHITECTURE_BACKEND.md` et `CAHIER_DES_CHARGES_TD.md`.

## Architecture impérative
- Python 3.12+, FastAPI, PostgreSQL, RabbitMQ ; API Gateway et SIX microservices indépendants : `identity-service`, `establishment-service`, `academic-service`, `scheduling-service`, `resource-service`, `notification-service`.
- Une base PostgreSQL et des migrations Alembic privées par service ; pas d'accès SQL interservices ni ORM partagé.
- Services autonomes, conteneurs Docker et tests séparés, pas de monolithe masqué.
- REST interne pour décisions synchrones et RabbitMQ avec outbox/inbox, acquittements, retry/DLQ et idempotence pour événements ; jamais RabbitMQ pour garantir une réservation en temps réel.
- Gateway seul point d'accès public. Chaque service revalide les autorisations sensibles et l'établissement.
- `contracts/openapi/` est le seul contrat externe consommé par `td-frontend` (dépôt Git distinct). Publier version et changelog ; ne jamais exiger un import de code Python dans React.
- Aucun travail à domicile, présence ni compte rendu pédagogique en V1. Aucun paiement, tutorat, chat, cours en ligne ou upload d'élève.
- Fichiers pédagogiques privés : PDF/images, métadonnées et politiques de visibilité ; publication programmée des corrigés.

## Phases
P0 structure des microservices, Docker Compose, RabbitMQ et six bases isolées, healthchecks et tests ; P1 identity ; P2 établissements/academics ; P3 scheduling et non-chevauchement ; P4 resources ; P5 notifications événements ; P6 hardening et tests intégration. Ne jamais passer à la phase suivante sans approbation.

## FORMAT OBLIGATOIRE DE CHAQUE RÉPONSE À L’UTILISATEUR
Après CHAQUE réponse, y compris configuration, correction de bug ou analyse, terminer par ces cinq rubriques explicites :
1. **Travail réalisé et tests** : fichiers créés/modifiés, commandes exécutées et résultat réel ; ne jamais inventer un test passé.
2. **Recommandations UX** : 1 à 3 recommandations concrètes liées à l'étape (pour l'API, préciser les impacts UX de l'API).
3. **Recommandations techniques** : 1 à 3 points sur architecture, maintenabilité, performance ou qualité.
4. **Recommandations sécurité** : 1 à 3 risques/mesures pertinents pour les mineurs et les comptes établissements.
5. **Prochaine étape proposée** : attendre la validation de l'utilisateur avant toute phase suivante.
Si aucune suggestion nouvelle n'est pertinente, écrire « Aucune recommandation supplémentaire à cette étape » dans la rubrique correspondante.
