# AGENTS.md — TD FRONTEND (dépôt autonome)

Tu travailles EXCLUSIVEMENT dans le dépôt Git `td-frontend`. N'ajoute jamais le backend, RabbitMQ ou PostgreSQL dans ce dépôt. Lis `ARCHITECTURE_FRONTEND.md` et `CAHIER_DES_CHARGES_TD.md`.

## Objectif
Développer une application React + TypeScript + Vite + Tailwind v4 mobile-first pour les rôles STUDENT, TRAINER, SCHOOL_ADMIN et SUPER_ADMIN. Toutes les pages sont en français ; le mobile expose les mêmes fonctionnalités que le desktop. Ne pas développer les travaux à domicile, la présence ni le compte rendu pour la V1.

## Séparation stricte
- Dépôt Git indépendant du backend : historique, CI, version, déploiement et `.env.example` propres.
- Un seul point d'entrée réseau `VITE_API_BASE_URL` vers la Gateway du dépôt `td-api`.
- Contrats OpenAPI versionnés fournis par `td-api` dans `contracts/openapi/`, copiés ou récupérés par release/tag/CI, jamais de dépendance sur le dossier source voisin.
- Configurer un client HTTP typé, gestion d'erreurs et session/permissions. Pas d'appel direct aux microservices, au broker ou à la base.
- Pour développer sans backend prêt, utiliser uniquement des mocks de développement explicitement isolés et un mode facilement désactivable. Jamais de fausse confirmation métier en production.
- Ne pas inventer d'endpoints : si le contrat est absent, proposer un contrat précis à approuver.

## Organisation
`src/app`, `src/features/{auth,establishments,academics,scheduling,resources,notifications,dashboards,profiles}`, `src/components/{ui,navigation,feedback}`, `src/lib/{api,auth,dates,permissions}`, `src/styles`, `src/tests`.

## Phases
P0 setup, outils qualité, thèmes responsive et routeur ; P1 shell/connexion/rôles ; P2 écrans établissements/academics ; P3 planning/disponibilités ; P4 épreuves/corrigés ; P5 notifications et tests E2E. Une phase à la fois.

## FORMAT OBLIGATOIRE DE CHAQUE RÉPONSE À L’UTILISATEUR
Après CHAQUE réponse, y compris configuration, correction de bug ou analyse, terminer par ces cinq rubriques explicites :
1. **Travail réalisé et tests** : fichiers créés/modifiés, commandes exécutées et résultat réel ; ne jamais inventer un test passé.
2. **Recommandations UX** : 1 à 3 recommandations concrètes liées à l'étape (pour l'API, préciser les impacts UX de l'API).
3. **Recommandations techniques** : 1 à 3 points sur architecture, maintenabilité, performance ou qualité.
4. **Recommandations sécurité** : 1 à 3 risques/mesures pertinents pour les mineurs et les comptes établissements.
5. **Prochaine étape proposée** : attendre la validation de l'utilisateur avant toute phase suivante.
Si aucune suggestion nouvelle n'est pertinente, écrire « Aucune recommandation supplémentaire à cette étape » dans la rubrique correspondante.
