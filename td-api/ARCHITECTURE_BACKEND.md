# TD — Instructions impératives pour Cursor : BACKEND FASTAPI / MICROSERVICES

**Version :** 1.0 — 25 novembre 2026  
**Périmètre :** TD uniquement, indépendant de CHAPITRE+.  
**Source :** `CAHIER_DES_CHARGES_TD.md`. Le frontend réside dans un dépôt Git **indépendant** `td-frontend`; publier des contrats REST versionnés pour lui.

## 1. Mission et contraintes non négociables

Concevoir et implémenter une architecture **microservices séparés et exécutables** avec Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PostgreSQL et RabbitMQ. L'API Gateway est le seul point d'entrée du frontend React. Les services ont leurs propres conteneurs, configurations, migrations, tests, données et responsabilités.

**Hors V1 (interdits) :** travaux à domicile, pointage des présences, compte rendu pédagogique formateur, paiements, tutorat payant, demandes « chapitre non compris », évaluations en ligne, cours en ligne, upload de l'élève. Ne créer ni service, ni table, ni événement, ni endpoint pour ces fonctions. Le `scheduling-service` gère seulement la clôture **administrative** de séance.

## 2. Périmètre de chaque microservice — 6 services

| Service | Propriété et fonctionnalités | Stockage détenu |
|---|---|---|
| `identity-service` | utilisateurs, authentification, rôles, appartenances établissements, sessions | `identity_db` |
| `establishment-service` | établissements, salles, équipements, indisponibilités, horaires/règles d'école | `establishment_db` |
| `academic-service` | années, niveaux, séries, classes, groupes, élèves inscrits, matières, chapitres, affectations formateurs | `academic_db` |
| `scheduling-service` | disponibilités formateurs, propositions TD, réservations de créneaux, validations, reports, annulations et audit administratif | `scheduling_db` |
| `resource-service` | épreuves, corrigés liés, stockage privé, audiences, visibilité, versions | `resource_db` |
| `notification-service` | boîte de réception, préférences, traitements asynchrones et tentatives de livraison | `notification_db` |

**Isolation réelle :** une base (ou schéma à rôles strictement isolés) par service, comptes PostgreSQL propres ; pas d'écriture ni de lecture de tables d'un autre service. Pas de jointures SQL interservices, pas de modèles ORM communs entre services. Références interservices par UUID ; validation des références par API ou projections alimentées par événements. Pas de base partagée par simplicité.

**Service de planification propriétaire des allocations :** il gère atomiquement dans **sa propre base** les créneaux réservés pour formateur, salle et groupe, avec identité de ressource et établissement ; ainsi les chevauchements inter-écoles du formateur sont testés transactionnellement au même endroit. Les informations propriétaires sur salles, classes et habilitations sont contrôlées par les services référents via API. Documenter la fenêtre de cohérence et revalider au commit.

## 3. Structure du dépôt backend indépendant obligatoire

```text
td-api/
  AGENTS.md
  CAHIER_DES_CHARGES_TD.md
  ARCHITECTURE_BACKEND.md
  gateway/
    app/main.py
    app/core/
    app/clients/
    tests/
    Dockerfile
  services/
    identity-service/
    establishment-service/
    academic-service/
    scheduling-service/
    resource-service/
    notification-service/
  contracts/
    openapi/              # schémas publiés pour td-frontend
    events/               # événements versionnés
  infra/
    rabbitmq/
    postgres/
    monitoring/
  docs/
    architecture.md
    ownership.md
    api.md
    events.md
    decisions.md
    runbook.md
  docker-compose.yml
  .env.example
  README.md
```

Dans chaque service : `app/main.py`, `app/api/v1/`, `app/core/`, `app/domain/`, `app/application/`, `app/infrastructure/`, `alembic/`, `tests/`, `Dockerfile`, `pyproject.toml` ou `requirements.txt`. Appliquer une **architecture en couches pragmatique** : règles métier isolées de FastAPI et du broker ; ne pas créer d'abstraction vide.

## 4. Gateway et contrats REST

