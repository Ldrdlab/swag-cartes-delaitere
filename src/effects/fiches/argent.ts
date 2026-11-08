/**
 * Argent (Secrète, variante Argent) : métal miroir froid.
 * Expose : fiche (export par défaut). Dépend de : effects/fiches/metal.
 */
import { ficheMetal } from './metal';

export default ficheMetal({
  studio:
    'linear-gradient(115deg, #2c3540 0%, #f4f7fb 14%, #4f5d6d 28%, #ffffff 42%, #3c4652 58%, #dfe6ee 74%, #2c3540 100%)',
  teinte: '#aeb8c4',
  opaciteTeinte: 0.25,
  gravure: '#2f3a46',
  poussiere: '#eef6ff',
});
