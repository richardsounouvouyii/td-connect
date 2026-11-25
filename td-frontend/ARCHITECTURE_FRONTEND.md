# TD — Instructions impératives pour Cursor : FRONTEND

**Version :** 1.0 — 25 novembre 2026  
**Périmètre :** application TD uniquement, indépendante de CHAPITRE+.  
**Référence métier :** `CAHIER_DES_CHARGES_TD.md`. En cas de contradiction, demander validation avant de changer une règle métier.  
**Contrat avec le backend :** le dépôt indépendant `td-api` publie les schémas OpenAPI dans `contracts/openapi/`. Ne jamais importer du code du backend ; consommer un client TypeScript généré à partir du contrat versionné.

## 1. Mission et périmètre

Développer une vraie application web **responsive mobile-first** en React + TypeScript pour 4 rôles : `STUDENT`, `TRAINER`, `SCHOOL_ADMIN`, `SUPER_ADMIN`. Elle planifie les TD **physiques** des classes de troisième et terminale (public/privé), publie des épreuves et des corrigés, et diffuse les notifications. Un même formateur peut intervenir dans plusieurs établissements ; les données scolaires sont cloisonnées.

**Hors V1 :** travaux à domicile, présences, retard, compte rendu pédagogique, paiement, soutien payant, « Je n'ai pas compris un chapitre », chat, visioconférence, QCM, remise de devoir ou upload par élève. Ne créer **aucune page, aucun bouton, aucun formulaire** pour ces modules. Les statuts administratifs de séances restent disponibles.

## 2. Stack fixée et règles

- React, TypeScript `strict`, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form + Zod, Lucide React.
- Client HTTP centralisé et typé; les URL backend viennent de `VITE_API_BASE_URL` ; pas d'URL de microservice codée dans l'UI. L'interface parle **uniquement à l'API Gateway**.
- Ne jamais communiquer avec RabbitMQ, PostgreSQL ou un microservice directement depuis le navigateur.
- Pour les dates, conserver l'UTC côté API et afficher selon `Africa/Porto-Novo` ; pas de dates décalées par mauvaise conversion.
- Utiliser des composants réutilisables et des conventions de noms cohérentes. Pas de logique métier de validation des conflits de salles dans React : seul le serveur décide.
- Formulaires validés avec Zod **et** messages serveur affichés clairement ; aucune simulation d'enregistrement réussi.
- Fixtures autorisées seulement pour démo/dev, dans un dossier isolé, jamais en production ni dans un tableau de bord connecté.

## 3. Architecture frontend obligatoire

```text
td-frontend/
  public/
  src/
    app/
      router.tsx
      providers.tsx
      layouts/
        PublicLayout.tsx
        StudentLayout.tsx
        TrainerLayout.tsx
        SchoolAdminLayout.tsx
        SuperAdminLayout.tsx
    features/
      auth/
      establishments/
      academics/
      scheduling/
      resources/
      notifications/
      dashboards/
      profiles/
    components/
      ui/               # Button, Input, Select, Modal, Table, Badge, EmptyState
      navigation/       # Sidebar, Topbar, MobileNav
      feedback/         # ErrorState, LoadingState, ConfirmDialog
    lib/
      api/              # client HTTP + contrats versionnés
      auth/
      dates/
      permissions/
    styles/
      index.css
    tests/
  .env.example
  package.json
```

Dans chaque `feature`, privilégier `api/`, `components/`, `pages/`, `hooks/`, `schemas/` et `types/` au besoin. Ne pas créer des fichiers vides artificiels. Éviter un énorme `App.tsx` centralisant toute l'application.

## 4. UX de référence : responsive et accessible

- Desktop : barre supérieure, sidebar par rôle, tableaux et calendrier lisibles ; tablette : sidebar rétractable ; mobile : menu compact ou bottom navigation **pour l'élève**, pas une version amputée.
- Sur mobile, **le même contenu et les mêmes fonctions** que le web doivent être accessibles, avec une mise en page adaptée (cartes, accordéons, scroll horizontal des tableaux si nécessaire), jamais cachés arbitrairement.
- Icônes Lucide, typographie contrastée, boutons tactiles d'au moins ~44 px, labels permanents et textes d'erreur en français ; indicateur de focus clavier, gestion ARIA, états `loading`, `empty`, `error`, `success`.
- Les actions importantes ont une confirmation avant suppression/annulation. Afficher clairement les détails de séance (date, heure, salle, établissement, matière, chapitre, formateur, statut).
- Connexions mobiles lentes : pagination, cache Query raisonnable, skeletons, chargement différé, compression d'images et prévisualisation PDF uniquement à la demande.
- Favoriser un design institutionnel : bleu profond, bleu interactif, blanc cassé, gris neutres, accents limités. Centraliser les tokens CSS ; proposer la palette définitive avant de la figer.

## 5. Pages et droits par acteur

### Élève
- Connexion / profil (classe, groupes, établissement), accueil, planning jour/semaine/mois, détails TD, catalogue épreuves, corrigés, historique, notifications.
- Recherche par classe, matière, chapitre, date ; seuls documents publiés et autorisés sont téléchargeables.
- **Aucun bouton d'upload. Aucun TD payant. Aucune remise de devoir.**

### Formateur
- Profil / affectations multi-écoles, disponibilités récurrentes et exceptions, agenda de toutes ses interventions, séances à proposer et suivre, import d'épreuves et de corrigés, publications programmées, notifications.
- Un formulaire de séance contient : établissement, classe/groupe, matière, chapitre, objectifs, date, heure début/fin, salle souhaitée. Afficher les conflits rapportés par l'API mais ne jamais confirmer localement un créneau.
- Épreuve et corrigé sont des objets liés : `resource_id`, `exam_id` éventuel, `visible_at`, `audience`, statut. Seuls PDF/images (DOCX uniquement si activé côté serveur) sont proposés.
- **Aucun menu “Travaux à domicile”, “Présences”, “Compte rendu”.**

