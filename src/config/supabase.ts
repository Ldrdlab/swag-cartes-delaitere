/**
 * Réglages de l'utilisation de Supabase.
 *
 * Rôle : centraliser le nom du bucket des images et la durée de validité des adresses d'images.
 * Les images des cartes sont dans un bucket PRIVÉ : l'appli demande des adresses « signées »,
 * temporaires, réservées aux utilisateurs connectés.
 * Expose : STOCKAGE_SUPABASE.
 * Dépend de : rien.
 */
export const STOCKAGE_SUPABASE = {
  /** Nom du bucket privé qui contient les images (créé par supabase/migrations/…000400_stockage.sql). */
  bucketCartes: 'cards',
  /** Durée de validité d'une adresse d'image signée (secondes) : 2 heures. */
  dureeAdresseSigneeS: 2 * 60 * 60,
  /** Délai de mise en cache des images par le navigateur (secondes) : 1 heure. */
  cacheImagesS: 3600,
} as const;
