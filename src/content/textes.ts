/**
 * Textes affichés dans l'application.
 *
 * ┌─ MODE D'EMPLOI (pour débutant) ────────────────────────────────────────────────┐
 * │ Pour changer un texte : modifie ce qui est ENTRE GUILLEMETS.                   │
 * │ Garde les guillemets ("...") et la virgule à la fin de la ligne.                │
 * │ Exemple : titre: "SWAG",  devient  titre: "MON TITRE",                          │
 * │ Si ton texte contient lui-même un guillemet ", écris plutôt \" (avec le \).     │
 * │ Enregistre le fichier : la page se met à jour toute seule.                      │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 * Rôle : source UNIQUE de tous les textes de l'écran d'accueil (aucun texte de l'accueil n'est écrit
 * dans les composants). Les autres écrans y seront ajoutés plus tard, chacun dans sa section.
 * Expose : TEXTES.
 * Dépend de : rien.
 */

export const TEXTES = {
  // ---------------------------------------------------------------------------------
  // ÉCRAN D'ACCUEIL
  // ---------------------------------------------------------------------------------
  accueil: {
    // Le gros mot en corail, au centre de l'écran.
    titre: 'SWAG',
    // Le texte blanc dans la pastille sombre, sous le gros titre.
    sousTitre: 'Cartes Délaitère',
    // Le mot violet, sous la pastille.
    nomAppli: 'Booster',
    // Le gros bouton en bas de l'écran.
    boutonOuvrir: 'Ouvrir un booster',
    // Combien de boosters il reste aujourd'hui ({restants} sur {parJour}).
    restants: 'Boosters restants aujourd’hui : {restants} / {parJour}',
    // Quand il n'en reste plus : le temps avant la remise à zéro ({duree} : « 3 h 12 min »).
    prochain: 'Prochains boosters dans {duree}',
    // Les mots utilisés pour écrire la durée.
    duree: { heures: 'h', minutes: 'min', moinsUneMinute: 'moins d’une minute' },
    chargementBoosters: 'Chargement de tes boosters…',
    erreurBoosters: 'Impossible de lire tes boosters du jour.',
    reessayer: 'Réessayer',
    // Le texte lu par les lecteurs d'écran pour le bouton qui ouvre le profil (le pseudo, en haut à gauche).
    labelProfil: 'Modifier mon profil',
    // Le numéro de version, en haut à gauche ({version} est remplacé par le vrai numéro : garde-le tel quel).
    version: 'Version {version}',
    // Le mot qui précède le pseudo, en haut à gauche (sous la version).
    labelJoueur: 'Joueur :',
    // Ce qui s'affiche à la place du pseudo quand aucun profil n'est enregistré.
    pseudoAbsent: '—',
    // Les mentions légales, tout en bas de l'écran.
    mentions: '© Cartes Délaitère 2026',
    // Le petit bouton qui ouvre l'espace d'administration (en haut à droite, visible des administrateurs seulement).
    boutonAdmin: 'Administration',
    // Le petit bouton qui ferme la session (en haut à droite, sous le précédent).
    boutonDeconnexion: 'Se déconnecter',
  },

  // ---------------------------------------------------------------------------------
  // ÉCRAN PROFIL (et fenêtre de choix d'avatar)
  // Dans les textes, {pseudo} est remplacé automatiquement par le pseudo du joueur : garde-le tel quel.
  // ---------------------------------------------------------------------------------
  profil: {
    // Le titre de la fenêtre de choix d'avatar (en haut de la feuille qui monte du bas).
    titreAvatar: 'Choisis ton avatar',
    // Le texte gris qui s'affiche dans le champ pseudo tant qu'il est vide.
    placeholderPseudo: 'Ton pseudo',
    // La phrase en gras sous le champ pseudo.
    consigne: 'Choisis ton avatar et ton pseudo.',
    // La petite phrase grise sous la consigne.
    remarque: 'Tu pourras les changer à tout moment.',
    // Le texte du gros bouton corail en bas de la carte.
    boutonOk: 'OK',
    // Le texte du bouton qui confirme le choix, dans la fenêtre de choix d'avatar.
    boutonValider: 'Valider',
    // Le message rouge qui apparaît quand le pseudo est trop court ou trop long.
    // (Si tu changes les limites 2 et 16 dans config/profile.ts, change aussi ce texte.)
    erreurPseudo: 'Ton pseudo doit faire entre 2 et 16 caractères.',
    // Le texte lu par les lecteurs d'écran pour le bouton rond de l'avatar (invisible à l'écran).
    labelChangerAvatar: "Changer d'avatar",
    // Le texte lu par les lecteurs d'écran pour la croix qui ferme la fenêtre d'avatar (invisible à l'écran).
    labelFermer: 'Fermer',
    // Le titre de la page lu par les lecteurs d'écran (invisible à l'écran).
    titrePage: 'Profil',
    // Le nom du champ pseudo lu par les lecteurs d'écran (invisible à l'écran).
    labelPseudo: 'Pseudo',
    // Le message affiché pendant que le profil est lu sur l'appareil.
    chargement: 'Chargement…',
    // Le message d'accueil quand un profil existe déjà.
    bonRetour: 'Bon retour, {pseudo} !',
    // Le bouton pour reprendre le profil existant.
    continuer: 'Continuer en tant que {pseudo}',
    // Le bouton pour modifier le profil existant.
    modifierProfil: 'Modifier mon profil',
    // Le message rouge quand l'enregistrement sur l'appareil échoue.
    erreurSauvegarde: "Impossible d'enregistrer le profil. Réessaie.",
    // Le message rouge quand un autre joueur a déjà ce pseudo.
    erreurPseudoPris: 'Ce pseudo est déjà pris. Choisis-en un autre.',
  },

  // ---------------------------------------------------------------------------------
  // ÉCRAN DE CHOIX DU BOOSTER
  // (Les noms et les textes des boosters eux-mêmes sont dans src/boosters/themes/.)
  // Dans les textes, {numero} et {total} sont remplacés automatiquement : garde-les tels quels.
  // ---------------------------------------------------------------------------------
  choixBooster: {
    // La phrase dans la pilule blanche en haut de l'écran.
    titre: 'Choisis un booster.',
    // Le bouton qui ramène à l'accueil.
    retour: 'Retour',
    // Le texte lu par les lecteurs d'écran pour la flèche de gauche (invisible à l'écran).
    labelPrecedent: 'Booster précédent',
    // Le texte lu par les lecteurs d'écran pour la flèche de droite (invisible à l'écran).
    labelSuivant: 'Booster suivant',
    // Le nom de la liste de boosters pour les lecteurs d'écran (invisible à l'écran).
    labelListe: 'Boosters disponibles',
    // Lu après le nom du booster par les lecteurs d'écran (invisible à l'écran).
    position: '{numero} sur {total}',
  },

  // ---------------------------------------------------------------------------------
  // ÉCRAN DE RÉVÉLATION DES CARTES
  // Dans les textes, {nom}, {rarete}, {booster}, {nombre}, {numero} et {total} sont remplacés
  // automatiquement : garde-les tels quels. (Les noms de raretés sont dans src/config/raretes.ts.)
  // ---------------------------------------------------------------------------------
  revelation: {
    // Le titre de la page lu par les lecteurs d'écran (invisible à l'écran).
    titrePage: 'Révélation des cartes',
    // La phrase sous le dos de la carte, qui pulse doucement.
    indicationDos: 'Touche la carte pour la retourner',
    // La phrase dorée pendant l'attente d'une carte légendaire.
    indicationTease: 'Quelque chose se prépare…',
    // Le bouton sous la carte retournée.
    suivant: 'Suivant',
    // Le même bouton après la dernière carte.
    voirBilan: 'Voir le bilan',
    // Le bouton en haut à droite qui saute directement au bilan.
    passer: 'Passer',
    // Le texte lu par les lecteurs d'écran pour ce bouton (invisible à l'écran).
    passerLabel: 'Passer la révélation',
    // Le texte dans la zone image des cartes qui n'ont pas encore de photo.
    // Le badge sur une carte que le joueur n'avait pas encore.
    nouvelle: 'Nouvelle !',
    // Lu par les lecteurs d'écran quand la carte est retournée.
    annonceNouvelle: 'Nouvelle carte : {nom}, {rarete}',
    // Petit texte sous une carte du bilan quand le joueur la possède en plusieurs exemplaires.
    exemplaires: '×{quantite}',
    // Le texte lu par les lecteurs d'écran pour le dos de la carte (invisible à l'écran).
    labelCarteDos: 'Retourner la carte {numero} sur {total}',
    // Annoncé aux lecteurs d'écran quand une carte vient d'être retournée (invisible à l'écran).
    annonce: '{nom}, {rarete}',
    // Le texte lu pour les petits segments de progression en haut (invisible à l'écran).
    labelProgression: 'Carte {numero} sur {total}',
    // Le gros titre du bilan.
    bilanTitre: 'Ouverture terminée !',
    // Sous le titre du bilan : le nom du booster et le nombre de cartes.
    bilanSousTitre: '{booster} · {nombre} cartes',
    // Le titre de la rangée des 3 cartes les plus rares.
    meilleuresCartes: 'Tes meilleures cartes',
    // Le titre de la rangée des autres cartes.
    autresCartes: 'Autres cartes',
    // Le bouton corail du bilan.
    ouvrirAutre: 'Ouvrir un autre booster',
    // Le bouton à contour blanc du bilan.
    accueil: 'Accueil',
  },

  // ---------------------------------------------------------------------------------
  // ÉCRAN « MES CARTES » (collection, ajout, modification)
  // Dans les textes, {nombre}, {nom}, {largeur}, {hauteur}, {attendu} et {max} sont remplacés
  // automatiquement : garde-les tels quels. (Les noms de raretés sont dans src/config/raretes.ts,
  // ceux des variantes dans src/config/cartes.ts.)
  // ---------------------------------------------------------------------------------
  mesCartes: {
    // Le compteur de cartes (au singulier, puis au pluriel).
    totalUne: '{nombre} carte',
    totalPlusieurs: '{nombre} cartes',
    // Le texte lu par les lecteurs d'écran pour la liste des compteurs par rareté (invisible).
    labelCompteurs: 'Nombre de cartes par rareté',
    // Messages de la galerie.
    chargement: 'Chargement des cartes…',
    erreurChargement: 'Impossible de charger les cartes.',
    reessayer: 'Réessayer',
    vide: 'Aucune carte pour le moment.',
    videAdmin: 'Utilise « Ajouter des cartes » pour commencer.',
    aucunResultat: 'Aucune carte ne correspond à ta recherche.',
    // Les filtres.
    labelRecherche: 'Rechercher une carte',
    placeholderRecherche: 'Nom de la carte',
    labelFiltreRarete: 'Rareté',
    toutesRaretes: 'Toutes les raretés',
    labelFiltreEffet: 'Effet',
    tousEffets: 'Tous les effets',
    effetsAutomatique: 'Effet automatique',
    effetsForce: 'Effet forcé',
    effetsAucun: 'Sans effet',
    labelGalerie: 'Cartes de la collection',
    // Petits badges sur une carte dont l'effet n'est pas celui de sa rareté.
    badgeEffetForce: 'Effet : {nom}',
    badgeSansEffet: 'Sans effet',
    // Le petit badge sur une carte dont les proportions ne sont pas celles d'une carte.
    badgeRatio: 'Ratio ≠ 5:7',

    // --- Messages d'erreur ---
    erreurNonConnecte: 'Ta session a expiré. Reconnecte-toi.',
    erreurNonAutorise: 'Action refusée : seul un administrateur peut faire cela.',
    erreurCartePossedee:
      'Cette carte est possédée par au moins un joueur : elle ne peut pas être supprimée. Désactive-la plutôt.',
    erreurLimiteAtteinte: 'Tu as déjà ouvert tous tes boosters du jour.',
    erreurAucuneCarte: 'Aucune carte n’est disponible pour le moment.',
    erreurReseau: 'Impossible de joindre le serveur. Vérifie ta connexion.',
    erreurInconnue: 'Une erreur est survenue. Réessaie.',
    erreurInfosInvalides: 'Le serveur refuse ces informations.',
    erreurImageInvalide: 'Le serveur refuse cette image.',
    erreurTropGros: 'Les images sont trop lourdes pour être envoyées.',
    erreurIntrouvable: 'Cette carte n’existe plus.',

    // --- Ajout de cartes ---
    boutonAjouter: 'Ajouter des cartes',
    zoneConsigne: 'Glisse tes images ici',
    zoneOu: 'ou',
    zoneChoisir: 'Choisis des fichiers',
    zoneFormats: 'PNG, JPG ou WebP · plusieurs à la fois',
    optimisation: 'Optimisation de l’image…',
    envoi: 'Enregistrement…',
    labelApercu: 'Aperçu de {nom}',
    // Avertissement quand l'image n'a pas les proportions d'une carte.
    alerteRatio:
      'Proportions inhabituelles ({largeur} × {hauteur} px). Une carte fait environ {attendu} px. L’image ne sera pas déformée.',
    // Les raisons pour lesquelles un fichier est refusé.
    erreurFormat: 'Format non accepté : seuls PNG, JPG et WebP sont acceptés.',
    erreurTaille: 'Fichier trop lourd.',
    erreurIllisible: 'Image illisible.',
    retirer: 'Retirer',
    enregistrerTout: 'Enregistrer les cartes',
    enregistrerUne: 'Enregistrer la carte',
    fermerAjout: 'Fermer',
    // Le bilan, après l'enregistrement.
    bilanUne: '{nombre} carte enregistrée.',
    bilanPlusieurs: '{nombre} cartes enregistrées.',

    // --- Infos d'une carte (formulaire) ---
    labelNom: 'Nom de la carte',
    labelRarete: 'Rareté',
    labelVariante: 'Variante',
    labelEffet: 'Effet',
    effetTitre: 'Effet visuel',
    effetAutomatique: 'Automatique ({nom})',
    effetAutomatiqueSimple: 'Automatique (effet de la rareté)',
    effetAutre: 'Autre effet',
    effetAucun: 'Aucun effet',
    effetRevenir: 'Revenir à l’automatique',
    effetAide:
      'L’image de la carte reste fixe : l’effet est ajouté à l’affichage. « Automatique » suit la rareté (page Effets).',
    labelActive: 'Carte active',
    aideActive: 'Une carte désactivée ne sort plus des boosters, mais reste dans les collections.',
    badgeInactive: 'Désactivée',
    erreurNomVide: 'Le nom est obligatoire.',
    erreurNomTropLong: 'Nom trop long ({max} caractères maximum).',
    erreurVarianteRequise: 'Choisis une variante.',
    erreurVarianteInvalide: 'Cette variante n’existe pas pour cette rareté.',

    // --- Vue détaillée d'une carte ---
    modifier: 'Modifier',
    supprimer: 'Supprimer',
    fermer: 'Fermer',
    enregistrer: 'Enregistrer',
    annuler: 'Annuler',
    confirmerSuppression: 'Supprimer « {nom} » ? Cette action est définitive.',
    confirmerOui: 'Oui, supprimer',
    desactiver: 'Désactiver',
    activer: 'Activer',
    confirmerDesactivation:
      'Désactiver « {nom} » ? Elle ne sortira plus des boosters, mais restera dans les collections.',
    confirmerDesactiverOui: 'Oui, désactiver',
    infoRatio: 'Image de {largeur} × {hauteur} px : proportions inhabituelles.',
    exemplairesUn: 'Tu possèdes cette carte en 1 exemplaire.',
    exemplairesPlusieurs: 'Tu possèdes cette carte en {quantite} exemplaires.',
  },

  // ---------------------------------------------------------------------------------
  // BARRE D'ONGLETS (en bas sur téléphone, à gauche sur ordinateur)
  // ---------------------------------------------------------------------------------
  navigation: {
    label: 'Navigation principale',
    onglets: {
      HOME: 'Accueil',
      COLLECTION: 'Collection',
      JOUER: 'Jouer',
      INSTALLER: 'Installer',
      ADMIN: 'Admin',
    },
  },

  // ---------------------------------------------------------------------------------
  // COLLECTION DU JOUEUR
  // ---------------------------------------------------------------------------------
  collection: {
    titre: 'Collection',
    // {possedees} et {total} sont remplacés automatiquement.
    progression: '{possedees} / {total} cartes',
    labelProgression: 'Progression de la collection',
    labelFiltre: 'Rareté',
    toutesRaretes: 'Toutes les raretés',
    labelCompteurs: 'Cartes obtenues par rareté',
    compteurRarete: '{possedees} / {total}',
    labelGrille: 'Cartes de la collection',
    // Texte lu par les lecteurs d'écran pour un emplacement vide.
    nonObtenue: 'Carte pas encore obtenue ({rarete})',
    // Petit texte sur une carte possédée en plusieurs exemplaires.
    exemplaires: '×{quantite}',
    chargement: 'Chargement de ta collection…',
    erreur: 'Impossible de charger ta collection.',
    reessayer: 'Réessayer',
    vide: 'Aucune carte dans le jeu pour le moment.',
    videFiltre: 'Aucune carte de cette rareté.',
  },

  // ---------------------------------------------------------------------------------
  // ONGLET « JOUER »
  // ---------------------------------------------------------------------------------
  jouer: {
    titre: 'Jouer',
    bientot: 'Bientôt disponible',
    detail: 'Les parties arrivent dans une prochaine version. En attendant, ouvre des boosters !',
  },

  // ---------------------------------------------------------------------------------
  // PAGE « INSTALLER L'APPLI »
  // ---------------------------------------------------------------------------------
  installer: {
    titre: 'Installer l’appli',
    intro:
      'Installe SWAG sur ton appareil : elle s’ouvre en plein écran, comme une vraie appli, sans passer par une boutique.',
    dejaInstallee: 'SWAG est déjà installée sur cet appareil.',
    boutonInstaller: 'Installer maintenant',
    badgeAppareil: 'Ton appareil',
    android: {
      titre: 'Android (Chrome)',
      etapes: [
        'Ouvre le site avec Chrome.',
        'Touche le menu ⋮ en haut à droite.',
        'Choisis « Installer l’application » (ou « Ajouter à l’écran d’accueil »).',
        'Confirme : l’icône SWAG apparaît parmi tes applis.',
      ],
    },
    ios: {
      titre: 'iPhone et iPad (Safari)',
      etapes: [
        'Ouvre le site avec Safari (pas avec un autre navigateur).',
        'Touche le bouton Partager (le carré avec une flèche vers le haut).',
        'Fais défiler et choisis « Sur l’écran d’accueil ».',
        'Touche « Ajouter » : l’icône SWAG apparaît sur ton écran d’accueil.',
      ],
      remarque:
        'Sur iPhone, l’appli installée est séparée de Safari : tu devras t’y reconnecter une fois.',
    },
    bureau: {
      titre: 'Ordinateur (Chrome ou Edge)',
      etapes: [
        'Ouvre le site avec Chrome ou Edge.',
        'Clique sur l’icône « Installer » à droite de la barre d’adresse (ou menu ⋮ puis « Installer SWAG »).',
        'Confirme : SWAG s’ouvre dans sa propre fenêtre.',
      ],
    },
  },

  // ---------------------------------------------------------------------------------
  // CHOIX DU MOT DE PASSE (après un lien d'invitation ou de « mot de passe oublié »)
  // {min} est remplacé automatiquement par la longueur minimale : garde-le tel quel.
  // ---------------------------------------------------------------------------------
  motDePasse: {
    titre: 'Choisis ton mot de passe',
    consigne:
      'Bienvenue ! Choisis un mot de passe : il te servira à te connecter la prochaine fois.',
    labelNouveau: 'Nouveau mot de passe',
    labelConfirmation: 'Confirme le mot de passe',
    bouton: 'Enregistrer mon mot de passe',
    enCours: 'Enregistrement…',
    erreurTropCourt: 'Ton mot de passe doit faire au moins {min} caractères.',
    erreurDifferent: 'Les deux mots de passe ne sont pas identiques.',
    erreurFaible:
      'Ce mot de passe est trop facile à deviner. Ajoute des lettres, des chiffres ou des symboles.',
    erreurMeme: 'Choisis un mot de passe différent de l’ancien.',
    erreurTropDeTentatives: 'Trop d’essais. Attends quelques minutes, puis réessaie.',
    erreurReseau: 'Impossible de joindre le serveur. Vérifie ta connexion.',
    erreurInconnue: 'Impossible d’enregistrer le mot de passe. Réessaie.',
  },

  // ---------------------------------------------------------------------------------
  // MISES À JOUR DE L'APPLI
  // Dans les textes, {version}, {actuelle}, {requise} sont remplacés automatiquement : garde-les tels quels.
  // ---------------------------------------------------------------------------------
  miseAJour: {
    // Le bandeau qui apparaît quand une nouvelle version est prête.
    titre: 'Nouvelle version disponible',
    version: 'Version {version}',
    labelNotes: 'Nouveautés de cette version',
    boutonMettreAJour: 'Mettre à jour',
    boutonPlusTard: 'Plus tard',
    enCours: 'Mise à jour…',
    // L'écran qui bloque l'appli quand la version est trop ancienne.
    titreObligatoire: 'Mise à jour obligatoire',
    texteObligatoire:
      'Cette version de SWAG n’est plus acceptée. Mets l’appli à jour pour continuer à jouer.',
    versions: 'Ta version : {actuelle} · Version minimum : {requise}',
  },

  // ---------------------------------------------------------------------------------
  // CONNEXION
  // ---------------------------------------------------------------------------------
  connexion: {
    titre: 'Connexion',
    consigne: 'Connecte-toi avec ton compte.',
    labelEmail: 'Adresse e-mail',
    labelMotDePasse: 'Mot de passe',
    boutonConnecter: 'Se connecter',
    enCours: 'Connexion…',
    note: 'Pas encore de compte ? Demande une invitation à l’administrateur.',
    chargement: 'Chargement…',
    erreurChamps: 'Renseigne ton adresse e-mail et ton mot de passe.',
    erreurIdentifiants: 'Adresse e-mail ou mot de passe incorrect.',
    erreurTropDeTentatives: 'Trop d’essais. Attends quelques minutes, puis réessaie.',
    erreurReseau: 'Impossible de joindre le serveur. Vérifie ta connexion.',
    erreurInconnue: 'Connexion impossible. Réessaie.',
    erreurProfil: 'Impossible de lire ton profil. Réessaie, ou déconnecte-toi.',
    reessayer: 'Réessayer',
    deconnexion: 'Se déconnecter',
    // Quand le joueur clique sur un lien d'e-mail périmé ou déjà utilisé.
    lienExpire:
      'Ce lien n’est plus valable (périmé ou déjà utilisé). Demande-en un nouveau avec « Mot de passe oublié ? », ou contacte l’administrateur.',
    // « Mot de passe oublié ? »
    oubli: {
      lien: 'Mot de passe oublié ?',
      consigne:
        'Entre ton adresse e-mail : si un compte existe, tu recevras un lien pour choisir un nouveau mot de passe.',
      bouton: 'Envoyer le lien',
      enCours: 'Envoi…',
      envoye:
        'C’est envoyé ! Regarde tes e-mails (et les courriers indésirables). Le lien reste valable une heure.',
      retour: 'Retour à la connexion',
      erreurChamp: 'Renseigne ton adresse e-mail.',
      erreurTropDeTentatives:
        'Trop de demandes. Attends un peu (une heure au plus), puis réessaie.',
      erreurReseau: 'Impossible de joindre le serveur. Vérifie ta connexion.',
      erreurInconnue: 'Envoi impossible. Réessaie.',
    },
    nonConfigure:
      'La connexion n’est pas configurée : le fichier .env (URL et clé Supabase) est manquant. Voir supabase/README.md.',
  },

  // ---------------------------------------------------------------------------------
  // ESPACE ADMINISTRATEUR
  // Dans les textes, {nombre}, {min}, {max}, {nom}… sont remplacés automatiquement : garde-les tels quels.
  // ---------------------------------------------------------------------------------
  admin: {
    titre: 'Administration',
    labelOnglets: 'Sections de l’administration',
    refuse: 'Cet espace est réservé aux administrateurs.',
    onglets: {
      cartes: 'Cartes',
      boosters: 'Boosters',
      joueurs: 'Joueurs',
      effets: 'Effets',
      version: 'Version',
    },
    chargement: 'Chargement…',
    erreurChargement: 'Impossible de charger cette section.',
    reessayer: 'Réessayer',

    // Page de démonstration des effets visuels (V0.1.5) : sur une carte fictive, sans photo.
    effets: {
      titre: 'Effets des cartes',
      intro:
        'Teste chaque effet sur une carte fictive (aucune photo). L’image d’une carte reste fixe : l’effet est une couche ajoutée à l’affichage.',
      labelApercu: 'Aperçu de l’effet',
      aideApercu:
        'Passe la souris sur la carte, ou incline ton téléphone, ou glisse le doigt dessus.',
      effet: 'Effet',
      mode: 'Mode',
      modes: {
        statique: 'Image fixe (grilles)',
        anime: 'Animé',
        interactif: 'Animé et interactif',
      },
      zone: 'Zone',
      zones: {
        defaut: 'Zone de l’effet',
        carte: 'Toute la carte',
        interieur: 'Intérieur du cadre',
        illustration: 'Illustration encadrée',
        cadre: 'Cadre seulement',
      },
      intensite: 'Intensité : {valeur} %',
      effetsReduits: 'Effets réduits (qualité éco, sans animation)',
      titreDefaut: 'Effet par défaut selon la rareté',
      aideDefaut:
        'Choisir une ligne l’affiche dans l’aperçu. Les petites cartes sont en image fixe, comme dans une collection.',
      sansVariante: '{rarete}',
      avecVariante: '{rarete} · {variante}',
      enregistrer: 'Enregistrer cette rareté',
      annuler: 'Annuler les changements',
      enregistre: 'Effet enregistré pour {nom}.',
      aucunChangement: 'Aucun changement à enregistrer.',
      erreurEnregistrement: 'Impossible d’enregistrer. Réessaie.',
      nonEnregistre: 'Modifié, pas encore enregistré',
      aideEdition:
        'Les réglages ci-dessus s’appliquent à la rareté choisie dans la liste. Ils valent pour toutes ses cartes en mode « Automatique ».',
    },

    boosters: {
      titre: 'Boosters',
      labelCartes: 'Cartes par booster',
      aideCartes: 'Un nombre entier entre {min} et {max}.',
      labelParJour: 'Boosters par joueur et par jour',
      aideParJour:
        'Entre {min} et {max}. La limite se remet à zéro chaque jour à minuit (heure de Paris).',
      titreProbabilites: 'Probabilité de chaque rareté (en %)',
      aideProbabilites: 'Le total doit faire exactement 100 %.',
      total: 'Total : {total} %',
      totalOk: 'Le total fait bien 100 %.',
      totalManque: 'Il manque {ecart} % pour arriver à 100 %.',
      totalDepasse: 'Il y a {ecart} % de trop.',
      boutonDefaut: 'Valeurs par défaut',
      boutonEnregistrer: 'Enregistrer',
      enregistrement: 'Enregistrement…',
      succes: 'Réglages enregistrés.',
      erreurCartes: 'Le nombre de cartes doit être un entier entre {min} et {max}.',
      erreurParJour: 'Le nombre de boosters par jour doit être un entier entre {min} et {max}.',
      erreurProbabilite:
        'Chaque probabilité doit être un nombre positif, avec 2 décimales au maximum.',
    },

    joueurs: {
      titre: 'Joueurs',
      total: { un: '{nombre} joueur', plusieurs: '{nombre} joueurs' },
      aide: 'Lecture seule. Pour ajouter un joueur ou changer un rôle, utilise Supabase (voir supabase/README.md).',
      sansPseudo: 'Pas encore de pseudo',
      badgeAdmin: 'Admin',
      cartes: {
        aucune: 'Aucune carte',
        une: '{nombre} carte ({differentes} différente)',
        plusieurs: '{nombre} cartes ({differentes} différentes)',
      },
      inscritLe: 'Inscrit le {date}',
      vide: 'Aucun joueur pour le moment.',
    },

    version: {
      titre: 'Version',
      labelEnLigne: 'Version en ligne',
      aideEnLigne:
        'C’est la version de l’appli que tu utilises en ce moment (celle qui est publiée).',
      labelMin: 'Version minimum requise',
      aideMin:
        'Un joueur dont l’appli est plus ancienne que cette version verra un écran « Mise à jour obligatoire ».',
      erreurFormat:
        'Écris la version avec trois nombres séparés par des points, par exemple 0.1.0.',
      alerteTropHaute:
        'Attention : {min} est plus récente que la version en ligne ({enLigne}). Personne, toi compris, ne pourrait plus utiliser l’appli tant que cette version n’est pas publiée.',
      confirmerTropHaute: 'Je comprends, enregistrer quand même',
      boutonEnregistrer: 'Enregistrer',
      enregistrement: 'Enregistrement…',
      succes: 'Version minimum enregistrée.',
    },
  },

  // ---------------------------------------------------------------------------------
  // POUR PLUS TARD : les autres écrans s'ajouteront ici, sur le même modèle.
  // ---------------------------------------------------------------------------------
};
