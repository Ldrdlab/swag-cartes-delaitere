/**
 * Feu (Mythique, variante Feu) : flammes WebGL qui montent du bas et lèchent les côtés, braises, lueur
 * chaude pulsante en CSS ; le centre (illustration) reste lisible.
 * Expose : fiche (export par défaut). Dépend de : effects/socle/construction, effects/webgl/CanevasNuanceur,
 * effects/fiches/feuNuanceur.
 *
 * Repli sans WebGL : les calques CSS seuls (lueur, teinte chaude, braises fixes). Figé (grille,
 * hors écran), le nuanceur dessine une seule image, à l'instant de la pose.
 * Idée de la couleur selon la profondeur : neungkl/fire-simulation (MIT) ; nuanceur original.
 */
import type { FicheEffet, PropsComposantEffet } from '../types';
import {
  animer,
  calque,
  estEco,
  paillettes,
  reglage,
  REGLAGE_VITESSE,
} from '../socle/construction';
import { CanevasNuanceur } from '../webgl/CanevasNuanceur';
import { FEU_FRAGMENTS } from './feuNuanceur';

const REGLAGES = [REGLAGE_VITESSE];
/** Instant figé du nuanceur (secondes) : des flammes bien formées. */
const TEMPS_POSE = 2.6;
const OCTAVES_HAUTES = 5;
const OCTAVES_ECO = 3;
/** Les flammes sont un peu plus fortes que le réglage d'intensité (plafonné à 1). */
const RENFORT_FLAMMES = 1.2;

function Flammes({ intensite, reglages, qualite, fige }: PropsComposantEffet) {
  return (
    <CanevasNuanceur
      fragments={FEU_FRAGMENTS}
      uniformes={{
        u_intensity: Math.min(1, intensite * RENFORT_FLAMMES),
        u_speed: reglages.vitesse ?? REGLAGE_VITESSE.defaut,
        u_octaves: qualite === 'eco' ? OCTAVES_ECO : OCTAVES_HAUTES,
      }}
      fige={fige}
      tempsPose={TEMPS_POSE}
      fusion="screen"
    />
  );
}

const fiche: FicheEffet = {
  zone: 'interieur',
  cout: 'eleve',
  animeAuRepos: true,
  reglages: REGLAGES,
  calques: (c) => {
    const vitesse = reglage(c, 'vitesse', REGLAGES);
    return [
      calque(c, 'linear-gradient(0deg, #ff5a1f 0%, #ff8a3d22 45%, #0000 70%)', 'soft-light', 0.8),
      calque(
        c,
        'radial-gradient(ellipse 90% 45% at 50% 105%, #ff7b2ecc, #ff3d0055 55%, #0000 75%)',
        'screen',
        0.7,
        estEco(c)
          ? {}
          : {
              animation: animer('pulse', 1.8, vitesse),
              variables: {
                '--pulse-low': String(0.45 * c.intensite),
                '--pulse-high': String(0.8 * c.intensite),
              },
            },
      ),
      paillettes(c, 7, 0.45, '#ffb36b', 0.1),
      calque(c, '#c1121f', 'overlay', 0.12),
    ];
  },
  Composant: Flammes,
};

export default fiche;
