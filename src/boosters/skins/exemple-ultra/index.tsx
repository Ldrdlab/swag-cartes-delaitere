/**
 * Skin « exemple-ultra » : MODÈLE COMMENTÉ de skin avancée, à copier. Aucun booster ne l'utilise.
 *
 * Ce qu'elle montre :
 *  1. Plusieurs CALQUES superposés, chacun avec sa PROFONDEUR (0 = fond immobile, 1 = premier plan).
 *  2. Une inclinaison 3D : le paquet penche et les calques se décalent selon leur profondeur. Elle suit
 *     la souris sur ordinateur et, sur téléphone, l'orientation de l'appareil si l'utilisateur
 *     l'autorise (voir hooks/useInclinaison).
 *  3. Des paillettes animées (opacity + transform).
 *
 * Maîtrise des performances :
 *  - on n'anime que `transform` et `opacity` ;
 *  - tout est en pause (rien ne bouge, pas de paillettes, pas d'écouteurs) quand le booster n'est pas
 *    au centre ou en confirmation ;
 *  - les calques d'images sont de simples <div> à fond d'image : le navigateur les met sur la carte
 *    graphique et ne les redessine pas.
 *
 * Pour s'en servir : dans catalogue.ts, mets `skin: 'exemple-ultra'` à un booster. Ses calques viennent
 * de `theme.calques` (images `src/assets/images/boosters/<id>/<fichier>.webp`). Sans `calques`, les
 * calques de `theme.illustration` sont utilisés à la place, pour pouvoir tester tout de suite.
 *
 * Pour créer ta propre skin : copie ce dossier, renomme-le, ajoute son nom dans `NomSkin`
 * (skins/types.ts) et dans `registre.ts`.
 *
 * Expose : le composant `SkinExempleUltra`.
 * Dépend de : react, hooks/useInclinaison, boosters/skins/Fenetre, boosters/skins/imagesBoosters,
 * Ultra.module.css.
 */
import { useRef, type CSSProperties } from 'react';
import { useInclinaison } from '../../../hooks/useInclinaison';
import type { ThemeBooster } from '../../themes/types';
import { Fenetre } from '../Fenetre';
import { urlImageBooster } from '../imagesBoosters';
import type { PropsSkin } from '../types';
import styles from './Ultra.module.css';

/** Un calque prêt à afficher : une image de fond CSS et sa profondeur. */
interface CalquePret {
  fond: string;
  profondeur: number;
}

/** Positions (en %) et retards (en s) des paillettes : fixes, pour que le rendu soit toujours le même. */
const PAILLETTES = [
  { x: 14, y: 20, retard: 0 },
  { x: 78, y: 14, retard: 0.6 },
  { x: 60, y: 38, retard: 1.1 },
  { x: 22, y: 52, retard: 1.7 },
  { x: 86, y: 58, retard: 0.3 },
  { x: 40, y: 72, retard: 1.4 },
  { x: 70, y: 82, retard: 0.9 },
  { x: 12, y: 86, retard: 2 },
];

/** Construit la liste des calques : images du thème si elles existent, sinon calques CSS de l'illustration. */
function construireCalques(theme: ThemeBooster): CalquePret[] {
  const images = (theme.calques ?? []).flatMap((calque) => {
    const url = urlImageBooster(theme.id, calque.fichier);
    return url ? [{ fond: `url("${url}")`, profondeur: calque.profondeur }] : [];
  });
  if (images.length > 0) return images;

  // Secours : le dernier calque de l'illustration est le fond, le premier est le plus en avant.
  const arriereVersAvant = [...theme.illustration].reverse();
  const dernier = Math.max(arriereVersAvant.length - 1, 1);
  return arriereVersAvant.map((fond, rang) => ({ fond, profondeur: rang / dernier }));
}

/** Skin avancée (voir le commentaire d'en-tête). */
export function SkinExempleUltra({ theme, etat, partie }: PropsSkin) {
  const sceneRef = useRef<HTMLDivElement>(null);
  // Les animations ne tournent que pour le booster qui est au centre de l'attention.
  const actif = etat === 'centre' || etat === 'confirmation';
  useInclinaison(sceneRef, actif);

  return (
    <Fenetre partie={partie}>
      <div ref={sceneRef} className={styles.scene}>
        {construireCalques(theme).map((calque, rang) => (
          <div
            key={rang}
            className={styles.calque}
            style={
              { backgroundImage: calque.fond, '--profondeur': calque.profondeur } as CSSProperties
            }
          />
        ))}
        {actif &&
          PAILLETTES.map((paillette, rang) => (
            <span
              key={rang}
              className={styles.paillette}
              style={{
                left: `${paillette.x}%`,
                top: `${paillette.y}%`,
                animationDelay: `${paillette.retard}s`,
              }}
            />
          ))}
      </div>
    </Fenetre>
  );
}
