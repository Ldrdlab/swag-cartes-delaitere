/**
 * Page « Installer l'appli ».
 *
 * Rôle : expliquer simplement comment installer SWAG sur Android (Chrome), iPhone / iPad (Safari) et
 * ordinateur (Chrome, Edge). Les étapes de l'appareil utilisé passent en premier. Si le navigateur
 * propose l'installation en un clic, un bouton la lance ; si l'appli est déjà installée, on le dit.
 * Expose : le composant `InstallerScreen`.
 * Dépend de : components/Button, components/PageOnglet, content/textes, domain/plateforme (type),
 * hooks/useInstallation, Installer.module.css.
 */
import { Button } from '../../components/Button';
import { PageOnglet } from '../../components/PageOnglet';
import { TEXTES } from '../../content/textes';
import type { Plateforme } from '../../domain/plateforme';
import { useInstallation } from '../../hooks/useInstallation';
import styles from './Installer.module.css';

/** Ordre d'affichage : l'appareil de l'utilisateur d'abord, puis les autres. */
function ordre(plateforme: Plateforme): Plateforme[] {
  const toutes: Plateforme[] = ['android', 'ios', 'bureau'];
  return [plateforme, ...toutes.filter((p) => p !== plateforme)];
}

/** Explications d'installation. */
export function InstallerScreen() {
  const textes = TEXTES.installer;
  const installation = useInstallation();

  return (
    <PageOnglet titre={textes.titre}>
      <p className={styles.intro}>{textes.intro}</p>

      {installation.installee && (
        <p className={styles.succes} role="status">
          {textes.dejaInstallee}
        </p>
      )}
      {installation.installable && !installation.installee && (
        <div>
          <Button onClick={() => void installation.installer()}>{textes.boutonInstaller}</Button>
        </div>
      )}

      <div className={styles.liste}>
        {ordre(installation.plateforme).map((cle) => {
          const section = textes[cle];
          return (
            <section key={cle} className={styles.section} aria-labelledby={`installer-${cle}`}>
              <h2 id={`installer-${cle}`} className={styles.titreSection}>
                {section.titre}
                {cle === installation.plateforme && (
                  <span className={styles.badge}>{textes.badgeAppareil}</span>
                )}
              </h2>
              <ol className={styles.etapes}>
                {section.etapes.map((etape) => (
                  <li key={etape}>{etape}</li>
                ))}
              </ol>
              {cle === 'ios' && <p className={styles.remarque}>{textes.ios.remarque}</p>}
            </section>
          );
        })}
      </div>
    </PageOnglet>
  );
}
