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
  // ÉCRAN DE CHOIX DU BOOSTER
  // (Les noms et les textes des boosters eux-mêmes sont dans src/boosters/themes/.)
  // Dans les textes, {numero} et {total} sont remplacés automatiquement : garde-les tels quels.
  // ---------------------------------------------------------------------------------
  choixBooster: {
    // La phrase dans la pilule blanche en haut de l'écran.
    titre: 'Choisis un booster.',
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
    photoAVenir: 'Photo à venir',
    // Le pied de la carte : numéro de la carte dans la collection.
    pied: 'SWAG · {numero} / {total}',
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
  // POUR PLUS TARD : les autres écrans s'ajouteront ici, sur le même modèle.
  // ---------------------------------------------------------------------------------
};
