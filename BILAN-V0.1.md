# Bilan de la V0.1 et idées pour la V0.2

## Ce que fait la V0.1

**Pour les joueurs**

- Connexion par e-mail et mot de passe (comptes créés ou invités par l'administrateur ; « mot de passe oublié » inclus).
- Choix d'un pseudo (unique) et d'un avatar, enregistrés sur le compte.
- Ouverture de boosters : 3 par jour par défaut, remis à zéro à minuit (heure de Paris). Le **tirage est fait par le
  serveur** : impossible de tricher depuis le navigateur.
- Révélation des cartes une par une, retournement simple, badge « Nouvelle ! », bilan.
- Collection : toutes les cartes du jeu, emplacements vides grisés (aucun indice sur les cartes pas encore obtenues),
  quantités, progression X / Y, filtre par rareté, vue agrandie.
- Onglet « Jouer » (« Bientôt disponible ») et page « Installer l'appli » (Android, iPhone, ordinateur).
- Appli installable (PWA) avec mises à jour : bandeau « Nouvelle version disponible » et écran « Mise à jour obligatoire ».
- Barre d'onglets en bas sur téléphone, menu à gauche sur ordinateur.

**Pour l'administrateur**

- Cartes : ajout multiple (glisser-déposer), contrôle du ratio, optimisation des images, galerie filtrable, modifier,
  désactiver, supprimer (refusé si un joueur possède la carte).
- Boosters : cartes par booster, boosters par jour, probabilités (total 100 % imposé).
- Joueurs : liste avec nombre de cartes. Version : version minimum requise.
- Registre d'effets de cartes prêt (seulement « Aucun » pour l'instant).

**Sous le capot**

- Front React + TypeScript (PWA), hébergé sur GitHub Pages, déployé automatiquement à chaque envoi sur `main`.
- Supabase : comptes, base PostgreSQL avec sécurité par ligne (RLS) sur toutes les tables, images dans un stockage privé.
- Sécurité vérifiée en réel avec un compte joueur de test : toutes les écritures interdites sont refusées par la base, la
  limite quotidienne est imposée par le serveur, un joueur ne voit que ses propres données.
- Sécurité vérifiée par un test automatique de 50 contrôles (`supabase/tests/securite.sql`), validé sur une vraie base
  locale avec des failles volontaires pour s'assurer qu'il les détecte.
- ~270 tests unitaires, lint sans avertissement, publication d'une version en une commande (`npm run publier`).
- Aucune photo dans le dépôt public ; aucun secret ; historique nettoyé.

## Ce qui n'a PAS pu être vérifié

- L'appli **installée sur un vrai téléphone** (iPhone compris) : les mises à jour sont conçues pour (vérification au retour
  au premier plan), mais seul un test réel le confirme. Sur iPhone, l'appli installée ne partage pas la connexion de Safari.
- L'**envoi réel des e-mails** d'invitation et de réinitialisation (dépend de ta configuration Supabase : adresses de
  redirection, limite d'e-mails de l'offre gratuite).
- La mise en page sur de **vrais appareils** : elle a été contrôlée en simulation (375 px, 768 px, ordinateur).

## Limites connues

- Les icônes de l'appli sont provisoires (un « S » sur dégradé).
- La « version minimum requise » est un confort, pas une sécurité : un ancien client modifié peut l'ignorer (la base reste protégée).
- Les images d'une carte non obtenue sont lisibles par un joueur qui interroge directement l'API (le stockage est lisible
  par tout joueur connecté, comme demandé) ; l'appli, elle, ne les affiche pas.
- Offre gratuite de Supabase : projet mis en pause après environ une semaine d'inactivité, peu d'e-mails par heure, pas de
  sauvegarde automatique téléchargeable.
- Tous les boosters tirent dans le même pool de cartes (les 3 thèmes sont purement esthétiques).
- Pas de suppression de compte ni de changement d'e-mail depuis l'appli.

## Idées pour la V0.2

**Jeu**

- Un vrai mode **Jouer** (duels, défis du jour…).
- **Échanges** de cartes entre amis, liste de souhaits.
- Boosters avec **leur propre sélection de cartes** (une saison = un pool), boosters spéciaux, garanties (une carte rare au
  moins tous les N boosters).
- **Effets de cartes** (holographique, feu, brillance…) : le registre `src/effects/` est prêt, il suffit d'ajouter des
  composants puis de les attribuer depuis l'admin. Puis **recoder la révélation** avec les effets (l'interrupteur
  `EFFETS_REVELATION_ACTIFS` rétablit l'ancien code).
- Succès, statistiques, classement entre amis.

**Appli**

- **Notifications** quand les boosters sont de retour (limitée sur iPhone).
- Collection **consultable hors ligne**.
- Vraies **icônes** et habillage graphique définitif.
- Changer son **e-mail** ou son mot de passe depuis le profil ; supprimer son compte.
- Quelques **sons** et vibrations à l'ouverture.

**Administration**

- Outil de **création de cartes intégré** (ou import en lot d'un export de l'autre projet).
- Statistiques d'usage, historique des ouvertures, **réinitialiser les boosters** d'un joueur.
- Bouton d'**export / sauvegarde** de la base.
- Éditer les cartes en lot (changer la rareté de plusieurs cartes d'un coup).

**Technique**

- Une **tâche planifiée GitHub** qui appelle la base chaque jour pour **éviter la pause** de Supabase.
- Tests automatiques de bout en bout (navigateur) en plus des tests unitaires.
- Mises à jour automatiques des dépendances (Dependabot) et audit régulier.
- Domaine personnalisé pour l'adresse du site.
- Un hébergement ou un plan Supabase payant si l'appli grandit (sauvegardes, pas de pause).
