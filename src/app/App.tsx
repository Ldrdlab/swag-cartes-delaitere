/**
 * Composant racine : porte de connexion puis routeur d'écrans.
 *
 * Rôle : tant que le joueur n'est pas connecté, afficher l'écran de connexion (ou « chargement » /
 * « erreur »). Une fois connecté, afficher l'écran correspondant à l'état de la machine à états et lui
 * relayer les événements. L'écran Administration n'est proposé qu'aux comptes dont le rôle est « admin ».
 * Expose : le composant `App`.
 * Dépend de : app/useFlow, boosters/catalogue, config/game, data/cards, domain/drawCards,
 * hooks/useAuth, hooks/useViewportHeight, screens/* (dont Login et Admin).
 */
import { getBoosterAt, versBoosterTirage } from '../boosters/catalogue';
import { CARDS_PER_BOOSTER, RARITY_WEIGHTS } from '../config/game';
import { CARDS } from '../data/cards';
import { drawCards } from '../domain/drawCards';
import { useAuth } from '../hooks/useAuth';
import { useViewportHeight } from '../hooks/useViewportHeight';
import { AdminScreen } from '../screens/Admin';
import { BoosterConfirmScreen } from '../screens/BoosterConfirm';
import { BoosterOpeningScreen } from '../screens/BoosterOpening';
import { BoosterSelectScreen } from '../screens/BoosterSelect';
import { CardRevealScreen } from '../screens/CardReveal';
import { LoginScreen } from '../screens/Login';
import { ProfileScreen } from '../screens/Profile';
import { WelcomeScreen } from '../screens/Welcome';
import { useFlow } from './useFlow';

/** Composant racine de l'application. */
export function App() {
  useViewportHeight();
  const { etat, seDeconnecter } = useAuth();

  if (etat.statut !== 'connecte') return <LoginScreen etat={etat} />;
  return <Parcours estAdmin={etat.profil.role === 'admin'} onLogout={() => void seDeconnecter()} />;
}

interface ParcoursProps {
  /** Vrai si le compte connecté est administrateur (propose l'écran Administration). */
  estAdmin: boolean;
  /** Ferme la session. */
  onLogout: () => void;
}

/** Parcours du joueur connecté : accueil, profil, choix du booster, ouverture, révélation. */
function Parcours({ estAdmin, onLogout }: ParcoursProps) {
  const { state, send } = useFlow();

  switch (state.screen) {
    case 'WELCOME':
      return (
        <WelcomeScreen
          onStart={() => send({ type: 'START' })}
          {...(estAdmin ? { onOpenAdmin: () => send({ type: 'OPEN_ADMIN' }) } : {})}
          onLogout={onLogout}
        />
      );
    case 'ADMIN':
      return <AdminScreen onBack={() => send({ type: 'CLOSE_ADMIN' })} />;
    case 'PROFILE':
      return <ProfileScreen onDone={() => send({ type: 'PROFILE_DONE' })} />;
    case 'BOOSTER_SELECT':
      return (
        <BoosterSelectScreen
          initialIndex={state.selectedBoosterIndex}
          onChoose={(boosterIndex) => send({ type: 'BOOSTER_CHOSEN', boosterIndex })}
        />
      );
    case 'BOOSTER_CONFIRM':
      return (
        <BoosterConfirmScreen
          booster={getBoosterAt(state.selectedBoosterIndex)}
          onOpen={() => send({ type: 'OPEN_CONFIRMED' })}
          onBack={() => send({ type: 'BACK' })}
        />
      );
    case 'BOOSTER_OPENING': {
      const booster = getBoosterAt(state.selectedBoosterIndex);
      return (
        <BoosterOpeningScreen
          booster={booster}
          // Le tirage a lieu au moment où le booster est réellement ouvert.
          // (Temporaire : il passera côté serveur, par la fonction open_booster(), en phase 4.)
          onOpened={() =>
            send({
              type: 'OPENING_DONE',
              cards: drawCards(
                versBoosterTirage(booster),
                CARDS,
                CARDS_PER_BOOSTER,
                RARITY_WEIGHTS,
              ),
            })
          }
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
}
