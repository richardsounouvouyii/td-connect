# CAHIER DES CHARGES — TD CONNECT

**Version :** 1.1 — 25 novembre 2026  
**Produit :** plateforme web responsive de gestion des travaux dirigés (TD) pour établissements publics et privés  
**Public :** élèves de 3e et terminale, formateurs, responsables d'établissement et super administrateur  
**Statut :** document de référence fonctionnel et technique à valider avec les établissements pilotes

## 1. Contexte et objectif

TD CONNECT centralise l'organisation des séances de TD physiques : établissements, classes et groupes, disponibilités des formateurs, salles, calendriers, épreuves, corrigés et notifications. Les travaux à domicile et le suivi des présences sont reportés à une version ultérieure. Une même plateforme sert plusieurs établissements, chacun gardant ses propres données et son responsable.

**Frontière stricte :** TD CONNECT est indépendant de CHAPITRE+. Il ne propose ni demandes payantes « Je n'ai pas compris un chapitre », ni recherche de tuteurs indépendants, ni réservation payante de soutien scolaire. Aucun cours, devoir rendu, quiz ou correction individuelle ne s'effectue en ligne. Les exercices et devoirs sont réalisés et remis physiquement ; l'élève télécharge seulement les documents fournis par le formateur.

## 2. Acteurs et permissions

| Acteur | Responsabilités principales |
|---|---|
| Élève | Voir ses TD, télécharger épreuves/corrigés, notifications, historique |
| Formateur | Déclarer disponibilités, proposer TD, importer épreuves et corrigés, recevoir des notifications |
| Administrateur d'établissement | Gérer les classes, élèves, formateurs, matières, salles, plannings, validations, documents et rapports de son école |
| Super administrateur | Créer et superviser les établissements, droits, référentiels communs, audit, incidents et configuration générale |

Un formateur peut intervenir dans plusieurs écoles sous le même compte ; ses droits et ses disponibilités sont contrôlés pour chaque établissement. Un élève appartient à une classe et peut être affecté à plusieurs groupes de TD dans une année scolaire. Les autorisations sont systématiquement vérifiées côté serveur, y compris par établissement et propriétaire de ressource.

## 3. Actions détaillées de l'élève

1. **Compte** : se connecter avec des identifiants créés ou validés par son établissement ; consulter son profil et sa classe ; modifier uniquement les champs autorisés.
2. **Accueil** : voir ses prochaines séances, changements récents, épreuves et corrigés publiés.
3. **Planning** : afficher calendrier jour/semaine/mois et détails (matière, classe/groupe, chapitre, date, début/fin, salle, établissement, formateur, statut).
4. **Documents** : rechercher et filtrer les épreuves par classe, matière, chapitre, type et date ; prévisualiser ou télécharger uniquement les fichiers publiés pour son groupe ; accéder aux corrigés à leur date de publication.
5. **Notifications** : nouvelle séance, changement, annulation, épreuve, corrigé et rappels pertinents.
6. **Historique** : retrouver les anciennes séances et les ressources toujours autorisées.

**Interdictions côté élève :** aucun upload, aucune photo de travail, aucune soumission de devoir, aucun paiement, aucune messagerie pédagogique ou visioconférence dans TD CONNECT.

## 4. Actions détaillées du formateur

1. **Profil et affectations** : informations professionnelles, établissements, matières, niveaux, classes attribués ; consultation des autorisations.
2. **Disponibilités** : déclarer créneaux récurrents et exceptions ; consulter l'agenda fusionné de ses interventions dans toutes les écoles.
3. **Séances** : proposer une séance pour un établissement, classe/groupe, matière, chapitre, date, heure et durée ; sélectionner une salle disponible parmi celles autorisées ; ajouter objectifs et consignes ; soumettre pour validation ; suivre son statut.
4. **Épreuves** : importer PDF/images et éventuellement DOCX selon configuration ; renseigner titre, matière, chapitre, année, type, classe/groupe, séance et visibilité ; publier ou programmer une publication.
5. **Corrigés** : importer et lier explicitement à l'épreuve ; choisir `visible_at` afin d'éviter toute publication prématurée ; remplacer un document en conservant un historique simple.
6. **Notifications** : être alerté des validations, rejets, modifications et conflits.

Le formateur ne peut ni réserver définitivement une salle sans droit explicite ni consulter les données privées d'autres établissements. Toute publication visible aux élèves est soumise aux règles de l'établissement.

