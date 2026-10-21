/**
 * Liste des avatars proposés aux joueurs.
 *
 * Rôle : seule source de vérité sur les avatars. Le sélecteur affiche automatiquement tout ce qui est
 * dans cette liste : le nombre d'avatars ne dépend que d'elle.
 * Expose : Avatar, AVATARS, ID_AVATAR_PAR_DEFAUT, trouverAvatar().
 * Dépend de : les images du dossier src/assets/images/avatars/.
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ REMPLACER un avatar par une photo : dépose une image CARRÉE de 256 × 256 px, au     │
 * │   format WebP et de moins de 30 Ko, dans le dossier src/assets/images/avatars/.     │
 * │   Puis, sur la ligne de cet avatar, change le nom du fichier dans l'import          │
 * │   en haut (ex. './avatar-01.svg' devient './ma-photo.webp').                        │
 * │ AJOUTER un avatar : dépose son image dans le dossier, ajoute une ligne `import`     │
 * │   en haut, puis copie une ligne `{ ... },` de la liste et change `id`, `nom`        │
 * │   et `image`. L'`id` doit être UNIQUE et ne doit plus changer ensuite (c'est        │
 * │   lui qui est enregistré dans le profil du joueur).                                 │
 * │ SUPPRIMER un avatar : efface sa ligne. Les joueurs qui l'avaient retrouvent         │
 * │   l'avatar par défaut.                                                              │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import avatar01 from '../assets/images/avatars/avatar-01.svg';
import avatar02 from '../assets/images/avatars/avatar-02.svg';
import avatar03 from '../assets/images/avatars/avatar-03.svg';
import avatar04 from '../assets/images/avatars/avatar-04.svg';
import avatar05 from '../assets/images/avatars/avatar-05.svg';

/** Un avatar proposé au joueur. */
export interface Avatar {
  /** Identifiant unique, enregistré dans le profil (ne plus le changer une fois utilisé). */
  id: string;
  /** Nom lisible, lu par les lecteurs d'écran (l'image seule n'est pas décrite). */
  nom: string;
  /** Image importée (carrée). */
  image: string;
}

/** Les avatars disponibles, dans l'ordre d'affichage. */
export const AVATARS: readonly Avatar[] = [
  { id: 'avatar-01', nom: 'Personnage aux lunettes de soleil', image: avatar01 },
  { id: 'avatar-02', nom: 'Personnage au chapeau de fête', image: avatar02 },
  { id: 'avatar-03', nom: 'Personnage à la couronne dorée', image: avatar03 },
  { id: 'avatar-04', nom: 'Personnage au casque audio', image: avatar04 },
  { id: 'avatar-05', nom: 'Personnage à la mèche violette', image: avatar05 },
];

/** Avatar attribué à un joueur qui n'en a pas encore choisi (doit exister dans AVATARS). */
export const ID_AVATAR_PAR_DEFAUT = 'avatar-02';

/**
 * Retrouve un avatar à partir de son identifiant.
 *
 * @param id - Identifiant enregistré dans le profil (peut être absent ou ne plus exister).
 * @returns L'avatar correspondant, sinon l'avatar par défaut, sinon le premier de la liste.
 * @throws Si la liste AVATARS est vide (erreur de configuration).
 */
export function trouverAvatar(id: string | undefined): Avatar {
  const avatar =
    AVATARS.find((candidat) => candidat.id === id) ??
    AVATARS.find((candidat) => candidat.id === ID_AVATAR_PAR_DEFAUT) ??
    AVATARS[0];
  if (!avatar) {
    throw new Error('Aucun avatar défini dans config/avatars.ts');
  }
  return avatar;
}
