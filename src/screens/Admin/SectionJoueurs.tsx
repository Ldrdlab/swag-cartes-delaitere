/**
 * Section « Joueurs » de l'espace admin : la liste des joueurs et leur nombre de cartes (lecture seule).
 *
 * Rôle : afficher chaque compte (pseudo, e-mail, rôle, date d'inscription, cartes possédées). La liste
 * vient de la fonction `admin_list_players()` de la base, réservée à l'admin.
 * Expose : le composant `SectionJoueurs`.
 * Dépend de : react, content/formatTexte, content/textes, domain/administration (type),
 * hooks/useAdministrationService, hooks/useChargement, EtatSection, Admin.module.css.
 */
import { useCallback } from 'react';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { JoueurAdmin } from '../../domain/administration';
import { useAdministrationService } from '../../hooks/useAdministrationService';
import { useChargement } from '../../hooks/useChargement';
import styles from './Admin.module.css';
import { EtatSection } from './EtatSection';

/** Texte « 12 cartes (7 différentes) ». */
function texteCartes(joueur: JoueurAdmin): string {
  const textes = TEXTES.admin.joueurs.cartes;
  if (joueur.nombreCartes === 0) return textes.aucune;
  return remplir(joueur.nombreCartes === 1 ? textes.une : textes.plusieurs, {
    nombre: String(joueur.nombreCartes),
    differentes: String(joueur.cartesDistinctes),
  });
}

/** Liste des joueurs. */
export function SectionJoueurs() {
  const textes = TEXTES.admin.joueurs;
  const service = useAdministrationService();
  const lire = useCallback(() => service.listerJoueurs(), [service]);
  const { etat, recharger } = useChargement(lire);

  return (
    <EtatSection etat={etat} onReessayer={recharger}>
      {(joueurs) => (
        <section className={styles.formulaire}>
          <h2 className={styles.sousTitre}>
            {remplir(joueurs.length > 1 ? textes.total.plusieurs : textes.total.un, {
              nombre: String(joueurs.length),
            })}
          </h2>
          <p className={styles.aide}>{textes.aide}</p>
          {joueurs.length === 0 && <p className={styles.aide}>{textes.vide}</p>}
          <ul className={styles.joueurs}>
            {joueurs.map((joueur) => (
              <li key={joueur.id} className={styles.joueur}>
                <p className={styles.nomJoueur}>
                  {joueur.pseudo ?? <span className={styles.discret}>{textes.sansPseudo}</span>}
                  {joueur.role === 'admin' && (
                    <span className={styles.badge}>{textes.badgeAdmin}</span>
                  )}
                </p>
                <p className={styles.discret}>{joueur.email}</p>
                <p>{texteCartes(joueur)}</p>
                <p className={styles.discret}>
                  {remplir(textes.inscritLe, {
                    date: new Date(joueur.creeLe).toLocaleDateString('fr-FR'),
                  })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </EtatSection>
  );
}