### Administrateur d'établissement
- Tableau de bord de son établissement, classes/groupes, élèves/import, formateurs/affectations, matières/chapitres, salles, disponibilités, calendrier global, validation/rejet/report/annulation TD, supervision documentaire, rapports simples, paramètres.
- Les actions de validation indiquent les conflits et motifs renvoyés par le serveur.

### Super administrateur
- Tableau global agrégé, établissements, comptes/rôles globaux, référentiels communs, statistiques et audit autorisé, paramètres système.
- Pas d'accès implicite à des documents privés ni aux informations nominatives d'autres écoles : appliquer les permissions retournées par l'API.

## 6. Flux critiques frontend à réaliser

1. Connexion → session sécurisée → chargement de `/me` et des droits → navigation adaptée au rôle.
2. Élève → planning filtré pour sa classe/groupe → fiche séance → documents publiés.
3. Formateur → disponibilités → création séance en brouillon → proposition → retour `PENDING_APPROVAL`.
4. Admin école → liste des propositions → conflits/validation → séance `PUBLISHED` visible de l'élève.
5. Formateur → upload d'une épreuve → choix classe/groupe / publication → ajout du corrigé lié avec `visible_at`.
6. Notification → ouverture du bon détail uniquement si l'utilisateur en a le droit.

## 7. Qualité / tests / sécurité UI

- ESLint, TypeScript strict, tests React Testing Library/Vitest, Playwright pour les parcours critiques (desktop et mobile).
- `ProtectedRoute`, contrôle des permissions côté interface pour l'ergonomie **mais ne jamais le considérer comme sécurité** ; les droits sont revérifiés par le backend.
- Ne jamais placer token, secret ou données d'élève dans le `localStorage` par défaut ; préférer le schéma de session/refresh validé côté backend (cookies `HttpOnly` si retenus, CSRF adapté).
- Bloquer les injections HTML ; éviter `dangerouslySetInnerHTML` ; ne pas afficher le chemin réel des fichiers privés.
- Afficher les erreurs HTTP correctement : 401 (reconnexion), 403 (accès refusé), 404, 409 (conflit créneau), 422 (validation), 5xx (réessayer).
- Mettre les tests UI et E2E sous CI ; vérifier 360px, 390px, 768px et 1440px, sans débordement horizontal global.

## 8. Collaboration avec le backend

- Ne jamais inventer des endpoints : lire `/docs` OpenAPI Gateway et les contrats dans `packages/contracts/`.
- Avant de coder une page, décrire les données nécessaires, le contrat attendu et le cas d'erreur. Si une API manque, documenter un contrat proposé dans `docs/api-proposals.md` et demander validation.
- Conserver des DTO typés et la pagination/filtres ; n'effectuer aucune jointure métier critique entre réponses côté client.
- Les notifications arrivent par API, avec actualisation progressive ; WebSocket/SSE seulement après validation d'un besoin réel.

## 9. Phases d'implémentation frontend

- F0 : installer Vite/TS/Tailwind v4, router, layouts, design tokens, composants essentiels, tests, page d'accueil accessible.
- F1 : connexion, profil, protection par rôles, gestion des erreurs.
- F2 : écrans élèves, classes, matières, listes et filtres (sur vraies API).
- F3 : écrans formateur : disponibilités, calendrier, proposition de séance ; écrans admin de validation.
- F4 : épreuves/corrigés : upload formateur, prévisualisation et téléchargement autorisé élève.
- F5 : notifications et dashboards branchés aux données ; tests mobile/desktop.
- F6 : accessibilité, robustesse faible connexion, optimisation et recette.

**Ne passer à la phase suivante qu'après validation explicite.**

## 10. Format obligatoire de CHAQUE réponse de Cursor

Après **chaque réponse** (même en cas de question, bug, proposition ou résultat partiel), terminer par ces rubriques, avec des propositions concrètes liées au travail en cours :

1. **Travail réalisé / état actuel :** changements réellement effectués, fichiers modifiés, tests exécutés et résultat ; ne jamais prétendre avoir exécuté un test non lancé.
2. **Recommandations UX :** au moins une amélioration de lisibilité, responsive, navigation ou accessibilité ; indiquer « aucune recommandation supplémentaire à ce stade » si rien de pertinent.
3. **Recommandations techniques :** maintenabilité, performance, contrat API, qualité du code, tests ou architecture ; distinguer nécessaire / facultatif.
4. **Recommandations sécurité :** droits par rôle/école, protection des mineurs, confidentialité, fichiers et sessions ; signaler toute vulnérabilité identifiée et correction recommandée.
5. **Prochaine étape proposée :** une action précise, sans la lancer si validation nécessaire.

Ne pas remplir ces rubriques par des banalités répétitives. Signaler clairement « À valider » pour chaque décision non approuvée. **Les recommandations ne doivent jamais être implémentées silencieusement sans accord si elles modifient le périmètre.**

## 11. Première demande recommandée

> Lis `CAHIER_DES_CHARGES_TD.md`, `FRONTEND_CURSOR.md` et `BACKEND_MICROSERVICES_CURSOR.md`. Commence uniquement F0. Propose l'arborescence `apps/web`, installe React/TypeScript/Vite/Tailwind v4, crée les layouts et une page publique responsive reliée au Gateway healthcheck. Ajoute tests et commandes PowerShell ; respecte le format de réponse obligatoire et attends validation.