## 5. Actions de l'administrateur d'établissement

- Gérer fiche école, année scolaire, horaires autorisés, classes (3e et terminale avec séries), groupes, matières et chapitres.
- Créer/importer des comptes élèves (CSV/XLSX avec contrôles de doublons), affecter aux classes et groupes, activer/suspendre les accès.
- Inviter/affecter les formateurs, matières et classes ; consulter les disponibilités autorisées.
- Créer salles : code, capacité, équipements, périodes d'indisponibilité ; verrouiller les conflits.
- Créer, déplacer, approuver, rejeter, reporter ou annuler les séances ; examiner les motifs de conflit ; notifier les personnes concernées.
- Superviser les documents ; retirer un fichier inapproprié ; gérer les droits de publication et la visibilité des corrigés.
- Consulter les séances planifiées, validées, reportées et annulées ; consulter les indicateurs et exports autorisés.
- Régler la politique de validation et les notifications propres à l'établissement, sans accès aux autres écoles.

## 6. Actions du super administrateur

- Créer, valider, activer, suspendre et configurer les établissements ; désigner leur administrateur.
- Définir les rôles, permissions globales, référentiels pédagogiques communs et politiques techniques.
- Voir indicateurs agrégés (écoles actives, séances, adoption), état des services et incidents.
- Consulter des journaux d'audit strictement autorisés, gérer les demandes de support et les violations de règles.
- Administrer les limites de fichiers, durées de conservation, sauvegardes et notifications système.

## 7. Cycle de vie d'une séance

1. L'administrateur initialise classes, groupes, matières, salles et formateurs.
2. Le formateur déclare ses disponibilités (récurrentes et exceptions).
3. Le formateur ou l'admin crée une séance `DRAFT`, avec une classe/groupe, une matière, un chapitre, un horaire, un formateur et une salle proposée.
4. Le moteur contrôle : disponibilité du formateur sur **toutes** ses affectations, salle libre, groupe non occupé, capacité de salle, horaires de l'école et intervalle début-fin valide.
5. La séance passe à `PENDING_APPROVAL`; l'admin approuve (`PUBLISHED`) ou rejette avec motif (`REJECTED`). Règle d'approbation directe facultative pour des formateurs habilités.
6. Les élèves de la classe/groupe la voient automatiquement ; l'épreuve peut être publiée avant la séance ; le corrigé seulement à `visible_at`.
7. L'administrateur peut marquer administrativement une séance comme terminée ou annulée ; aucun module de feuille de présence ou compte rendu du formateur dans la V1.
8. Les participants conservent l'accès aux ressources suivant leur politique de visibilité.

Tout report ou annulation libère les réservations précédentes, effectue une nouvelle vérification des conflits et déclenche des événements de notification. Les transitions interdites sont bloquées par API.

## 8. Documents pédagogiques

| Objet | Créateur | Accès élève | Règle importante |
|---|---|---|---|
| Épreuve TD | Formateur habilité | Consultation/téléchargement | Date de publication et audience classe/groupe |
| Corrigé | Formateur habilité | Consultation/téléchargement | Lié à une épreuve, jamais visible avant `visible_at` |

Le serveur vérifie extension, MIME réel, taille, stockage privé, contrôle d'accès à chaque téléchargement et URL signée courte durée. Les fichiers peuvent être corrigés/versionnés ; les élèves ne téléversent jamais de réponses.

## 9. Règles métier et validations

