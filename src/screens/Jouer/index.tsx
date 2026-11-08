/**
 * Onglet « Jouer ».
 *
 * Rôle : emplacement du futur mode de jeu. En V0.1 il affiche seulement « Bientôt disponible ».
 * Expose : le composant `JouerScreen`.
 * Dépend de : components/PageOnglet, content/textes, Jouer.module.css.
 */
import { PageOnglet } from '../../components/PageOnglet';
import { TEXTES } from '../../content/textes';
import styles from './Jouer.module.css';

/** Onglet « Jouer » (à venir). */
export function JouerScreen() {
  const textes = TEXTES.jouer;
  return (
    <PageOnglet titre={textes.titre}>
      <section className={styles.carte}>
        <p className={styles.bientot}>{textes.bientot}</p>
        <p className={styles.detail}>{textes.detail}</p>
      </section>
    </PageOnglet>
  );
}
