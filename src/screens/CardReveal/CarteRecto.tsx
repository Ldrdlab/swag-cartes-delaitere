/**
 * Face d'une carte (recto).
 *
 * Rôle : afficher la vraie carte (visuel fini, avec son cadre) grâce au composant <Carte />, l'unique
 * endroit qui sait afficher un visuel de carte. Si la rareté a un reflet holographique (effets de
 * révélation activés, voir config/raretes.ts), il est posé par-dessus.
 * Expose : le composant `CarteRecto`.
 * Dépend de : components/Carte, config/raretes, domain/types (type), effets/ReflexHolo.
 */
import { Carte } from '../../components/Carte';
import { RARETES } from '../../config/raretes';
import type { Card } from '../../domain/types';
import { ReflexHolo } from './effets/ReflexHolo';

interface CarteRectoProps {
  carte: Card;
  /** `grande` = image complète (scène) ; `miniature` = petite image (bilan). */
  taille?: 'miniature' | 'grande';
  /** Affiche le reflet holographique (pour les raretés qui en ont un). */
  avecReflet?: boolean;
}

/** Recto d'une carte. Il prend toute la largeur de son conteneur. */
export function CarteRecto({ carte, taille = 'grande', avecReflet = true }: CarteRectoProps) {
  const rarete = RARETES[carte.rarity];
  return (
    <Carte
      carte={carte}
      taille={taille}
      decorative
      calques={avecReflet && rarete.reflet ? <ReflexHolo /> : undefined}
    />
  );
}
