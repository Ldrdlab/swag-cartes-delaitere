/**
 * Face d'une carte (recto).
 *
 * Rôle : afficher la vraie carte (visuel fini, avec son cadre) grâce au composant <Carte />, l'unique
 * endroit qui sait afficher un visuel de carte, avec son effet visuel (animé une fois la carte retournée).
 * Si la rareté a un reflet holographique (effets de révélation activés, voir config/raretes.ts), il est
 * posé par-dessus. Pour les raretés à partir du seuil de config/effets.ts (REVELATION_EFFETS), un éclat
 * sobre accompagne le retournement.
 * Expose : le composant `CarteRecto`.
 * Dépend de : components/Carte, config/effets, config/raretes, domain/effetsCartes (type), domain/types,
 * effects/preferences, effets/EclatRevelation, effets/ReflexHolo.
 */
import { Carte } from '../../components/Carte';
import { REVELATION_EFFETS } from '../../config/effets';
import { RARETES } from '../../config/raretes';
import type { ModeEffet } from '../../domain/effetsCartes';
import { RARITIES, type Card } from '../../domain/types';
import { useEffetsReduits } from '../../effects/preferences';
import { EclatRevelation } from './effets/EclatRevelation';
import { ReflexHolo } from './effets/ReflexHolo';

interface CarteRectoProps {
  carte: Card;
  /** `grande` = image complète (scène) ; `miniature` = petite image (bilan). */
  taille?: 'miniature' | 'grande';
  /** Affiche le reflet holographique (pour les raretés qui en ont un). */
  avecReflet?: boolean;
  /** Façon dont l'effet de la carte vit : fixe (défaut), ou animé et interactif (carte retournée). */
  modeEffet?: ModeEffet;
  /** Vrai quand la carte se retourne : l'éclat de révélation peut partir (raretés élevées). */
  retournee?: boolean;
}

/** Recto d'une carte. Il prend toute la largeur de son conteneur. */
export function CarteRecto({
  carte,
  taille = 'grande',
  avecReflet = true,
  modeEffet = 'anime',
  retournee = false,
}: CarteRectoProps) {
  const rarete = RARETES[carte.rarity];
  const reduits = useEffetsReduits();
  const seuil = REVELATION_EFFETS.rareteMinimale;
  const avecEclat =
    retournee &&
    !reduits &&
    seuil !== null &&
    RARITIES.indexOf(carte.rarity) >= RARITIES.indexOf(seuil);
  return (
    <Carte
      carte={carte}
      taille={taille}
      decorative
      modeEffet={modeEffet}
      calques={
        <>
          {avecReflet && rarete.reflet ? <ReflexHolo /> : null}
          {avecEclat ? <EclatRevelation /> : null}
        </>
      }
    />
  );
}
