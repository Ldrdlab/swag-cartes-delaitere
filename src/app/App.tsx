/**
 * Composant racine : porte de connexion, choix du pseudo, puis navigation.
 *
 * Rôle : tant que le joueur n'est pas connecté, afficher l'écran de connexion. Connecté mais sans pseudo
 * (première visite), afficher l'écran Profil. Ensuite, afficher l'écran correspondant à l'état de la
 * machine à états : les écrans à onglets sont entourés de la barre de navigation (AppShell), le parcours
 * d'ouverture d'un booster est en plein écran. L'ouverture est faite par le SERVEUR (open_booster()).
 * Expose : le composant `App`.
 * Dépend de : app/useFlow, app/flowMachine, boosters/catalogue, components/AppShell, hooks/useAuth,
 * hooks/useBoosterService, hooks/useViewportHeight, services/erreurs, screens/*.
 */
import { getBoosterAt } from '../boosters/catalogue';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';
import { useBoosterService } from '../hooks/useBoosterService';
import { useViewportHeight } from '../hooks/useViewportHeight';
import { ErreurService } from '../services/erreurs';
import { AdminScreen } from '../screens/Admin';
import { BoosterConfirmScreen } from '../screens/BoosterConfirm';
import { BoosterOpeningScreen } from '../screens/BoosterOpening';
import { BoosterSelectScreen } from '../screens/BoosterSelect';
import { CardRevealScreen } from '../screens/CardReveal';
import { CollectionScreen } from '../screens/Collection';
import { InstallerScreen } from '../screens/Installer';
import { JouerScreen } from '../screens/Jouer';
import { LoginScreen } from '../screens/Login';
import { ProfileScreen } from '../screens/Profile';
import { WelcomeScreen } from '../screens/Welcome';
import { estOnglet } from './flowMachine';
import { useFlow } from './useFlow';

/** Composant racine de l'application. */
export function App() {
  useViewportHeight();
  const { etat, seDeconnecter, rafraichir } = useAuth();

  if (etat.statut !== 'connecte') return <LoginScreen etat={etat} />;
  // Première connexion : le joueur choisit son avatar et son pseudo avant d'entrer.
  if (etat.profil.pseudo === null) return <ProfileScreen onDone={() => void rafraichir()} />;
  return (
    <Parcours
      estAdmin={etat.profil.role === 'admin'}
      onLogout={() => void seDeconnecter()}
      onProfilModifie={() => void rafraichir()}
    />
  );
}

interface ParcoursProps {
  /** Vrai si le compte connecté est administrateur (propose l'onglet Admin). */
  estAdmin: boolean;
  /** Ferme la session. */
  onLogout: () => void;
  /** Prévient l'appli que le pseudo ou l'avatar a changé (relit le profil). */
  onProfilModifie: () => void;
}

/** Parcours du joueur connecté : onglets, profil, choix du booster, ouverture, révélation. */
function Parcours({ estAdmin, onLogout, onProfilModifie }: ParcoursProps) {
  const { state, send } = useFlow();
  const boosters = useBoosterService();

  /** Écran courant (sans la barre d'onglets). */
  const ecran = (() => {
    switch (state.screen) {
      case 'HOME':
        return (
          <WelcomeScreen
            onStart={() => send({ type: 'START' })}
            onOpenProfile={() => send({ type: 'OPEN_PROFILE' })}
            onLogout={onLogout}
          />
        );
      case 'COLLECTION':
        return <CollectionScreen />;
      case 'JOUER':
        return <JouerScreen />;
      case 'INSTALLER':
        return <InstallerScreen />;
      case 'ADMIN':
        return <AdminScreen />;
      case 'PROFILE':
        return (
          <ProfileScreen
            onDone={() => {
              onProfilModifie();
              send({ type: 'PROFILE_DONE' });
            }}
          />
        );
      case 'BOOSTER_SELECT':
        return (
          <BoosterSelectScreen
            initialIndex={state.selectedBoosterIndex}
            onChoose={(boosterIndex) => send({ type: 'BOOSTER_CHOSEN', boosterIndex })}
            onBack={() => send({ type: 'LEAVE_SELECT' })}
          />
        );
      case 'BOOSTER_CONFIRM':
        return (
          <BoosterConfirmScreen
            booster={getBoosterAt(state.selectedBoosterIndex)}
            erreur={state.erreurOuverture}
            onOpen={() => send({ type: 'OPEN_CONFIRMED' })}
            onBack={() => send({ type: 'BACK' })}
          />
        );
      case 'BOOSTER_OPENING': {
        const booster = getBoosterAt(state.selectedBoosterIndex);
        return (
          <BoosterOpeningScreen
            booster={booster}
            // Le tirage est fait par le serveur au moment où le booster est réellement ouvert.
            onOpened={() => {
              boosters.ouvrir(booster.theme.id).then(
                (resultat) => send({ type: 'OPENING_DONE', cards: resultat.cartes }),
                (erreur: unknown) =>
                  send({
                    type: 'OPENING_FAILED',
                    code: erreur instanceof ErreurService ? erreur.code : 'inconnue',
                  }),
              );
            }}
          />
        );
      }
      case 'CARD_REVEAL':
        return (
          <CardRevealScreen
            cards={state.drawnCards}
            booster={getBoosterAt(state.selectedBoosterIndex)}
            onOpenAnother={() => send({ type: 'OPEN_ANOTHER' })}
            onHome={() => send({ type: 'GO_HOME' })}
          />
        );
    }
  })();

  if (!estOnglet(state.screen)) return ecran;
  return (
    <AppShell
      onglet={state.screen}
      estAdmin={estAdmin}
      onNaviguer={(tab) => send({ type: 'GO_TAB', tab })}
    >
      {ecran}
    </AppShell>
  );
}