- Gateway reçoit `/api/v1/*`, authentifie, applique politiques appropriées, transmet identité/établissement via mécanisme sûr ; **chaque microservice revérifie les autorisations sensibles** (zéro confiance dans des en-têtes clients forgés).
- Timeouts, gestion d'erreurs, correlation-id, limites de requêtes, CORS ciblé ; ne pas laisser les microservices accessibles publiquement par défaut.
- Documentation OpenAPI par service, contrats partagés versionnés (schémas/DTO/événements, pas modèles de base). Réponses d'erreur : code stable, message français exploitable, request_id, détails de validation non sensibles.
- Endpoints proposés (à confirmer avant développement complet) :
  - `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` ;
  - `GET/POST /api/v1/establishments`, `GET/POST /api/v1/rooms` ;
  - `GET/POST /api/v1/classes`, `GET/POST /api/v1/groups`, `GET/POST /api/v1/subjects` ;
  - `GET/POST /api/v1/availability`, `GET/POST /api/v1/sessions`, `POST /api/v1/sessions/{id}/submit`, `POST /api/v1/sessions/{id}/approve`, `POST /api/v1/sessions/{id}/reschedule`, `POST /api/v1/sessions/{id}/cancel` ;
  - `GET/POST /api/v1/resources`, `POST /api/v1/resources/{id}/publish`, `GET /api/v1/resources/{id}/download` ;
  - `GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`.
- Les endpoints listés sont une proposition de **contrat**, pas l'autorisation d'inventer des règles. Définir pagination, filtrage, validation, idempotency key et codes d'erreur.

## 5. RabbitMQ : usage précis et fiable

