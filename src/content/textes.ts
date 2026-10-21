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
    // La phrase qui clignote doucement en bas de l'écran.
    invitation: 'Touchez pour commencer',
    // Le numéro de version, en haut à gauche.
    version: 'Version 0.1.0',
    // Le mot qui précède le pseudo, en haut à gauche (sous la version).
    labelJoueur: 'Joueur :',
    // Ce qui s'affiche à la place du pseudo quand aucun profil n'est enregistré.
    pseudoAbsent: '—',
    // Les mentions légales, tout en bas de l'écran.
    mentions: '© Cartes Délaitère 2026',
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
    erreurSauvegarde: "Impossible d'enregistrer le profil sur cet appareil. Réessaie.",
  },

  // ---------------------------------------------------------------------------------
  // POUR PLUS TARD : les autres écrans s'ajouteront ici, sur le même modèle.
  // Exemple (à décommenter et compléter quand on habillera l'écran de choix du booster) :
  //
  // choixBooster: {
  //   // Le titre en haut de l'écran de choix du booster.
  //   titre: 'Choisissez un booster',
  // },
  // ---------------------------------------------------------------------------------
};
