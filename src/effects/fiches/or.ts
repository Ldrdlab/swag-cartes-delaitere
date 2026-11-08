/**
 * Or (Secrète, variante Or) : métal miroir chaud.
 * Expose : fiche (export par défaut). Dépend de : effects/fiches/metal.
 */
import { ficheMetal } from './metal';

export default ficheMetal({
  studio:
    'linear-gradient(115deg, #5a3d04 0%, #fff1b8 14%, #8a6508 28%, #fffbe6 42%, #6b4a06 58%, #f9e08a 74%, #5a3d04 100%)',
  teinte: '#d4a017',
  opaciteTeinte: 0.35,
  gravure: '#5a3d00',
  poussiere: '#fff3c4',
});
