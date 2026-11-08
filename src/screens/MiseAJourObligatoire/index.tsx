/**
 * Écran « Mise à jour obligatoire ».
 *
 * Rôle : bloquer l'appli quand sa version est plus ancienne que la « version minimum requise » réglée par
 * l'administrateur. Un seul bouton : « Mettre à jour », qui récupère la dernière version publiée.
 * Expose : le composant `MiseAJourObligatoireScreen`.
 * Dépend de : react, app/pwa, components/Button, components/ScreenLayout, config/version,
 * content/formatTexte, content/textes.
 */
import { useState } from 'react';
import { forcerMiseAJour } from '../../app/pwa';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { VERSION_APPLI } from '../../config/version';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';

interface MiseAJourObligatoireScreenProps {
  /** Version minimum requise (affichée pour que le joueur comprenne). */
  versionMin: string | null;
}

/** Écran bloquant de mise à jour. */
export function MiseAJourObligatoireScreen({ versionMin }: MiseAJourObligatoireScreenProps) {
  const textes = TEXTES.miseAJour;
  const [enCours, setEnCours] = useState(false);

  return (
    <ScreenLayout
      title={textes.titreObligatoire}
      footer={
        <Button
          disabled={enCours}
          onClick={() => {
            setEnCours(true);
            void forcerMiseAJour();
          }}
        >
          {enCours ? textes.enCours : textes.boutonMettreAJour}
        </Button>
      }
    >
      <p>{textes.texteObligatoire}</p>
      <p>
        {remplir(textes.versions, {
          actuelle: VERSION_APPLI,
          requise: versionMin ?? '?',
        })}
      </p>
    </ScreenLayout>
  );
}