- REST synchrone pour les **décisions critiques** (permissions, contrôle d'habilitation, réservation) ; RabbitMQ **uniquement** pour propager les événements et orchestrer les effets asynchrones (notifications, projections, audit).
- Exchange topic durable `td.domain.v1`; routage versionné tel que `td.session.published.v1`, `td.session.rescheduled.v1`, `td.session.cancelled.v1`, `td.resource.published.v1` ; chaque consommateur possède sa queue dédiée.
- Message JSON versionné : `event_id` (UUID), `event_type`, `schema_version`, `occurred_at` UTC, `correlation_id`, `aggregate_id`, `establishment_id`, `payload` minimal sans données nominatives non nécessaires.
- Publication par **transactional outbox** dans la base propriétaire ; worker de relayage avec publisher confirms. Chaque consommateur utilise une **inbox/idempotency table** et acquitte seulement après transaction locale réussie.
- Retries avec délais bornés, DLQ, traçabilité, alertes et procédure de relecture ; les événements peuvent être livrés plusieurs fois et hors ordre : gérer doublons/version d'agrégat.
- Aucun partage de transaction SQL entre microservices ; opérations longues par état explicite et compensation documentée.
- Protection RabbitMQ : utilisateurs/vhosts séparés, secrets d'environnement, TLS en production, moindre privilège, management UI non exposée publiquement.

### Exemples de flux

1. `scheduling-service` approuve une séance dans une transaction locale, inscrit `td.session.published.v1` dans outbox ; worker publie ; `notification-service` consomme et prépare les notifications pour les élèves autorisés.
2. `resource-service` passe un corrigé à visible après `visible_at` et contrôle audience ; événement `td.resource.published.v1` → notification.
3. Report/annulation : réallocation atomique des créneaux par `scheduling-service`, événement, traitement asynchrone des notifications. **Ne pas confirmer un report sans avoir sécurisé le nouveau créneau.**

## 6. Machine d'états des TD et documents

- Séance : `DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` ; `REJECTED` et `CANCELLED` selon transitions autorisées ; `RESCHEDULED` traité comme événement/historique ou état transitoire documenté ; `COMPLETED` uniquement administratif.
- Les transitions interdites renvoient HTTP 409 ou 422 et sont testées. Les motifs de rejet, report, annulation sont audités.
- Épreuve : `DRAFT`, `SCHEDULED`, `PUBLISHED`, `WITHDRAWN` ; corrigé **lié à une épreuve**, `visible_at` côté serveur. Une URL copiée ne contourne pas les droits ni la date.
- Upload réservé au formateur habilité et à l'admin qui dispose de la permission explicite ; les élèves seulement GET autorisé.

## 7. Sécurité incontournable

- RBAC + ABAC : rôle, école, classe/groupe, affectation formateur et possession des ressources. Prévenir IDOR/BOLA systématiquement, y compris sur UUID et téléchargement.
- Auth : Argon2id, limitation tentatives, gestion de sessions/refresh sécurisé, invalidation, MFA administrateur lorsque possible ; cookies HttpOnly/Secure/SameSite si modèle retenu, CSRF adapté.
- Multi-écoles : `establishment_id` imposé côté serveur, filtré dans toutes les requêtes ; un admin scolaire ne voit que son école.
- Documents privés : validation extension + MIME réel, taille limite, anti-malware si disponible, noms aléatoires, stockage objet non public, URL signée brève ou proxy contrôlé, suppression/versionnage journalisés.
- Données de mineurs minimales, pas de listes d'élèves publiques, aucun secret dans logs, pas de données personnelles superflues dans RabbitMQ.
- Postgres : migrations Alembic propres à chaque service ; transactions/contraintes/exclusion pour empêcher chevauchement, uniques/index ; UTC, identifiants UUID ; sauvegarde + test de restauration.
- Mécanisme de health `/health/live` et `/health/ready` (ready vérifie uniquement les dépendances nécessaires). Journalisation structurée, métriques, `correlation_id`, traçage distribué optionnel documenté.
- Ne jamais prétendre la conformité juridique acquise sans vérification ; prévoir audit de protection des données applicable au Bénin.

## 8. Tests et critères de vérification

- `pytest`, tests unitaires métiers, intégration FastAPI, contrats entre services, RabbitMQ integration tests, vérification des migrations, tests de concurrence.
- Cas prioritaires : double réservation de salle/groupe/formateur en concurrence ; formateur présent dans 2 écoles ; accès admin école A aux données école B interdit ; accès élève à corrigé non publié interdit ; upload élève interdit ; consumer traite un événement en double sans doublonner notifications.
- Tests de résilience : service indisponible, retry/outbox, redémarrage broker, DLQ, timeouts ; ne jamais annoncer « opération réussie » avant confirmation de l'état source.
- CI : format/lint/typecheck (`ruff`, `mypy` ou pyright selon projet), pytest, scan dépendances, tests contrats ; Docker Compose local avec health checks.

## 9. Ordre de développement backend

- B0 : monorepo, gateway, 6 services squelettes réels, bases isolées, RabbitMQ, Compose, health/ready, logs, `.env.example`, README PowerShell.
- B1 : Identity + établissements + permissions multi-écoles ; migrations et tests accès.
- B2 : Academic : années, classes, groupes, élèves, affectations ; tests séparation écoles.
- B3 : Scheduling : disponibilités, allocations atomiques, workflow validation/rejet/report/annulation ; outbox et premiers événements.
- B4 : Resource : stockage privé, épreuves/corrigés, visibilité, signed downloads, tests IDOR.
- B5 : Notifications : consommateurs idempotents, DLQ, boîte de réception ; monitoring.
- B6 : sécurité, tests de concurrence/résilience, observabilité, documentation de déploiement pilote.

Pour chaque phase, inclure migrations, jeux de données de développement isolés, commandes `docker compose` et PowerShell, tests exécutés, scripts de rollback et documentation. **Attendre l'approbation avant la phase suivante.**

## 10. Format obligatoire de CHAQUE réponse de Cursor

Conclure **chaque réponse**, quel que soit le sujet, avec les rubriques suivantes :

1. **Travail réalisé / preuves :** fichiers réellement créés ou modifiés, migrations, endpoints, commandes et résultats exacts des tests ; ne pas inventer un résultat.
2. **Recommandations UX :** implications visibles pour les élèves/formateurs/admins, temps d'attente, libellés, erreurs et feedback mobile. Même en backend, proposer au moins une amélioration UX réellement liée à l'API en cours ou indiquer qu'aucune n'est pertinente.
3. **Recommandations techniques :** séparation des responsabilités, performance, contrats, disponibilité, cohérence, observabilité et dette technique (obligatoire vs optionnel).
4. **Recommandations sécurité :** contrôle d'accès, isolation des données scolaires, protection des mineurs, authentification, RabbitMQ, documents privés et secrets ; signaler clairement les risques.
5. **Étape suivante / validation demandée :** une action précise ; ne pas avancer sans autorisation.

Les recommandations doivent être **spécifiques et actionnables**, sans listes génériques répétées. Une recommandation qui modifie le métier, les coûts ou l'architecture est seulement **proposée** et non implémentée sans autorisation.

## 11. Premier prompt recommandé

> Lis intégralement `CAHIER_DES_CHARGES_TD.md`, `BACKEND_MICROSERVICES_CURSOR.md` et `FRONTEND_CURSOR.md`. Réalise uniquement B0 : gateway + six services FastAPI séparés, PostgreSQL base par service, RabbitMQ, Docker Compose, healthchecks, migration initiale, contrat événementiel minimal et tests smoke. Explique PowerShell Windows, donne les résultats réellement exécutés et termine par les 3 catégories de recommandations. Attends ma validation.