- **RG01** : chaque établissement possède son espace logique isolé ; aucune donnée d'école tierce n'est exposée.
- **RG02** : la classe et le groupe sont associés à l'année scolaire active.
- **RG03** : un formateur peut travailler dans plusieurs écoles mais ne peut avoir deux séances qui se chevauchent.
- **RG04** : une salle et un groupe ne peuvent être affectés à deux séances simultanées ; contrôler au niveau transactionnel en base.
- **RG05** : la capacité de la salle doit être compatible avec le groupe (ou le nombre d'inscrits si inscription facultative activée).
- **RG06** : un formateur ne propose que des matières/niveaux autorisés dans l'école ciblée.
- **RG07** : toute séance doit être approuvée avant publication, sauf délégation explicite.
- **RG08** : un élève voit uniquement son planning et les documents de ses classes/groupes autorisés.
- **RG09** : le corrigé ne peut être consulté avant sa date de disponibilité, même par URL directe.
- **RG10** : annulation/report entraîne notification ciblée ; l'historique et le motif sont conservés.
- **RG11** : les suppressions sensibles sont journalisées, et les documents privés sont protégés.
- **RG12** : les droits sont vérifiés serveur pour chaque action et référence (prévention des accès IDOR).

## 10. Écrans et navigation

| Acteur | Menu principal |
|---|---|
| Élève | Accueil, Mon planning, Mes TD, Épreuves, Corrigés, Notifications, Profil |
| Formateur | Tableau de bord, Disponibilités, Mes séances, Proposer TD, Épreuves, Corrigés, Notifications, Profil |
| Admin établissement | Dashboard, Planning, Classes/Groupes, Élèves, Formateurs, Matières/Chapitres, Salles, Documents, Rapports, Paramètres |
| Super admin | Vue globale, Établissements, Utilisateurs, Référentiels, Statistiques, Audit, Paramètres |

Responsive mobile-first : menu inférieur pour les fonctions élève prioritaires, menus adaptatifs pour les autres rôles, tableau de planning scrollable sur mobile, formulaires accessibles, états chargement/vide/erreur et mise en page performante sur faible connexion.

## 11. Architecture technique — microservices obligatoires

**Frontend :** React + TypeScript + Vite + Tailwind CSS, React Router et TanStack Query.  
**Backend :** FastAPI/Python, API Gateway, PostgreSQL, RabbitMQ et Docker Compose.  
**Événements :** messages RabbitMQ pour séances créées/validées/reportées/annulées, documents publiés, utilisateurs inscrits et notifications.  
**Données :** chaque microservice possède son schéma ou sa base PostgreSQL propre, ses migrations Alembic et aucun accès direct aux tables d'un autre service.

Services proposés (frontières claires, à maintenir indépendantes) :

1. `identity-service` : comptes, authentification, rôles, adhésions aux écoles.
2. `establishment-service` : établissements, salles, paramètres et périodes d'indisponibilité.
3. `academic-service` : années, classes, groupes, élèves inscrits, matières/chapitres et affectations.
4. `scheduling-service` : disponibilités, séances, contrôle des chevauchements et état de validation.
5. `resource-service` : épreuves, corrigés, fichiers, règles de publication et téléchargement.
6. `notification-service` : notifications dans l'application et livraison asynchrone.

**Important :** la validation du planning requiert des décisions synchrones fiables et une gestion des réservations atomique. RabbitMQ ne remplace pas les transactions : pour les contraintes transverses (formateur entre écoles, salle, groupe), définir un propriétaire de réservation et une stratégie de verrouillage/cohérence documentée. Prévoir timeouts et compensations pour les opérations multi-services.

**Communication :** appels synchrones REST via clients typés pour vérification/commandes indispensables, événements RabbitMQ pour changements d'état et notifications. Messages JSON versionnés, identifiants d'événement, correlation ID, outbox transactionnelle, consommateurs idempotents, retries progressifs et dead-letter queues. Observabilité centralisée, OpenAPI par service, logs structurés. Pour l'environnement local, un seul serveur PostgreSQL peut héberger des bases séparées.

### Structure de dépôt cible

```text
TD-CONNECT/
  AGENTS.md
  CAHIER_DES_CHARGES_TD_CONNECT.md
  README.md
  docker-compose.yml
  .env.example
  apps/web/
  apps/gateway/
  services/identity-service/
  services/establishment-service/
  services/academic-service/
  services/scheduling-service/
  services/resource-service/
  services/notification-service/
  packages/contracts/
  infra/rabbitmq/
  docs/architecture.md
  docs/events.md
  docs/decisions.md
```

## 12. Données principales (propriétaire par service)

- **Identity** : users, roles, memberships, sessions, permissions.
- **Establishment** : establishments, rooms, room_unavailability, school_settings.
- **Academic** : school_years, levels, tracks, classes, groups, group_members, subjects, chapters, trainer_assignments.
- **Scheduling** : trainer_availabilities, sessions, reservations, session_status_history, scheduling_conflicts.
- **Resource** : resources, resource_versions, resource_audiences, publication_schedules.
- **Notification** : notifications, delivery_attempts, preferences.

Identifiants UUID, horodatages UTC, affichage Africa/Porto-Novo ; références interservices par UUID et non par clés étrangères entre bases indépendantes. Vérifier toute cohérence métier par API/événements.

## 13. Sécurité et protection des élèves

Authentification robuste et contrôle des rôles, isolation par établissement, hachage de mots de passe, limitation des tentatives de connexion, cookies ou tokens sécurisés, TLS, journaux d'audit. Consentements/autorisation adaptés aux élèves mineurs selon le cadre applicable ; données minimales ; pas d'exposition publique des listes d'élèves. Téléchargement des fichiers seulement après vérification d'accès. Sauvegardes et restauration testées, politiques de conservation à définir avec les établissements.

## 14. Notifications et événements RabbitMQ

- `td.session.proposed.v1` : suivi administratif de proposition.
- `td.session.published.v1` : élèves et formateur avertis.
- `td.session.rescheduled.v1` : replanification et nouvel horaire.
- `td.session.cancelled.v1` : annulation et libération de ressource.
- `td.resource.published.v1` : nouvelle épreuve ou nouveau corrigé.
- `td.session.completed.v1` : suivi de séance effectué.

Tout événement doit contenir `event_id`, `event_type`, `version`, `occurred_at`, `correlation_id`, `establishment_id`, `aggregate_id`, puis `payload` sans données personnelles superflues. Le service de notification applique les préférences et ne révèle rien hors du groupe autorisé.

## 15. Phases de réalisation dans Cursor

- **Phase 0 — Fondations :** monorepo, frontend React, gateway, squelettes des 6 microservices, bases séparées, RabbitMQ, Docker Compose, healthchecks, configurations et premiers tests ; sans logique métier.
- **Phase 1 — Identity / établissements :** connexion, rôles, écoles, administrateurs, permissions multi-écoles.
- **Phase 2 — Référentiels académiques :** années, classes, groupes, élèves, matières, affectations, import en masse.
- **Phase 3 — Planning :** disponibilité multi-écoles, salles, création, validation, publication, conflits transactionnels ; événements RabbitMQ.
- **Phase 4 — Documents :** épreuves/corrigés, PDF/images, dates de visibilité, contrôle des téléchargements.
- **Phase 5 — Notifications et rapports simples :** événements RabbitMQ, notifications et tableaux de bord (sans présences).
- **Phase 6 — Recette et déploiement :** tests E2E, sécurité, sauvegardes et pilotes sur mobile.

À chaque phase, Cursor doit créer du code exécutable, migrations, tests et documentation ; montrer la commande de démarrage Windows PowerShell, les vérifications réussies et les limites avant d'attendre validation.

## 16. Critères de recette du MVP

1. Deux établissements peuvent être créés, chacun isolé.
2. Un formateur rattaché à deux écoles ne peut être planifié à des horaires qui se chevauchent.
3. Une salle ou un groupe ne peut être double-réservé, y compris lors de requêtes simultanées.
4. Une séance non approuvée n'est pas visible des élèves.
5. Un élève voit seulement les séances de sa classe et de ses groupes.
6. Un formateur peut publier une épreuve et programmer son corrigé plus tard.
7. Une URL directe ne permet pas de récupérer un corrigé non publié ni le document d'une autre école.
8. Report et annulation produisent une notification pertinente et un historique auditable.
9. Les parcours élève, formateur et admin fonctionnent sur mobile.
10. Tous les services démarrent, exposent un healthcheck et disposent d'au moins un test automatisé.
11. Les événements RabbitMQ sont traités sans doublons et les défaillances sont rejouables.

## 17. Points à décider avec les écoles pilotes

- Inscription des élèves uniquement par établissement (recommandée) ou en autonomie avec validation.
- Séances affectées automatiquement aux classes (recommandé) ou inscriptions individuelles supplémentaires.
- Conditions exactes de validation des séances et documents.
- Formats, volumes et durée de conservation des documents ; politique des corrections.
- Ajout futur des travaux à domicile et du suivi des présences (hors V1).
- Gestion des salles partagées entre établissements et des horaires spécifiques.

Ces paramètres doivent rester configurables, sans bloquer la version pilote. **Aucun module de paiement ni de renforcement payant n'appartient à ce projet.**

## 18. Fonctionnalités reportées (hors V1)

- **Travaux à domicile (ancien point 6 formateur)** : création des devoirs, consignes, date limite et mise à disposition des sujets.
- **Présences et clôture pédagogique (ancien point 7 formateur)** : pointage présents/absents/retards, compte rendu de séance et suivi détaillé.
- Ces fonctionnalités ne doivent pas être implémentées ni affichées dans les menus de la V1. Le statut administratif des séances reste géré par le `scheduling-service`.
