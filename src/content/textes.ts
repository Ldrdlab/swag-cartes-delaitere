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
  // POUR PLUS TARD : les autres écrans s'ajouteront ici, sur le même modèle.
  // Exemple (à décommenter et compléter quand on habillera l'écran Profil) :
  //
  // profil: {
  //   // Le titre en haut de l'écran Profil.
  //   titre: 'Ton profil',
  //   // L'étiquette au-dessus du champ pseudo.
  //   labelPseudo: 'Pseudonyme',
  // },
  //
  // choixBooster: {
  //   // Le titre en haut de l'écran de choix du booster.
  //   titre: 'Choisissez un booster',
  // },
  // ---------------------------------------------------------------------------------
};
